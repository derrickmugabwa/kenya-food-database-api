import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateFoodDto {
  @ApiProperty({
    example: 'KE001',
    description: 'Unique food code',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    example: 'Ugali (Maize meal)',
    description: 'Food name',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 1,
    description: 'Category ID',
  })
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @ApiPropertyOptional({
    example: 'Traditional Kenyan staple made from maize flour',
    description: 'Food description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'uuid-of-image-file',
    description: 'Image file ID',
  })
  @IsOptional()
  @IsString()
  imageId?: string;

  @ApiPropertyOptional({
    example: '100',
    description: 'Serving size amount',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  servingSize?: string;

  @ApiPropertyOptional({
    example: 'grams',
    description: 'Serving size unit',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  servingUnit?: string;
}
