import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category } from '../../categories/domain/category';
import { FileType } from '../../files/domain/file';
import { Nutrient } from '../../nutrients/domain/nutrient';

export class Food {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: String,
    example: 'KE001',
    description: 'Unique food code',
  })
  code: string;

  @ApiProperty({
    type: String,
    example: 'Ugali (Maize meal)',
    description: 'Food name',
  })
  name: string;

  @ApiProperty({
    type: () => Category,
    description: 'Food category',
  })
  category: Category;

  @ApiPropertyOptional({
    type: String,
    example: 'Traditional Kenyan staple made from maize flour',
    description: 'Food description',
  })
  description?: string | null;

  @ApiPropertyOptional({
    type: () => FileType,
    description: 'Food image',
  })
  image?: FileType | null;

  @ApiPropertyOptional({
    type: String,
    example: '100',
    description: 'Serving size amount',
  })
  servingSize?: string | null;

  @ApiPropertyOptional({
    type: String,
    example: 'grams',
    description: 'Serving size unit',
  })
  servingUnit?: string | null;

  @ApiPropertyOptional({
    type: () => Nutrient,
    description: 'Nutritional information for this food',
  })
  nutrients?: Nutrient | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt?: Date | null;
}
