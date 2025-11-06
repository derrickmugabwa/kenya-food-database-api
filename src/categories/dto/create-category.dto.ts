import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Cereals & Grains',
    description: 'Category name',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Staple foods including rice, maize, wheat' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/icons/cereals.png',
    description: 'URL to category icon',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  iconUrl?: string;
}
