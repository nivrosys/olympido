import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SaveSingleAnswerDto {
  @ApiPropertyOptional({ example: 'C', description: 'Selected option label for MCQ' })
  @IsOptional()
  @IsString()
  selectedOption?: string;

  @ApiPropertyOptional({ example: 'v0 / √2', description: 'Written answer text' })
  @IsOptional()
  @IsString()
  answerContent?: string;

  @ApiPropertyOptional({ example: 'https://assets.olympido.com/sheet.pdf', description: 'File URL if answer requires work upload' })
  @IsOptional()
  @IsString()
  answerFileUrl?: string;
}
