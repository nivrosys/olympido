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
import { PaginationDto } from '../common/dto/pagination.dto';
import { ContestsService } from './contests.service';
import { ContestQueryDto } from './dto/contest-query.dto';
import { CreateContestDto } from './dto/create-contest.dto';
import { UpdateContestDto } from './dto/update-contest.dto';

@ApiTags('Contests')
@Controller('contests')
export class ContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Browse published, scheduled, live, and completed contests' })
  @ApiResponse({ status: 200, description: 'Paginated contest list' })
  async findAll(@Query() query: ContestQueryDto) {
    return this.contestsService.findAll(query);
  }

  @Get('my/created')
  @Roles(UserRole.ORGANIZER, UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get contests created by current organizer/teacher across all statuses' })
  async getMyContests(
    @CurrentUser('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.contestsService.getMyContests(userId, query);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get contest details by URL slug' })
  @ApiParam({ name: 'slug', description: 'Unique contest URL slug' })
  @ApiResponse({ status: 200, description: 'Contest details' })
  @ApiResponse({ status: 404, description: 'Contest not found' })
  async findBySlug(
    @Param('slug') slug: string,
    @CurrentUser('id') currentUserId?: string,
  ) {
    return this.contestsService.findBySlug(slug, currentUserId);
  }

  @Post()
  @Roles(UserRole.ORGANIZER, UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new contest draft (Organizer/Teacher/Admin only)' })
  @ApiResponse({ status: 201, description: 'Contest draft created' })
  @ApiResponse({ status: 400, description: 'Invalid schedule or organization affiliation' })
  async create(
    @Body() dto: CreateContestDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.contestsService.create(dto, userId, userRole);
  }

  @Put(':id')
  @Roles(UserRole.ORGANIZER, UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a contest while in DRAFT or CHANGES_REQUESTED status' })
  @ApiParam({ name: 'id', description: 'Contest UUID' })
  @ApiResponse({ status: 200, description: 'Contest updated' })
  @ApiResponse({ status: 400, description: 'Cannot edit contest outside of draft' })
  @ApiResponse({ status: 403, description: 'Not the creator of this contest' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContestDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.contestsService.update(id, dto, userId, userRole);
  }

  @Post(':id/submit-review')
  @Roles(UserRole.ORGANIZER, UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit contest to platform admin for review & publication' })
  @ApiParam({ name: 'id', description: 'Contest UUID' })
  @ApiResponse({ status: 200, description: 'Contest submitted to review queue' })
  @ApiResponse({ status: 400, description: 'Contest must have at least 1 question' })
  async submitReview(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.contestsService.submitReview(id, userId, userRole);
  }

  @Post(':id/register')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register current user for an upcoming scheduled contest' })
  @ApiParam({ name: 'id', description: 'Contest UUID' })
  @ApiResponse({ status: 201, description: 'Successfully registered for contest' })
  @ApiResponse({ status: 400, description: 'Registration window closed or contest not scheduled' })
  @ApiResponse({ status: 409, description: 'Already registered for this contest' })
  async register(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.contestsService.register(id, userId);
  }
}
