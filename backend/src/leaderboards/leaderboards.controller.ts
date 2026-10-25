import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ContestCategory } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { LeaderboardsService } from './leaderboards.service';

@ApiTags('Leaderboards')
@Controller('leaderboards')
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  @Get('all-time')
  @Public()
  @ApiOperation({
    summary: 'Get All-Time Global Leaderboard',
    description:
      'High-speed global leaderboard ranked by Skill Rating (default) or Cumulative Olympiad Points, backed by Redis Sorted Sets.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['RATING', 'POINTS'],
    description: 'Sorting metric: RATING or POINTS (default: RATING)',
  })
  async getAllTimeLeaderboard(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('type') type: 'RATING' | 'POINTS' = 'RATING',
  ) {
    return this.leaderboardsService.getAllTimeLeaderboard(
      Number(page) || 1,
      Number(limit) || 20,
      type === 'POINTS' ? 'POINTS' : 'RATING',
    );
  }

  @Get('weekly')
  @Public()
  @ApiOperation({
    summary: 'Get Weekly Olympiad Leaderboard',
    description:
      'Rankings for points won during the active ISO calendar week. Supports filtering by contest category/subject.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: ContestCategory,
    description: 'Optional subject filter (PHYSICS, MATHEMATICS, CHEMISTRY, etc.)',
  })
  async getWeeklyLeaderboard(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('category') category?: ContestCategory,
  ) {
    return this.leaderboardsService.getWeeklyLeaderboard(
      Number(page) || 1,
      Number(limit) || 20,
      category,
    );
  }

  @Get('monthly')
  @Public()
  @ApiOperation({
    summary: 'Get Monthly Championship Leaderboard',
    description: 'Rankings for points won during the current calendar month.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getMonthlyLeaderboard(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.leaderboardsService.getMonthlyLeaderboard(
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Get('rank/:username')
  @Public()
  @ApiOperation({
    summary: 'Get real-time rank positions and stats for a student',
    description:
      'Performs O(1) Redis ZREVRANK lookups to return the user rank across all-time, weekly, and monthly standings.',
  })
  async getUserRank(@Param('username') username: string) {
    return this.leaderboardsService.getUserRank(username);
  }
}
