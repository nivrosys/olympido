import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContestCategory, DifficultyLevel } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateContestDto {
  @ApiProperty({ example: 'National Mathematics Olympiad 2026', description: 'Contest title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: ContestCategory, example: ContestCategory.MATHEMATICS })
  @IsEnum(ContestCategory)
  category: ContestCategory;

  @ApiProperty({
    example: 'An olympiad testing discrete math, geometry, and number theory.',
    description: 'Detailed description of the contest',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '1. No external aids or calculators.\n2. Negative marking for incorrect answers.',
    description: 'Contest rules and guidelines',
  })
  @IsString()
  @IsNotEmpty()
  rules: string;

  @ApiPropertyOptional({ enum: DifficultyLevel, default: DifficultyLevel.REGIONAL })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel = DifficultyLevel.REGIONAL;

  @ApiPropertyOptional({ example: 'https://assets.olympido.com/banners/math.jpg' })
  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Organization sponsoring or hosting this contest',
  })
  @IsOptional()
  @IsUUID('4')
  organizationId?: string;

  @ApiProperty({
    example: '2026-11-01T00:00:00.000Z',
    description: 'Registration window open time (ISO-8601)',
  })
  @Type(() => Date)
  @IsDate()
  registrationStartAt: Date;

  @ApiProperty({
    example: '2026-11-09T23:59:59.000Z',
    description: 'Registration deadline (ISO-8601)',
  })
  @Type(() => Date)
  @IsDate()
  registrationEndAt: Date;

  @ApiProperty({
    example: '2026-11-10T15:00:00.000Z',
    description: 'Contest start timestamp (ISO-8601)',
  })
  @Type(() => Date)
  @IsDate()
  contestStartAt: Date;

  @ApiProperty({ example: 90, description: 'Duration in minutes' })
  @Type(() => Number)
  @IsInt()
  @Min(10)
  durationMinutes: number;

  @ApiPropertyOptional({ example: 100, description: 'Maximum possible score' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxScore?: number = 100;

  @ApiPropertyOptional({ example: 500, description: 'Base participation points pool' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  basePoints?: number = 500;
}
