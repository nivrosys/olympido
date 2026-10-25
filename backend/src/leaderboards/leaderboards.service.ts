import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ContestCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { getIsoWeekKey, getMonthKey } from '../results/rating-calculation.service';

@Injectable()
export class LeaderboardsService {
  private readonly logger = new Logger(LeaderboardsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Retrieves the All-Time Global Leaderboard (ranked by Skill Rating or Cumulative Points).
   */
  async getAllTimeLeaderboard(
    page: number = 1,
    limit: number = 20,
    type: 'RATING' | 'POINTS' = 'RATING',
  ) {
    const skip = (page - 1) * limit;

    // Fast path: Try Redis ZSET if ranking by rating
    if (type === 'RATING') {
      const redisKey = 'leaderboard:alltime';
      const count = await this.redis.zcard(redisKey);

      if (count > 0) {
        const topMembers = await this.redis.zrevrangeWithScores(redisKey, skip, skip + limit - 1);
        if (topMembers.length > 0) {
          const userIds = topMembers.map((m) => m.member);
          const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              institutionName: true,
              studentStats: true,
            },
          });

          const userMap = new Map(users.map((u) => [u.id, u]));

          const items = topMembers.map((m, index) => {
            const user = userMap.get(m.member);
            return {
              rank: skip + index + 1,
              user: {
                id: user?.id,
                username: user?.username,
                fullName: user?.fullName,
                avatarUrl: user?.avatarUrl,
                institutionName: user?.institutionName,
              },
              currentRating: Math.round(m.score),
              peakRating: user?.studentStats?.peakRating ?? Math.round(m.score),
              totalPoints: Number(user?.studentStats?.totalPoints ?? 0),
              podiumFinishes: user?.studentStats?.podiumFinishes ?? 0,
              contestsParticipated: user?.studentStats?.contestsParticipated ?? 0,
            };
          });

          return {
            type,
            items,
            meta: {
              total: count,
              page,
              limit,
              totalPages: Math.ceil(count / limit) || 1,
            },
          };
        }
      }
    }

    // Database fallback (or when sorting by POINTS)
    const orderBy =
      type === 'POINTS'
        ? { totalPoints: 'desc' as const }
        : { currentRating: 'desc' as const };

    const [total, stats] = await Promise.all([
      this.prisma.studentStats.count(),
      this.prisma.studentStats.findMany({
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              institutionName: true,
            },
          },
        },
      }),
    ]);

    const items = stats.map((st, index) => ({
      rank: skip + index + 1,
      user: st.user,
      currentRating: st.currentRating,
      peakRating: st.peakRating,
      totalPoints: Number(st.totalPoints),
      podiumFinishes: st.podiumFinishes,
      contestsParticipated: st.contestsParticipated,
    }));

    return {
      type,
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Retrieves the Weekly Leaderboard (points won in the current ISO week, with optional category filter).
   */
  async getWeeklyLeaderboard(
    page: number = 1,
    limit: number = 20,
    category?: ContestCategory,
  ) {
    const skip = (page - 1) * limit;
    const weekKey = getIsoWeekKey();
    const redisKey = category
      ? `leaderboard:weekly:${weekKey}:${category}`
      : `leaderboard:weekly:${weekKey}`;

    const count = await this.redis.zcard(redisKey);

    if (count > 0) {
      const topMembers = await this.redis.zrevrangeWithScores(redisKey, skip, skip + limit - 1);
      if (topMembers.length > 0) {
        const userIds = topMembers.map((m) => m.member);
        const users = await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            institutionName: true,
            studentStats: true,
          },
        });

        const userMap = new Map(users.map((u) => [u.id, u]));

        const items = topMembers.map((m, index) => {
          const user = userMap.get(m.member);
          return {
            rank: skip + index + 1,
            user: {
              id: user?.id,
              username: user?.username,
              fullName: user?.fullName,
              avatarUrl: user?.avatarUrl,
              institutionName: user?.institutionName,
            },
            weeklyPoints: Math.round(m.score),
            currentRating: user?.studentStats?.currentRating ?? 1200,
          };
        });

        return {
          period: 'WEEKLY',
          weekKey,
          category: category || 'ALL',
          items,
          meta: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit) || 1,
          },
        };
      }
    }

    // Database fallback: Sum points from ContestResult in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const whereClause: any = {
      createdAt: { gte: sevenDaysAgo },
    };
    if (category) {
      whereClause.contest = { category };
    }

    const grouped = await this.prisma.contestResult.groupBy({
      by: ['userId'],
      where: whereClause,
      _sum: {
        pointsAwarded: true,
      },
      orderBy: {
        _sum: {
          pointsAwarded: 'desc',
        },
      },
      skip,
      take: limit,
    });

    const userIds = grouped.map((g) => g.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        institutionName: true,
        studentStats: true,
      },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const items = grouped.map((g, index) => {
      const user = userMap.get(g.userId);
      return {
        rank: skip + index + 1,
        user: {
          id: user?.id,
          username: user?.username,
          fullName: user?.fullName,
          avatarUrl: user?.avatarUrl,
          institutionName: user?.institutionName,
        },
        weeklyPoints: g._sum.pointsAwarded || 0,
        currentRating: user?.studentStats?.currentRating ?? 1200,
      };
    });

    return {
      period: 'WEEKLY',
      weekKey,
      category: category || 'ALL',
      items,
      meta: {
        total: grouped.length,
        page,
        limit,
        totalPages: 1,
      },
    };
  }

  /**
   * Retrieves the Monthly Championship Leaderboard (points won in current calendar month).
   */
  async getMonthlyLeaderboard(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const monthKey = getMonthKey();
    const redisKey = `leaderboard:monthly:${monthKey}`;

    const count = await this.redis.zcard(redisKey);

    if (count > 0) {
      const topMembers = await this.redis.zrevrangeWithScores(redisKey, skip, skip + limit - 1);
      if (topMembers.length > 0) {
        const userIds = topMembers.map((m) => m.member);
        const users = await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            institutionName: true,
            studentStats: true,
          },
        });

        const userMap = new Map(users.map((u) => [u.id, u]));

        const items = topMembers.map((m, index) => {
          const user = userMap.get(m.member);
          return {
            rank: skip + index + 1,
            user: {
              id: user?.id,
              username: user?.username,
              fullName: user?.fullName,
              avatarUrl: user?.avatarUrl,
              institutionName: user?.institutionName,
            },
            monthlyPoints: Math.round(m.score),
            currentRating: user?.studentStats?.currentRating ?? 1200,
          };
        });

        return {
          period: 'MONTHLY',
          monthKey,
          items,
          meta: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit) || 1,
          },
        };
      }
    }

    // Database fallback: Sum points from ContestResult in current month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const grouped = await this.prisma.contestResult.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: startOfMonth },
      },
      _sum: {
        pointsAwarded: true,
      },
      orderBy: {
        _sum: {
          pointsAwarded: 'desc',
        },
      },
      skip,
      take: limit,
    });

    const userIds = grouped.map((g) => g.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        institutionName: true,
        studentStats: true,
      },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const items = grouped.map((g, index) => {
      const user = userMap.get(g.userId);
      return {
        rank: skip + index + 1,
        user: {
          id: user?.id,
          username: user?.username,
          fullName: user?.fullName,
          avatarUrl: user?.avatarUrl,
          institutionName: user?.institutionName,
        },
        monthlyPoints: g._sum.pointsAwarded || 0,
        currentRating: user?.studentStats?.currentRating ?? 1200,
      };
    });

    return {
      period: 'MONTHLY',
      monthKey,
      items,
      meta: {
        total: grouped.length,
        page,
        limit,
        totalPages: 1,
      },
    };
  }

  /**
   * Retrieves complete multi-tier rank standings for a single user by username.
   */
  async getUserRank(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        studentStats: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User @${username} not found`);
    }

    const stats = user.studentStats;
    const currentRating = stats?.currentRating ?? 1200;
    const totalPoints = stats?.totalPoints ?? BigInt(0);

    // 1. All-time rating rank: Try Redis ZREVRANK, fallback to DB count
    let allTimeRatingRank: number | null = await this.redis.zrevrank(
      'leaderboard:alltime',
      user.id,
    );
    if (allTimeRatingRank !== null) {
      allTimeRatingRank += 1;
    } else {
      const higherRated = await this.prisma.studentStats.count({
        where: { currentRating: { gt: currentRating } },
      });
      allTimeRatingRank = higherRated + 1;
    }

    // 2. All-time points rank
    const higherPoints = await this.prisma.studentStats.count({
      where: { totalPoints: { gt: totalPoints } },
    });
    const allTimePointsRank = higherPoints + 1;

    // 3. Weekly rank
    const weekKey = getIsoWeekKey();
    let weeklyRank: number | null = await this.redis.zrevrank(
      `leaderboard:weekly:${weekKey}`,
      user.id,
    );
    let weeklyPoints: number | null = null;
    if (weeklyRank !== null) {
      weeklyRank += 1;
      weeklyPoints = await this.redis.zscore(`leaderboard:weekly:${weekKey}`, user.id);
    }

    // 4. Monthly rank
    const monthKey = getMonthKey();
    let monthlyRank: number | null = await this.redis.zrevrank(
      `leaderboard:monthly:${monthKey}`,
      user.id,
    );
    let monthlyPoints: number | null = null;
    if (monthlyRank !== null) {
      monthlyRank += 1;
      monthlyPoints = await this.redis.zscore(`leaderboard:monthly:${monthKey}`, user.id);
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        institutionName: user.institutionName,
      },
      stats: {
        currentRating,
        peakRating: stats?.peakRating ?? 1200,
        totalPoints: Number(totalPoints),
        podiumFinishes: stats?.podiumFinishes ?? 0,
        contestsParticipated: stats?.contestsParticipated ?? 0,
        currentStreak: stats?.currentStreak ?? 0,
        longestStreak: stats?.longestStreak ?? 0,
      },
      rankings: {
        allTimeRatingRank,
        allTimePointsRank,
        weekly: {
          rank: weeklyRank,
          points: weeklyPoints,
          weekKey,
        },
        monthly: {
          rank: monthlyRank,
          points: monthlyPoints,
          monthKey,
        },
      },
    };
  }
}
