import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContestCategory, ContestStatus, DifficultyLevel } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ContestQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ContestStatus, description: 'Filter by contest status' })
  @IsOptional()
  @IsEnum(ContestStatus)
  status?: ContestStatus;

  @ApiPropertyOptional({ enum: ContestCategory, description: 'Filter by subject/category' })
  @IsOptional()
  @IsEnum(ContestCategory)
  category?: ContestCategory;

  @ApiPropertyOptional({ enum: DifficultyLevel, description: 'Filter by difficulty tier' })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ description: 'Search term for title or description' })
  @IsOptional()
  @IsString()
  search?: string;
}
