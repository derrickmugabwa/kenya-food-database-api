import { ApiProperty } from '@nestjs/swagger';

export class Contact {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: String,
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    type: String,
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    type: String,
    example: 'API Question',
  })
  subject: string;

  @ApiProperty({
    type: String,
    example: 'I have a question about the API usage...',
  })
  message: string;

  @ApiProperty({
    type: String,
    example: 'pending',
    description: 'Status of the contact message',
  })
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
