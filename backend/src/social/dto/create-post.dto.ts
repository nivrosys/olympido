import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreatePostDto {
  @ApiPropertyOptional({
    description: 'Post caption or message to accompany the achievement or scorecard',
    example: 'Thrilled to take Rank 1 at the National Physics Olympiad with a 1370 rating milestone! 🚀',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  caption?: string;

  @ApiPropertyOptional({
    description: 'Post type category',
    example: 'SCORECARD',
    default: 'SCORECARD',
    enum: ['SCORECARD', 'STREAK', 'ACHIEVEMENT', 'GENERAL'],
  })
  @IsOptional()
  @IsString()
  postType?: string;

  @ApiPropertyOptional({
    description: 'Optional ContestResult ID to link official performance data',
    example: 'e9ddaaed-1492-4e0d-8adf-7c3c3b7afb36',
  })
  @IsOptional()
  @IsUUID()
  contestResultId?: string;

  @ApiPropertyOptional({
    description: 'Optional scorecard image URL or snapshot uploaded to CDN',
    example: 'http://localhost:4000/uploads/scorecard-123.png',
  })
  @IsOptional()
  @IsString()
  scorecardImageUrl?: string;
}
