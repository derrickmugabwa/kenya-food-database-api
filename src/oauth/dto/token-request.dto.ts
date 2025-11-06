import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TokenRequestDto {
  @ApiProperty({
    example: 'client_credentials',
    description: 'OAuth 2.0 grant type',
  })
  @IsNotEmpty()
  @IsString()
  grant_type: string;

  @ApiProperty({
    example: 'kfdb_client_abc123xyz',
    description: 'OAuth client ID',
  })
  @IsNotEmpty()
  @IsString()
  client_id: string;

  @ApiProperty({
    example: 'secret_xyz789',
    description: 'OAuth client secret',
  })
  @IsNotEmpty()
  @IsString()
  client_secret: string;
}
