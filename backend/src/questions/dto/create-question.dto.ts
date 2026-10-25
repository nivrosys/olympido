import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuestionType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({
    enum: QuestionType,
    example: QuestionType.MCQ,
    description: 'Question type: MCQ, SHORT_ANSWER, THEORETICAL, or CODE',
  })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({
    example: 'What is the SI unit of electric capacitance?',
    description: 'Question problem statement or text',
  })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiPropertyOptional({
    example: [
      { label: 'A', text: 'Henry', is_correct: false },
      { label: 'B', text: 'Farad', is_correct: true },
      { label: 'C', text: 'Tesla', is_correct: false },
      { label: 'D', text: 'Weber', is_correct: false },
    ],
    description: 'Array of option choices for MCQ questions',
  })
  @IsOptional()
  options?: any;

  @ApiPropertyOptional({ example: 'B', description: 'Correct answer or option label' })
  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @ApiPropertyOptional({
    example: 'Farad (symbol F) is the SI unit of electrical capacitance.',
    description: 'Detailed explanation revealed after contest completion',
  })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ example: 10.0, description: 'Points awarded for correct solution' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPoints?: number = 10.0;

  @ApiPropertyOptional({ example: 120, description: 'Time limit in seconds for this question' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(10)
  timeLimitSeconds?: number;

  @ApiPropertyOptional({
    example: [{ url: 'https://assets.olympido.com/diagram.png', type: 'image' }],
    description: 'Attachments or diagram URLs',
  })
  @IsOptional()
  attachments?: any;
}
