import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
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
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationQueryDto } from './dto/organization-query.dto';
import { OrganizationsService } from './organizations.service';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Browse verified organizations and institutions' })
  @ApiResponse({ status: 200, description: 'Paginated list of organizations' })
  async findAll(@Query() query: OrganizationQueryDto) {
    return this.organizationsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get details of an organization by ID' })
  @ApiParam({ name: 'id', description: 'Organization UUID' })
  @ApiResponse({ status: 200, description: 'Organization details' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new organization for verification (Organizer/Admin only)' })
  @ApiResponse({ status: 201, description: 'Organization created in pending status' })
  @ApiResponse({ status: 409, description: 'Domain already registered' })
  async create(@Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(dto);
  }

  @Get(':id/teachers')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List teachers affiliated with organization' })
  @ApiParam({ name: 'id', description: 'Organization UUID' })
  async getTeachers(@Param('id') id: string) {
    return this.organizationsService.getTeachers(id);
  }

  @Put(':id/teachers/:teacherId/approve')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject a teacher affiliation request' })
  @ApiParam({ name: 'id', description: 'Organization UUID' })
  @ApiParam({ name: 'teacherId', description: 'Teacher User UUID' })
  async approveTeacher(
    @Param('id') id: string,
    @Param('teacherId') teacherId: string,
    @Body('isApproved') isApproved: boolean,
    @CurrentUser('id') approverId: string,
  ) {
    return this.organizationsService.approveTeacher(
      id,
      teacherId,
      Boolean(isApproved),
      approverId,
    );
  }
}
