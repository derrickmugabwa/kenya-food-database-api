import { ApiProperty } from '@nestjs/swagger';

export class BulkUploadError {
  @ApiProperty({
    type: Number,
    example: 3,
    description: 'Row number where error occurred',
  })
  row: number;

  @ApiProperty({
    type: String,
    example: 'Invalid category',
    description: 'Error message',
  })
  error: string;
}

export class BulkUploadResponseDto {
  @ApiProperty({
    type: Number,
    example: 10,
    description: 'Number of successfully uploaded records',
  })
  success: number;

  @ApiProperty({
    type: Number,
    example: 2,
    description: 'Number of failed records',
  })
  failed: number;

  @ApiProperty({
    type: [BulkUploadError],
    description: 'List of errors for failed records',
  })
  errors: BulkUploadError[];
}
