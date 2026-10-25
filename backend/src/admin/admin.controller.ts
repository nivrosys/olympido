import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuditLogInterceptor } from '../common/interceptors/audit-log.interceptor';
import { AdminService } from './admin.service';
import { ReviewContestDto } from './dto/review-contest.dto';
import { ReviewOrganizationDto } from './dto/review-organization.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@UseInterceptors(AuditLogInterceptor)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('contests/pending')
  @ApiOperation({ summary: 'List contests pending admin review (Admin only)' })
  @ApiResponse({ status: 200, description: 'Paginated list of pending contests' })
  async getPendingContests(@Query() query: PaginationDto) {
    return this.adminService.getPendingContests(query);
  }

  @Put('contests/:id/review')
  @ApiOperation({ summary: 'Approve, request changes, or reject a contest (Admin only)' })
  @ApiParam({ name: 'id', description: 'Contest UUID' })
  @ApiResponse({ status: 200, description: 'Contest reviewed successfully' })
  @ApiResponse({ status: 400, description: 'Contest not in review or missing questions' })
  async reviewContest(
    @Param('id') id: string,
    @Body() dto: ReviewContestDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.reviewContest(id, dto, adminId);
  }

  @Get('organizations/pending')
  @ApiOperation({ summary: 'List organizations pending verification (Admin only)' })
  @ApiResponse({ status: 200, description: 'Paginated list of pending organizations' })
  async getPendingOrganizations(@Query() query: PaginationDto) {
    return this.adminService.getPendingOrganizations(query);
  }

  @Put('organizations/:id/review')
  @ApiOperation({ summary: 'Verify or reject an organization accreditation (Admin only)' })
  @ApiParam({ name: 'id', description: 'Organization UUID' })
  @ApiResponse({ status: 200, description: 'Organization status updated' })
  async reviewOrganization(
    @Param('id') id: string,
    @Body() dto: ReviewOrganizationDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.reviewOrganization(id, dto, adminId);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'View immutable system audit logs (Admin only)' })
  @ApiResponse({ status: 200, description: 'Paginated system audit logs' })
  async getAuditLogs(@Query() query: PaginationDto) {
    return this.adminService.getAuditLogs(query);
  }
}
