import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOAuthClientDto {
  @ApiProperty({
    example: 1,
    description: 'User ID who owns this OAuth client',
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({
    example: 'My Mobile App',
    description: 'Client application name',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'OAuth client for mobile application',
    description: 'Optional description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: ['read:foods', 'read:categories'],
    description: 'Allowed scopes for this client',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  // Note: tier and rateLimit are now system-controlled based on user's account settings
  // Admins can manage these via user management endpoints
}
