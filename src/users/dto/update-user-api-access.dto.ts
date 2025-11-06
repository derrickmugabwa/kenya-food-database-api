import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdateUserApiAccessDto {
  @ApiPropertyOptional({
    example: 'premium',
    enum: ['free', 'basic', 'premium', 'enterprise'],
    description: 'API access tier for the user',
  })
  @IsOptional()
  @IsEnum(['free', 'basic', 'premium', 'enterprise'])
  apiTier?: string;

  @ApiPropertyOptional({
    example: 10000,
    description: 'API rate limit (requests per day)',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  apiRateLimit?: number;
}
