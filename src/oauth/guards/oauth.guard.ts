import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { OAuthTokenRelationalRepository } from '../infrastructure/persistence/relational/repositories/oauth-token.repository';
import { OAuthClientRelationalRepository } from '../infrastructure/persistence/relational/repositories/oauth-client.repository';
import { UsageLogsService } from '../../usage-logs/usage-logs.service';

@Injectable()
export class OAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly oauthTokenRepository: OAuthTokenRelationalRepository,
    private readonly oauthClientRepository: OAuthClientRelationalRepository,
    private readonly reflector: Reflector,
    private readonly usageLogsService: UsageLogsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. Extract Bearer token
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException({
        statusCode: 401,
        message:
          'Access token is required. Please provide a Bearer token in the Authorization header.',
        error: 'Unauthorized',
      });
    }

    // 2. Verify JWT signature and decode
    let payload;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        issuer: 'kenya-food-db',
        audience: 'api',
      });
    } catch {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid or expired access token.',
        error: 'Unauthorized',
      });
    }

    // 3. Check token in database (not revoked)
    const tokenRecord =
      await this.oauthTokenRepository.findByAccessToken(token);

    if (!tokenRecord) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Token not found in database.',
        error: 'Unauthorized',
      });
    }

    if (tokenRecord.revoked) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Token has been revoked.',
        error: 'Unauthorized',
      });
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Token has expired.',
        error: 'Unauthorized',
      });
    }

    // 4. Check required scopes
    const requiredScopes = this.reflector.get<string[]>(
      'scopes',
      context.getHandler(),
    );

    if (requiredScopes && requiredScopes.length > 0) {
      const hasScope = requiredScopes.some((scope) =>
        payload.scopes.includes(scope),
      );

      if (!hasScope) {
        throw new ForbiddenException({
          statusCode: 403,
          message: `Insufficient scope. Required: ${requiredScopes.join(' or ')}`,
          error: 'Forbidden',
        });
      }
    }

    // 5. Attach client info to request
    request.oauth = {
      clientId: payload.client_id,
      userId: payload.user_id, // Add userId for per-user rate limiting
      scopes: payload.scopes,
      tier: payload.tier,
      rateLimit: payload.rate_limit,
      tokenId: tokenRecord.id,
    };

    // 6. Log usage asynchronously (fire and forget)
    void this.trackUsage(request, tokenRecord.clientId);

    return true;
  }

  private async trackUsage(request: any, clientId: string): Promise<void> {
    // Log usage asynchronously without blocking the request
    try {
      // Fetch OAuth client to get its database ID
      const oauthClient =
        await this.oauthClientRepository.findByClientId(clientId);

      console.log('OAuth Client ID (string):', clientId);
      console.log('OAuth Client found:', oauthClient?.id);

      await this.usageLogsService.create({
        apiKeyId: oauthClient?.id, // Store OAuth client's database ID
        endpoint: request.url,
        method: request.method,
        ipAddress: request.ip || request.connection?.remoteAddress,
        userAgent: request.headers['user-agent'] || `OAuth:${clientId}`,
        responseTime: 0,
        statusCode: 200,
      });

      console.log('Usage log created with apiKeyId:', oauthClient?.id);
    } catch (error) {
      console.error('Failed to log OAuth usage:', error);
    }
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }
    return null;
  }
}
