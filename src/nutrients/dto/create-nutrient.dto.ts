import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateNutrientDto {
  @ApiProperty({
    example: 1,
    description: 'Food ID',
  })
  @IsNotEmpty()
  @IsNumber()
  foodId: number;

  @ApiPropertyOptional({ example: 365 })
  @IsOptional()
  @IsNumber()
  energyKcal?: number;

  @ApiPropertyOptional({ example: 8.5 })
  @IsOptional()
  @IsNumber()
  proteinG?: number;

  @ApiPropertyOptional({ example: 3.2 })
  @IsOptional()
  @IsNumber()
  fatG?: number;

  @ApiPropertyOptional({ example: 77.8 })
  @IsOptional()
  @IsNumber()
  carbohydratesG?: number;

  @ApiPropertyOptional({ example: 2.1 })
  @IsOptional()
  @IsNumber()
  fiberG?: number;

  @ApiPropertyOptional({ example: 0.5 })
  @IsOptional()
  @IsNumber()
  sugarG?: number;

  @ApiPropertyOptional({ example: 28 })
  @IsOptional()
  @IsNumber()
  calciumMg?: number;

  @ApiPropertyOptional({ example: 2.8 })
  @IsOptional()
  @IsNumber()
  ironMg?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  vitaminAMcg?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  vitaminCMg?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  sodiumMg?: number;
}
