import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class GradeAnswerDto {
  @ApiProperty({ example: 8.5, description: 'Points awarded for this answer' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  score: number;

  @ApiPropertyOptional({ example: true, description: 'Whether the answer is marked correct' })
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}
