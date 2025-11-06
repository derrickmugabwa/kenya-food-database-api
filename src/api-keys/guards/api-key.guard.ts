import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeysService } from '../api-keys.service';
import { UsageLogsService } from '../../usage-logs/usage-logs.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apiKeysService: ApiKeysService,
    private readonly usageLogsService: UsageLogsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. Extract API key from header
    const apiKey = this.extractApiKey(request);
    if (!apiKey) {
      throw new UnauthorizedException({
        statusCode: 401,
        message:
          'API key is required. Please provide your API key in the x-api-key header.',
        error: 'Unauthorized',
      });
    }

    // 2. Validate API key format
    if (!this.isValidFormat(apiKey)) {
      throw new UnauthorizedException({
        statusCode: 401,
        message:
          'Invalid API key format. Expected format: kfdb_live_xxxxxxxxxxxxx',
        error: 'Unauthorized',
      });
    }

    // 3. Find all active API keys and verify
    const validApiKey = await this.verifyApiKey(apiKey);
    if (!validApiKey) {
      throw new UnauthorizedException({
        statusCode: 401,
        message:
          'Invalid API key. The provided key does not exist or has been revoked.',
        error: 'Unauthorized',
      });
    }

    // 4. Check expiration
    if (validApiKey.expiresAt && new Date(validApiKey.expiresAt) < new Date()) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'API key has expired. Please generate a new API key.',
        error: 'Unauthorized',
      });
    }

    // 5. Attach API key to request for later use
    request.apiKey = validApiKey;

    // 6. Track usage (fire and forget)
    this.trackUsage(request, validApiKey.id);

    return true;
  }

  private extractApiKey(request: any): string | null {
    // Check x-api-key header
    const headerKey = request.headers['x-api-key'];
    if (headerKey && headerKey.trim()) {
      return headerKey.trim();
    }

    // Check Authorization header (Bearer token format)
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token) {
        return token;
      }
    }

    return null;
  }

  private isValidFormat(apiKey: string): boolean {
    // Format: kfdb_live_xxxxxxxxxxxxx (at least 20 characters)
    return /^kfdb_live_[a-z0-9]{10,}$/i.test(apiKey);
  }

  private async verifyApiKey(plainKey: string): Promise<any> {
    // Get all API keys (we need to check all since we can't query by hash)
    // In production, consider caching active keys or using a more efficient lookup
    const allKeys = await this.apiKeysService.findAllWithPagination({
      paginationOptions: { page: 1, limit: 1000 },
    });

    // The response is an array directly, not wrapped in data property
    const keys = Array.isArray(allKeys) ? allKeys : [];

    // Check each key by comparing hashes
    for (const key of keys) {
      if (key.status !== 'active') continue;

      const isMatch = await bcrypt.compare(plainKey, key.keyHash);
      if (isMatch) {
        // Update last used timestamp
        await this.apiKeysService.update(key.id, {
          lastUsedAt: new Date().toISOString(),
        } as any);

        return key;
      }
    }

    return null;
  }

  private trackUsage(request: any, apiKeyId: number): void {
    const startTime = Date.now();

    // Log after response is sent
    request.res.on('finish', async () => {
      const responseTime = Date.now() - startTime;

      try {
        await this.usageLogsService.create({
          apiKeyId,
          endpoint: request.url,
          method: request.method,
          ipAddress: request.ip || request.connection.remoteAddress,
          userAgent: request.headers['user-agent'],
          statusCode: request.res.statusCode,
          responseTime,
        });
      } catch (error) {
        console.error('Failed to log usage:', error);
      }
    });
  }
}
