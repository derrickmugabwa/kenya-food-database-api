import { ApiProperty } from '@nestjs/swagger';

export class OAuthToken {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: String,
  })
  accessToken: string;

  @ApiProperty({
    type: String,
  })
  clientId: string;

  @ApiProperty({
    type: [String],
    example: ['read:foods', 'read:categories'],
  })
  scopes: string[];

  @ApiProperty({
    type: Date,
  })
  expiresAt: Date;

  @ApiProperty({
    type: Boolean,
  })
  revoked: boolean;

  @ApiProperty()
  createdAt: Date;
}
