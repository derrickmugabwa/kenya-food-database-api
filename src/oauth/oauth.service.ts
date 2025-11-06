import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuthClientRelationalRepository } from './infrastructure/persistence/relational/repositories/oauth-client.repository';
import { OAuthTokenRelationalRepository } from './infrastructure/persistence/relational/repositories/oauth-token.repository';
import { TokenRequestDto } from './dto/token-request.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { CreateOAuthClientDto } from './dto/create-oauth-client.dto';
import { UpdateOAuthClientDto } from './dto/update-oauth-client.dto';
import { OAuthClient } from './domain/oauth-client';
import { DEFAULT_SCOPES } from './constants/scopes';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { UsersService } from '../users/users.service';

@Injectable()
export class OAuthService {
  constructor(
    private readonly oauthClientRepository: OAuthClientRelationalRepository,
    private readonly oauthTokenRepository: OAuthTokenRelationalRepository,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async issueToken(dto: TokenRequestDto): Promise<TokenResponseDto> {
    // 1. Validate grant type
    if (dto.grant_type !== 'client_credentials') {
      throw new BadRequestException('Unsupported grant type');
    }

    // 2. Validate client credentials
    const client = await this.validateClient(dto.client_id, dto.client_secret);

    // 3. Use scopes defined during client creation
    const scopes = client.scopes;

    // 4. Generate access token (JWT)
    const payload = {
      sub: client.clientId,
      client_id: client.clientId,
      user_id: client.userId, // Add userId for per-user rate limiting
      scopes: scopes,
      tier: client.tier,
      rate_limit: client.rateLimit,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
      issuer: 'kenya-food-db',
      audience: 'api',
    });

    // 5. Store token in database
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour
    await this.oauthTokenRepository.create({
      accessToken,
      clientId: client.clientId,
      scopes: scopes,
      expiresAt,
      revoked: false,
    } as any);

    // 6. Return token response
    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: scopes.join(' '),
    };
  }

  private async validateClient(
    clientId: string,
    clientSecret: string,
  ): Promise<OAuthClient> {
    const client = await this.oauthClientRepository.findByClientId(clientId);

    if (!client) {
      throw new UnauthorizedException('Invalid client credentials');
    }

    if (client.status !== 'active') {
      throw new UnauthorizedException('Client is not active');
    }

    if (client.expiresAt && new Date(client.expiresAt) < new Date()) {
      throw new UnauthorizedException('Client credentials have expired');
    }

    // Verify client secret
    if (!client.clientSecretHash) {
      throw new UnauthorizedException('Invalid client credentials');
    }

    const isValidSecret = await bcrypt.compare(
      clientSecret,
      client.clientSecretHash,
    );

    if (!isValidSecret) {
      throw new UnauthorizedException('Invalid client credentials');
    }

    return client;
  }

  async revokeToken(accessToken: string): Promise<void> {
    await this.oauthTokenRepository.revokeToken(accessToken);
  }

  // OAuth Client Management
  async createClient(
    createDto: CreateOAuthClientDto,
  ): Promise<{ client: OAuthClient; clientSecret: string }> {
    // Get user to determine tier and rate limit
    const user = await this.usersService.findById(createDto.userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate client ID and secret
    const clientId = this.generateClientId();
    const clientSecret = this.generateClientSecret();
    const clientSecretHash = await bcrypt.hash(clientSecret, 10);

    // Inherit tier and rate limit from user account settings
    const tier = user.apiTier || 'free';
    const rateLimit = user.apiRateLimit || 1000;

    const clientData: Partial<OAuthClient> = {
      clientId,
      clientSecretHash,
      name: createDto.name,
      description: createDto.description,
      userId: createDto.userId,
      scopes: createDto.scopes || DEFAULT_SCOPES,
      grantTypes: ['client_credentials'],
      tier, // Inherited from user
      rateLimit, // Inherited from user
      status: 'active',
      expiresAt: null,
    };

    const client = await this.oauthClientRepository.create(
      clientData as OAuthClient,
    );

    // Return plain secret only once
    return {
      client,
      clientSecret,
    };
  }

  async findAllClients({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<OAuthClient[]> {
    return this.oauthClientRepository.findAllWithPagination({
      paginationOptions,
    });
  }

  async findClientById(id: number): Promise<OAuthClient | null> {
    return this.oauthClientRepository.findById(id);
  }

  async findClientsByUserId(
    userId: number,
    {
      paginationOptions,
    }: {
      paginationOptions: IPaginationOptions;
    },
  ): Promise<OAuthClient[]> {
    return this.oauthClientRepository.findByUserId(userId, {
      paginationOptions,
    });
  }

  async updateClient(
    id: number,
    updateDto: UpdateOAuthClientDto,
  ): Promise<OAuthClient | null> {
    return this.oauthClientRepository.update(id, updateDto as any);
  }

  async removeClient(id: number): Promise<void> {
    await this.oauthClientRepository.remove(id);
  }

  private generateClientId(): string {
    const prefix = 'kfdb_client_';
    const randomBytes =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    return prefix + randomBytes;
  }

  private generateClientSecret(): string {
    const randomBytes =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    return randomBytes;
  }
}
