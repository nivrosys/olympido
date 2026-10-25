import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
import { CreateQuestionDto } from './dto/create-question.dto';
import { ReorderQuestionsDto } from './dto/reorder-questions.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionsService } from './questions.service';

@ApiTags('Questions')
@Controller('contests/:contestId/questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary:
      'Get problem set for a contest (answers and explanations hidden during live contest)',
  })
  @ApiParam({ name: 'contestId', description: 'Contest UUID' })
  @ApiResponse({ status: 200, description: 'Question set returned' })
  async findAll(
    @Param('contestId') contestId: string,
    @CurrentUser('id') userId?: string,
    @CurrentUser('role') userRole?: UserRole,
  ) {
    return this.questionsService.findAll(contestId, userId, userRole);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific question by ID' })
  @ApiParam({ name: 'contestId', description: 'Contest UUID' })
  @ApiParam({ name: 'id', description: 'Question UUID' })
  async findOne(
    @Param('contestId') contestId: string,
    @Param('id') questionId: string,
    @CurrentUser('id') userId?: string,
    @CurrentUser('role') userRole?: UserRole,
  ) {
    return this.questionsService.findOne(contestId, questionId, userId, userRole);
  }

  @Post()
  @Roles(UserRole.ORGANIZER, UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new problem to the contest problem set (Draft only)' })
  @ApiParam({ name: 'contestId', description: 'Contest UUID' })
  @ApiResponse({ status: 201, description: 'Question created' })
  async create(
    @Param('contestId') contestId: string,
    @Body() dto: CreateQuestionDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.questionsService.create(contestId, dto, userId, userRole);
  }

  @Put('reorder')
  @Roles(UserRole.ORGANIZER, UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder questions within the contest (Draft only)' })
  @ApiParam({ name: 'contestId', description: 'Contest UUID' })
  async reorder(
    @Param('contestId') contestId: string,
    @Body() dto: ReorderQuestionsDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.questionsService.reorder(contestId, dto, userId, userRole);
  }

  @Put(':id')
  @Roles(UserRole.ORGANIZER, UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing question (Draft only)' })
  @ApiParam({ name: 'contestId', description: 'Contest UUID' })
  @ApiParam({ name: 'id', description: 'Question UUID' })
  async update(
    @Param('contestId') contestId: string,
    @Param('id') questionId: string,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.questionsService.update(contestId, questionId, dto, userId, userRole);
  }

  @Delete(':id')
  @Roles(UserRole.ORGANIZER, UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a question from the problem set (Draft only)' })
  @ApiParam({ name: 'contestId', description: 'Contest UUID' })
  @ApiParam({ name: 'id', description: 'Question UUID' })
  async delete(
    @Param('contestId') contestId: string,
    @Param('id') questionId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.questionsService.delete(contestId, questionId, userId, userRole);
  }
}
