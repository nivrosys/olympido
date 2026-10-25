import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class AnswerItemDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Question UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  questionId: string;

  @ApiPropertyOptional({ example: 'B', description: 'Selected option label for MCQ' })
  @IsOptional()
  @IsString()
  selectedOption?: string;

  @ApiPropertyOptional({ example: '42.5', description: 'Text or numeric answer for short answer / code' })
  @IsOptional()
  @IsString()
  answerContent?: string;

  @ApiPropertyOptional({ example: 'https://assets.olympido.com/uploads/sheet.pdf', description: 'Uploaded solution file URL' })
  @IsOptional()
  @IsString()
  answerFileUrl?: string;
}

export class SubmitAnswersDto {
  @ApiProperty({ example: 1850, description: 'Total time taken in seconds from start to submission' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  timeTakenSeconds: number;

  @ApiProperty({ type: [AnswerItemDto], description: 'List of submitted question answers' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers: AnswerItemDto[];
}
