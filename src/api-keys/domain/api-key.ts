import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/domain/user';

export class ApiKey {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: Number,
    description: 'User ID who owns this API key',
  })
  userId: number;

  @ApiPropertyOptional({
    type: () => User,
  })
  user?: User | null;

  @ApiProperty({
    type: String,
    example: 'My App API Key',
    description: 'API key name/label',
  })
  name: string;

  @ApiProperty({
    type: String,
    example: '$2b$10$...',
    description: 'Hashed API key',
  })
  keyHash: string;

  @ApiProperty({
    type: String,
    example: 'kfdb_live_abc123',
    description: 'Key prefix for display',
  })
  keyPrefix: string;

  @ApiPropertyOptional({
    type: String,
    example: 'API key for mobile app',
    description: 'Optional description',
  })
  description?: string | null;

  @ApiProperty({
    type: String,
    enum: ['active', 'revoked', 'expired'],
    example: 'active',
    description: 'API key status',
  })
  status: string;

  @ApiProperty({
    type: String,
    enum: ['free', 'premium'],
    example: 'free',
    description: 'API tier',
  })
  tier: string;

  @ApiProperty({
    type: Number,
    example: 1000,
    description: 'Rate limit (requests per day)',
  })
  rateLimit: number;

  @ApiPropertyOptional({
    type: Date,
    description: 'When the key expires',
  })
  expiresAt?: Date | null;

  @ApiPropertyOptional({
    type: Date,
    description: 'Last time the key was used',
  })
  lastUsedAt?: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt?: Date | null;
}
