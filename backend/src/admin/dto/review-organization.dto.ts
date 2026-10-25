import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrgStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewOrganizationDto {
  @ApiProperty({
    enum: [OrgStatus.VERIFIED, OrgStatus.REJECTED, OrgStatus.SUSPENDED],
    example: OrgStatus.VERIFIED,
    description: 'Decision status for the organization verification request',
  })
  @IsEnum([OrgStatus.VERIFIED, OrgStatus.REJECTED, OrgStatus.SUSPENDED], {
    message: 'Status must be VERIFIED, REJECTED, or SUSPENDED',
  })
  @IsNotEmpty()
  status: OrgStatus;

  @ApiPropertyOptional({
    example: 'Valid institutional documentation received and confirmed.',
    description: 'Reason for rejection or approval remarks',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  rejectionReason?: string;
}
