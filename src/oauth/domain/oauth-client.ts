import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/domain/user';

export class OAuthClient {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: String,
    example: 'kfdb_client_abc123xyz',
  })
  clientId: string;

  // Not exposed in API - only used internally
  clientSecretHash?: string;

  @ApiProperty({
    type: String,
    example: 'My Mobile App',
  })
  name: string;

  @ApiPropertyOptional({
    type: String,
    example: 'OAuth client for mobile application',
  })
  description?: string | null;

  @ApiProperty({
    type: Number,
  })
  userId: number;

  @ApiPropertyOptional({
    type: () => User,
  })
  user?: User;

  @ApiProperty({
    type: [String],
    example: ['read:foods', 'read:categories'],
  })
  scopes: string[];

  @ApiProperty({
    type: [String],
    example: ['client_credentials'],
  })
  grantTypes: string[];

  @ApiProperty({
    type: String,
    example: 'free',
    enum: ['free', 'premium'],
  })
  tier: string;

  @ApiProperty({
    type: Number,
    example: 1000,
  })
  rateLimit: number;

  @ApiProperty({
    type: String,
    example: 'active',
    enum: ['active', 'revoked', 'expired'],
  })
  status: string;

  @ApiPropertyOptional({
    type: Date,
  })
  expiresAt?: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt?: Date | null;
}
