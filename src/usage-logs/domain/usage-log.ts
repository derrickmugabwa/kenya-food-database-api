import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UsageLog {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Client ID - stores either API Key ID or OAuth Client ID',
  })
  apiKeyId?: number | null;

  @ApiProperty({
    type: String,
    example: '/api/v1/foods',
    description: 'Endpoint accessed',
  })
  endpoint: string;

  @ApiProperty({
    type: String,
    example: 'GET',
    description: 'HTTP method',
  })
  method: string;

  @ApiPropertyOptional({
    type: String,
    example: '192.168.1.1',
    description: 'IP address',
  })
  ipAddress?: string | null;

  @ApiPropertyOptional({
    type: String,
    example: 'Mozilla/5.0...',
    description: 'User agent',
  })
  userAgent?: string | null;

  @ApiProperty({
    type: Number,
    example: 200,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiPropertyOptional({
    type: Number,
    example: 150,
    description: 'Response time in ms',
  })
  responseTime?: number | null;

  @ApiProperty()
  createdAt: Date;
}
