import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Nutrient {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: Number,
    description: 'Food ID this nutrient belongs to',
  })
  foodId: number;

  @ApiPropertyOptional({
    type: Number,
    example: 365,
    description: 'Energy in kcal per 100g',
  })
  energyKcal?: number | null;

  @ApiPropertyOptional({
    type: Number,
    example: 8.5,
    description: 'Protein in grams per 100g',
  })
  proteinG?: number | null;

  @ApiPropertyOptional({
    type: Number,
    example: 3.2,
    description: 'Fat in grams per 100g',
  })
  fatG?: number | null;

  @ApiPropertyOptional({
    type: Number,
    example: 77.8,
    description: 'Carbohydrates in grams per 100g',
  })
  carbohydratesG?: number | null;

  @ApiPropertyOptional({
    type: Number,
    example: 2.1,
    description: 'Fiber in grams per 100g',
  })
  fiberG?: number | null;

  @ApiPropertyOptional({
    type: Number,
    example: 0.5,
    description: 'Sugar in grams per 100g',
  })
  sugarG?: number | null;

  @ApiPropertyOptional({
    type: Number,
    example: 28,
    description: 'Calcium in mg per 100g',
  })
  calciumMg?: number | null;

  @ApiPropertyOptional({
    type: Number,
    example: 2.8,
    description: 'Iron in mg per 100g',
  })
  ironMg?: number | null;

  @ApiPropertyOptional({
    type: Number,
    example: 0,
    description: 'Vitamin A in mcg per 100g',
  })
  vitaminAMcg?: number | null;

  @ApiPropertyOptional({
    type: Number,
    example: 0,
    description: 'Vitamin C in mg per 100g',
  })
  vitaminCMg?: number | null;

  @ApiPropertyOptional({
    type: Number,
    example: 5,
    description: 'Sodium in mg per 100g',
  })
  sodiumMg?: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
