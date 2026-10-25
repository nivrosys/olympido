import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContestStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewContestDto {
  @ApiProperty({
    enum: [ContestStatus.APPROVED, ContestStatus.CHANGES_REQUESTED, ContestStatus.REJECTED],
    example: ContestStatus.APPROVED,
    description: 'Decision status for the contest review',
  })
  @IsEnum([ContestStatus.APPROVED, ContestStatus.CHANGES_REQUESTED, ContestStatus.REJECTED], {
    message: 'Status must be APPROVED, CHANGES_REQUESTED, or REJECTED',
  })
  @IsNotEmpty()
  status: ContestStatus;

  @ApiPropertyOptional({
    example: 'Approved. Contest meets all formatting and curriculum guidelines.',
    description: 'Reviewer notes or revision requests for the organizer',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reviewNotes?: string;
}
