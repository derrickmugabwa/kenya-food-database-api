import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class NutrientDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
