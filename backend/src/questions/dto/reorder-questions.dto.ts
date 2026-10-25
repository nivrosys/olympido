import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsUUID, Min, ValidateNested } from 'class-validator';

export class QuestionOrderItemDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Question UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ example: 1, description: 'New 1-based order index' })
  @IsInt()
  @Min(1)
  newOrder: number;
}

export class ReorderQuestionsDto {
  @ApiProperty({
    type: [QuestionOrderItemDto],
    description: 'Array of question IDs with their new target ordering numbers',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOrderItemDto)
  orders: QuestionOrderItemDto[];
}
