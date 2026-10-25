import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ResultsService } from './results.service';

@ApiTags('Results')
@Controller()
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Post('contests/:id/finalize')
  @ApiBearerAuth('bearer')
  @Roles(UserRole.ORGANIZER, UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Finalize contest evaluation, calculate ratings, awards, and generate scorecards',
    description:
      'Triggers ranking algorithm, multi-competitor Elo rating adjustments, Olympiad points distribution, and updates leaderboards. Restricted to Contest Organizer or Admin.',
  })
  async finalizeContest(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return this.resultsService.finalizeContest(id, req.user.id, req.user.role);
  }

  @Get('contests/:id/results')
  @Public()
  @ApiOperation({
    summary: 'Get paginated official results and rankings for a completed contest',
    description: 'Returns the full leaderboard of participants for the contest once completed.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getContestResults(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Request() req: any,
  ) {
    return this.resultsService.getContestResults(
      id,
      Number(page) || 1,
      Number(limit) || 20,
      req?.user,
    );
  }

  @Get('contests/:id/my-results')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Get personal scorecard and complete question-by-question performance breakdown',
    description:
      'Includes student rank, rating delta, points won, and explanations for each question.',
  })
  async getMyResult(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return this.resultsService.getMyResult(id, req.user.id);
  }

  @Get('users/:username/scorecards')
  @Public()
  @ApiOperation({
    summary: 'Get all official contest scorecards for a user by username',
    description: 'Returns historical performance records, badges, and verified scorecards.',
  })
  async getUserScorecards(@Param('username') username: string) {
    return this.resultsService.getUserScorecards(username);
  }

  @Get('verify/scorecard/:hash')
  @Public()
  @ApiOperation({
    summary: 'Cryptographically verify an official student contest scorecard',
    description:
      'Validates the 64-char SHA-256 hash printed on scorecard QR codes and certificates.',
  })
  async verifyScorecard(@Param('hash') hash: string) {
    return this.resultsService.verifyScorecard(hash);
  }
}
