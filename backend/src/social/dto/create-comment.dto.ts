import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment body text',
    example: 'Incredible speed on problem 4! Well deserved victory! 👏',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @ApiPropertyOptional({
    description: 'Parent comment ID if replying to a thread',
    example: 'e9ddaaed-1492-4e0d-8adf-7c3c3b7afb36',
  })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}
