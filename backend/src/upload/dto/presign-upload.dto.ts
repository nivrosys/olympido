import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class PresignUploadDto {
  @ApiProperty({ example: 'circuit-diagram.png', description: 'Original file name' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    example: 'image/png',
    description: 'MIME type of file (image/png, image/jpeg, application/pdf, etc.)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(image\/[a-zA-Z0-9.-]+|application\/pdf)$/, {
    message: 'Only image files (png, jpeg, webp, svg) and PDF documents are allowed',
  })
  contentType: string;
}
