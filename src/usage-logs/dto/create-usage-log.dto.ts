import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUsageLogDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  apiKeyId?: number;

  @ApiProperty({ example: '/api/v1/foods' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  endpoint: string;

  @ApiProperty({ example: 'GET' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  method: string;

  @ApiPropertyOptional({ example: '192.168.1.1' })
  @IsOptional()
  @IsString()
  @MaxLength(45)
  ipAddress?: string;

  @ApiPropertyOptional({ example: 'Mozilla/5.0...' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  userAgent?: string;

  @ApiProperty({ example: 200 })
  @IsNotEmpty()
  @IsNumber()
  statusCode: number;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsNumber()
  responseTime?: number;
}
