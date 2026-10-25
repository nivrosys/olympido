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
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GradeAnswerDto } from './dto/grade-answer.dto';
import { SaveSingleAnswerDto } from './dto/save-single-answer.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { SubmissionsService } from './submissions.service';

@ApiTags('Submissions')
@ApiBearerAuth()
@Controller()
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('contests/:contestId/submit')
  @ApiOperation({ summary: 'Submit all answers for a live contest' })
  @ApiParam({ name: 'contestId', description: 'Contest UUID' })
  @ApiResponse({ status: 201, description: 'Answers submitted and auto-graded' })
  @ApiResponse({ status: 400, description: 'Contest not live or submission window closed' })
  @ApiResponse({ status: 403, description: 'User not registered for this contest' })
  async submitAnswers(
    @Param('contestId') contestId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitAnswersDto,
  ) {
    return this.submissionsService.submitAnswers(contestId, userId, dto);
  }

  @Put('contests/:contestId/submit/:questionId')
  @ApiOperation({ summary: 'Auto-save a single answer during a live contest' })
  @ApiParam({ name: 'contestId', description: 'Contest UUID' })
  @ApiParam({ name: 'questionId', description: 'Question UUID' })
  @ApiResponse({ status: 200, description: 'Answer saved' })
  async saveSingleAnswer(
    @Param('contestId') contestId: string,
    @Param('questionId') questionId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SaveSingleAnswerDto,
  ) {
    return this.submissionsService.saveSingleAnswer(
      contestId,
      questionId,
      userId,
      dto,
    );
  }

  @Get('contests/:contestId/my-submission')
  @ApiOperation({ summary: 'Get current user submission and answers for a contest' })
  @ApiParam({ name: 'contestId', description: 'Contest UUID' })
  @ApiResponse({ status: 200, description: 'Submission details' })
  async getMySubmission(
    @Param('contestId') contestId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.submissionsService.getMySubmission(contestId, userId);
  }

  @Get('contests/:contestId/submissions')
  @Roles(UserRole.ORGANIZER, UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Inspect all submissions for a contest (Creator/Admin only)' })
  @ApiParam({ name: 'contestId', description: 'Contest UUID' })
  @ApiResponse({ status: 200, description: 'Paginated list of submissions' })
  async getContestSubmissions(
    @Param('contestId') contestId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query() query: PaginationDto,
  ) {
    return this.submissionsService.getContestSubmissions(
      contestId,
      userId,
      userRole,
      query,
    );
  }

  @Put('contests/answers/:answerId/grade')
  @Roles(UserRole.ORGANIZER, UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Manually grade a theoretical or code submission answer' })
  @ApiParam({ name: 'answerId', description: 'SubmissionAnswer UUID' })
  @ApiResponse({ status: 200, description: 'Answer graded successfully' })
  async gradeManualAnswer(
    @Param('answerId') answerId: string,
    @CurrentUser('id') graderId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() dto: GradeAnswerDto,
  ) {
    return this.submissionsService.gradeManualAnswer(
      answerId,
      graderId,
      userRole,
      dto,
    );
  }
}
