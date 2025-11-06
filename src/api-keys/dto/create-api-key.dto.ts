import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({
    example: 1,
    description: 'User ID who owns this API key',
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({
    example: 'My App API Key',
    description: 'API key name/label',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'API key for mobile app',
    description: 'Optional description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'free',
    enum: ['free', 'premium'],
    description: 'API tier',
    default: 'free',
  })
  @IsOptional()
  @IsEnum(['free', 'premium'])
  tier?: string;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Rate limit (requests per day)',
    default: 1000,
  })
  @IsOptional()
  @IsNumber()
  rateLimit?: number;

  @ApiPropertyOptional({
    example: '2025-12-31T23:59:59Z',
    description: 'When the key expires',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
