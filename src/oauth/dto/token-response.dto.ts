import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  access_token: string;

  @ApiProperty({
    example: 'Bearer',
    description: 'Token type',
  })
  token_type: string;

  @ApiProperty({
    example: 3600,
    description: 'Token expiration time in seconds',
  })
  expires_in: number;

  @ApiProperty({
    example: 'read:foods read:categories',
    description: 'Granted scopes',
  })
  scope: string;
}
