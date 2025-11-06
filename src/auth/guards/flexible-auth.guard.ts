import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ApiKeysService } from '../../api-keys/api-keys.service';
import { OAuthTokenRelationalRepository } from '../../oauth/infrastructure/persistence/relational/repositories/oauth-token.repository';
import { OAuthClientRelationalRepository } from '../../oauth/infrastructure/persistence/relational/repositories/oauth-client.repository';
import { UsageLogsService } from '../../usage-logs/usage-logs.service';
import * as bcrypt from 'bcrypt';

/**
 * FlexibleAuthGuard - Accepts multiple authentication methods:
 * 1. JWT Session Token (for logged-in users, especially admins)
 * 2. OAuth Token (for API consumers)
 * 3. API Key (for simple API access)
 *
 * This allows admins to use their session tokens for GET requests
 * while still supporting public API access via OAuth/API keys.
 */
@Injectable()
export class FlexibleAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly apiKeysService: ApiKeysService,
    private readonly oauthTokenRepository: OAuthTokenRelationalRepository,
    private readonly oauthClientRepository: OAuthClientRelationalRepository,
    private readonly usageLogsService: UsageLogsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Try authentication methods in order of preference
    // 1. Try JWT Session Token first (for admin users)
    const jwtResult = await this.tryJwtAuth(request);
    if (jwtResult.success) {
      request.user = jwtResult.user;
      request.authMethod = 'jwt';
      return true;
    }

    // 2. Try OAuth Token
    const oauthResult = await this.tryOAuthAuth(request);
    if (oauthResult.success) {
      request.oauth = oauthResult.oauth;
      request.authMethod = 'oauth';

      // Check required scopes for OAuth
      const requiredScopes = this.reflector.get<string[]>(
        'scopes',
        context.getHandler(),
      );

      if (requiredScopes && requiredScopes.length > 0) {
        const hasScope = requiredScopes.some((scope) =>
          oauthResult.oauth.scopes.includes(scope),
        );

        if (!hasScope) {
          throw new UnauthorizedException({
            statusCode: 403,
            message: `Insufficient scope. Required: ${requiredScopes.join(' or ')}`,
            error: 'Forbidden',
          });
        }
      }

      // Log OAuth usage
      this.trackOAuthUsage(request, oauthResult.oauth.clientId);

      return true;
    }

    // 3. Try API Key
    const apiKeyResult = await this.tryApiKeyAuth(request);
    if (apiKeyResult.success) {
      request.apiKey = apiKeyResult.apiKey;
      request.authMethod = 'api-key';
      return true;
    }

    // No valid authentication found
    throw new UnauthorizedException({
      statusCode: 401,
      message:
        'Authentication required. Please provide a valid JWT token, OAuth token, or API key.',
      error: 'Unauthorized',
    });
  }

  /**
   * Try to authenticate using JWT session token
   */
  private async tryJwtAuth(
    request: any,
  ): Promise<{ success: boolean; user?: any }> {
    try {
      const token = this.extractBearerToken(request);
      if (!token) {
        return { success: false };
      }

      // Try to verify as JWT (not OAuth token)
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.AUTH_JWT_SECRET,
      });

      // JWT tokens have 'id' field, OAuth tokens have 'client_id'
      if (payload.id && !payload.client_id) {
        // This is a valid JWT session token
        return {
          success: true,
          user: payload,
        };
      }

      return { success: false };
    } catch {
      return { success: false };
    }
  }

  /**
   * Try to authenticate using OAuth token
   */
  private async tryOAuthAuth(
    request: any,
  ): Promise<{ success: boolean; oauth?: any }> {
    try {
      const token = this.extractBearerToken(request);
      if (!token) {
        return { success: false };
      }

      // Verify JWT signature for OAuth
      const payload = await this.jwtService.verifyAsync(token, {
        issuer: 'kenya-food-db',
        audience: 'api',
      });

      // OAuth tokens have 'client_id' field
      if (!payload.client_id) {
        return { success: false };
      }

      // Check token in database
      const tokenRecord =
        await this.oauthTokenRepository.findByAccessToken(token);

      if (
        !tokenRecord ||
        tokenRecord.revoked ||
        tokenRecord.expiresAt < new Date()
      ) {
        return { success: false };
      }

      return {
        success: true,
        oauth: {
          clientId: payload.client_id,
          userId: payload.user_id,
          scopes: payload.scopes,
          tier: payload.tier,
          rateLimit: payload.rate_limit,
          tokenId: tokenRecord.id,
        },
      };
    } catch {
      return { success: false };
    }
  }

  /**
   * Try to authenticate using API key
   */
  private async tryApiKeyAuth(
    request: any,
  ): Promise<{ success: boolean; apiKey?: any }> {
    try {
      const apiKey = this.extractApiKey(request);
      if (!apiKey) {
        return { success: false };
      }

      // Validate format
      if (!this.isValidApiKeyFormat(apiKey)) {
        return { success: false };
      }

      // Verify API key
      const validApiKey = await this.verifyApiKey(apiKey);
      if (!validApiKey) {
        return { success: false };
      }

      // Check expiration
      if (
        validApiKey.expiresAt &&
        new Date(validApiKey.expiresAt) < new Date()
      ) {
        return { success: false };
      }

      return {
        success: true,
        apiKey: validApiKey,
      };
    } catch {
      return { success: false };
    }
  }

  private extractBearerToken(request: any): string | null {
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }
    return null;
  }

  private extractApiKey(request: any): string | null {
    // Check x-api-key header
    const headerKey = request.headers['x-api-key'];
    if (headerKey && headerKey.trim()) {
      return headerKey.trim();
    }

    // Check Authorization header if it's not a Bearer token
    const authHeader = request.headers['authorization'];
    if (authHeader && !authHeader.startsWith('Bearer ')) {
      return authHeader.trim();
    }

    return null;
  }

  private isValidApiKeyFormat(apiKey: string): boolean {
    return /^kfdb_live_[a-z0-9]{10,}$/i.test(apiKey);
  }

  private async verifyApiKey(plainKey: string): Promise<any> {
    const allKeys = await this.apiKeysService.findAllWithPagination({
      paginationOptions: { page: 1, limit: 1000 },
    });

    const keys = Array.isArray(allKeys) ? allKeys : [];

    for (const key of keys) {
      if (key.status !== 'active') continue;

      const isMatch = await bcrypt.compare(plainKey, key.keyHash);
      if (isMatch) {
        await this.apiKeysService.update(key.id, {
          lastUsedAt: new Date().toISOString(),
        } as any);

        return key;
      }
    }

    return null;
  }

  /**
   * Track OAuth usage by logging to usage_logs table
   */
  private trackOAuthUsage(request: any, clientId: string): void {
    setImmediate(async () => {
      try {
        // Fetch OAuth client to get its database ID
        const oauthClient =
          await this.oauthClientRepository.findByClientId(clientId);

        if (oauthClient) {
          await this.usageLogsService.create({
            apiKeyId: oauthClient.id, // Store OAuth client's database ID
            endpoint: request.url,
            method: request.method,
            ipAddress: request.ip || request.connection?.remoteAddress,
            userAgent: request.headers['user-agent'] || `OAuth:${clientId}`,
            responseTime: 0,
            statusCode: 200,
          });
        }
      } catch (error) {
        console.error('Failed to log OAuth usage in FlexibleAuthGuard:', error);
      }
    });
  }
}
