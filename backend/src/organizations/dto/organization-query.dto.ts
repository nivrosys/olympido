import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrgStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class OrganizationQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: OrgStatus, description: 'Filter organizations by status' })
  @IsOptional()
  @IsEnum(OrgStatus)
  status?: OrgStatus;

  @ApiPropertyOptional({ description: 'Search organization by name or domain' })
  @IsOptional()
  @IsString()
  search?: string;
}
