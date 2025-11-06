import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Category {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: String,
    example: 'Cereals & Grains',
  })
  name: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Staple foods including rice, maize, wheat',
  })
  description?: string | null;

  @ApiPropertyOptional({
    type: String,
    example: 'https://example.com/icons/cereals.png',
    description: 'URL to category icon',
  })
  iconUrl?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    required: false,
  })
  deletedAt?: Date | null;
}
