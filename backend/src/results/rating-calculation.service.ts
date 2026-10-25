import { Injectable, Logger } from '@nestjs/common';
import { Contest, ContestCategory, DifficultyLevel, Submission } from '@prisma/client';
import * as crypto from 'crypto';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

export interface ParticipantScore {
  userId: string;
  submissionId: string;
  totalScore: number;
  submittedAt: Date;
  isDisqualified?: boolean;
}

export interface ComputedResult {
  userId: string;
  submissionId: string;
  finalRank: number;
  percentile: number;
  pointsAwarded: number;
  preRating: number;
  postRating: number;
  ratingDelta: number;
  isDisqualified: boolean;
  scorecardQrHash: string;
}

export function getIsoWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`;
}

export function getMonthKey(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

@Injectable()
export class RatingCalculationService {
  private readonly logger = new Logger(RatingCalculationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Calculates rankings, rating deltas, and Olympiad points for all participants of a contest.
   * Stores results in `contest_results`, updates `student_stats`, updates Redis leaderboards,
   * and transitions contest to `COMPLETED`.
   */
  async processContestResults(contestId: string): Promise<ComputedResult[]> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        submissions: {
          where: {
            status: { in: ['AUTO_GRADED', 'MANUAL_REVIEW', 'GRADED'] },
          },
        },
      },
    });

    if (!contest) {
      throw new Error(`Contest ${contestId} not found`);
    }

    const submissions = contest.submissions;
    if (submissions.length === 0) {
      this.logger.warn(`Contest ${contestId} has 0 evaluated submissions. Marking COMPLETED with no results.`);
      await this.prisma.contest.update({
        where: { id: contestId },
        data: { status: 'COMPLETED' },
      });
      return [];
    }

    // 1. Sort submissions by rawScore DESC, tie-break by submittedAt ASC
    const sortedSubmissions = [...submissions].sort((a, b) => {
      const scoreDiff = Number(b.rawScore) - Number(a.rawScore);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
      return a.submittedAt.getTime() - b.submittedAt.getTime();
    });

    const totalParticipants = sortedSubmissions.length;
    const userIds = sortedSubmissions.map((s) => s.userId);

    // 2. Fetch current stats/ratings for all participants
    const statsList = await this.prisma.studentStats.findMany({
      where: { userId: { in: userIds } },
    });
    const statsMap = new Map<string, { currentRating: number; peakRating: number; totalPoints: bigint; contestsParticipated: number; podiumFinishes: number; currentStreak: number; longestStreak: number }>();
    for (const st of statsList) {
      statsMap.set(st.userId, st);
    }

    // Ensure default stats exist in memory for any user who lacks a row
    for (const uid of userIds) {
      if (!statsMap.has(uid)) {
        statsMap.set(uid, {
          currentRating: 1200,
          peakRating: 1200,
          totalPoints: BigInt(0),
          contestsParticipated: 0,
          podiumFinishes: 0,
          currentStreak: 0,
          longestStreak: 0,
        });
      }
    }

    // 3. Compute ranks and percentiles
    // Standard competition ranking (1224)
    const rankedParticipants: Array<{
      submission: Submission;
      rank: number;
      preRating: number;
    }> = [];

    let currentRank = 1;
    for (let i = 0; i < sortedSubmissions.length; i++) {
      if (i > 0) {
        const prev = sortedSubmissions[i - 1];
        const curr = sortedSubmissions[i];
        if (Number(curr.rawScore) === Number(prev.rawScore) && curr.submittedAt.getTime() === prev.submittedAt.getTime()) {
          // tie
        } else {
          currentRank = i + 1;
        }
      }
      const userStat = statsMap.get(sortedSubmissions[i].userId)!;
      rankedParticipants.push({
        submission: sortedSubmissions[i],
        rank: currentRank,
        preRating: userStat.currentRating,
      });
    }

    // 4. Calculate points for each rank
    // Points = BasePoints * (1 - (Rank - 1) / Participants) + TopRankBonus
    const basePoints = contest.basePoints || this.getBasePointsForDifficulty(contest.difficulty);

    // 5. Multi-player Elo Rating Engine
    // K-factor = 32
    const K = 32;
    const computedResults: ComputedResult[] = [];

    for (let i = 0; i < rankedParticipants.length; i++) {
      const p1 = rankedParticipants[i];
      const rank = p1.rank;

      // Percentile: top rank gets ~100%, last gets ~0%
      const percentile =
        totalParticipants > 1
          ? Number((((totalParticipants - rank) / (totalParticipants - 1)) * 100).toFixed(2))
          : 100.0;

      // Points calculation
      const rankRatio =
        totalParticipants > 1
          ? Math.max(0, 1 - (rank - 1) / totalParticipants)
          : 1.0;
      let bonusFactor = 0;
      if (rank === 1) bonusFactor = 0.5; // +50%
      else if (rank === 2) bonusFactor = 0.3; // +30%
      else if (rank === 3) bonusFactor = 0.2; // +20%
      else if (rank <= 10) bonusFactor = 0.1; // +10%

      const rawAward = Math.round(basePoints * rankRatio * (1 + bonusFactor));
      const pointsAwarded = Math.max(1, rawAward);

      // Elo against all other competitors
      let sumExpected = 0;
      let sumActual = 0;

      for (let j = 0; j < rankedParticipants.length; j++) {
        if (i === j) continue;
        const p2 = rankedParticipants[j];

        // Expected score E_ij = 1 / (1 + 10^((R_j - R_i) / 400))
        const exponent = (p2.preRating - p1.preRating) / 400;
        const e_ij = 1 / (1 + Math.pow(10, exponent));
        sumExpected += e_ij;

        // Actual score S_ij
        if (p1.rank < p2.rank) {
          sumActual += 1.0;
        } else if (p1.rank === p2.rank) {
          sumActual += 0.5;
        } else {
          sumActual += 0.0;
        }
      }

      let ratingDelta = 0;
      if (totalParticipants > 1) {
        ratingDelta = Math.round((K / (totalParticipants - 1)) * (sumActual - sumExpected));
      } else {
        // Participated alone, give standard completion boost
        ratingDelta = 10;
      }

      const postRating = Math.max(100, p1.preRating + ratingDelta);
      const effectiveDelta = postRating - p1.preRating;

      // Generate 64-char cryptographic QR hash for scorecard verification
      const qrSeed = `${contestId}:${p1.submission.userId}:${rank}:${Date.now()}:${crypto.randomUUID()}`;
      const scorecardQrHash = crypto.createHash('sha256').update(qrSeed).digest('hex');

      computedResults.push({
        userId: p1.submission.userId,
        submissionId: p1.submission.id,
        finalRank: rank,
        percentile,
        pointsAwarded,
        preRating: p1.preRating,
        postRating,
        ratingDelta: effectiveDelta,
        isDisqualified: false,
        scorecardQrHash,
      });
    }

    // 6. Transactional persistence: ContestResult + StudentStats + Contest status
    await this.prisma.$transaction(async (tx) => {
      for (const res of computedResults) {
        // Upsert ContestResult
        await tx.contestResult.upsert({
          where: {
            contestId_userId: {
              contestId,
              userId: res.userId,
            },
          },
          update: {
            finalRank: res.finalRank,
            percentile: res.percentile,
            pointsAwarded: res.pointsAwarded,
            preRating: res.preRating,
            postRating: res.postRating,
            ratingDelta: res.ratingDelta,
            isDisqualified: res.isDisqualified,
            scorecardQrHash: res.scorecardQrHash,
          },
          create: {
            contestId,
            userId: res.userId,
            finalRank: res.finalRank,
            percentile: res.percentile,
            pointsAwarded: res.pointsAwarded,
            preRating: res.preRating,
            postRating: res.postRating,
            ratingDelta: res.ratingDelta,
            isDisqualified: res.isDisqualified,
            scorecardQrHash: res.scorecardQrHash,
          },
        });

        // Update StudentStats
        const stat = statsMap.get(res.userId)!;
        const newPeak = Math.max(stat.peakRating, res.postRating);
        const newStreak = stat.currentStreak + 1;
        const newLongestStreak = Math.max(stat.longestStreak, newStreak);
        const isPodium = res.finalRank <= 3;

        await tx.studentStats.upsert({
          where: { userId: res.userId },
          update: {
            currentRating: res.postRating,
            peakRating: newPeak,
            totalPoints: { increment: BigInt(res.pointsAwarded) },
            contestsParticipated: { increment: 1 },
            podiumFinishes: isPodium ? { increment: 1 } : undefined,
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
          },
          create: {
            userId: res.userId,
            currentRating: res.postRating,
            peakRating: newPeak,
            totalPoints: BigInt(res.pointsAwarded),
            contestsParticipated: 1,
            podiumFinishes: isPodium ? 1 : 0,
            currentStreak: 1,
            longestStreak: 1,
          },
        });
      }

      // Mark Contest COMPLETED
      await tx.contest.update({
        where: { id: contestId },
        data: { status: 'COMPLETED' },
      });
    });

    this.logger.log(
      `Successfully processed results & ratings for contest ${contestId} (${computedResults.length} participants). Status -> COMPLETED.`,
    );

    // 7. Update Redis Leaderboards (ZSET)
    await this.updateRedisLeaderboards(contest, computedResults);

    // 8. Dispatch real-time RATING_CHANGE notifications
    for (const res of computedResults) {
      try {
        const sign = res.ratingDelta >= 0 ? '+' : '';
        await this.notificationsService.createNotification({
          userId: res.userId,
          type: 'RATING_CHANGE',
          title: `Contest Results & Rating Update: ${contest.title}`,
          message: `Rank #${res.finalRank} achieved! Points: +${res.pointsAwarded}. Rating: ${res.preRating} -> ${res.postRating} (${sign}${res.ratingDelta}).`,
          referenceType: 'SCORECARD',
          referenceId: res.scorecardQrHash,
        });
      } catch (err: any) {
        this.logger.warn(`Failed to dispatch rating notification to user ${res.userId}: ${err.message}`);
      }
    }

    return computedResults;
  }

  /**
   * Updates Redis Sorted Sets for All-Time, Weekly, Monthly, and Category Leaderboards.
   */
  private async updateRedisLeaderboards(
    contest: Contest,
    results: ComputedResult[],
  ): Promise<void> {
    try {
      const now = new Date();
      const weekKey = getIsoWeekKey(now);
      const monthKey = getMonthKey(now);

      const weeklySetKey = `leaderboard:weekly:${weekKey}`;
      const monthlySetKey = `leaderboard:monthly:${monthKey}`;
      const allTimeSetKey = `leaderboard:alltime`;
      const categorySetKey = `leaderboard:weekly:${weekKey}:${contest.category}`;

      // 14 days TTL for weekly keys, 45 days for monthly
      const TWO_WEEKS_SECONDS = 14 * 24 * 60 * 60;
      const FORTY_FIVE_DAYS_SECONDS = 45 * 24 * 60 * 60;

      for (const res of results) {
        // 1. All-Time Leaderboard: score is currentRating
        await this.redis.zadd(allTimeSetKey, res.postRating, res.userId);

        // 2. Weekly Leaderboard: increment points
        await this.redis.zincrby(weeklySetKey, res.pointsAwarded, res.userId);

        // 3. Monthly Leaderboard: increment points
        await this.redis.zincrby(monthlySetKey, res.pointsAwarded, res.userId);

        // 4. Category-filtered weekly leaderboard
        await this.redis.zincrby(categorySetKey, res.pointsAwarded, res.userId);
      }

      await this.redis.expire(weeklySetKey, TWO_WEEKS_SECONDS);
      await this.redis.expire(monthlySetKey, FORTY_FIVE_DAYS_SECONDS);
      await this.redis.expire(categorySetKey, TWO_WEEKS_SECONDS);

      this.logger.log(`Updated Redis leaderboards for contest ${contest.id}`);
    } catch (err: any) {
      this.logger.warn(`Failed to update Redis leaderboards: ${err.message}`);
    }
  }

  private getBasePointsForDifficulty(level: DifficultyLevel): number {
    switch (level) {
      case DifficultyLevel.SCHOOL:
        return 100;
      case DifficultyLevel.REGIONAL:
        return 250;
      case DifficultyLevel.NATIONAL:
        return 500;
      case DifficultyLevel.INTERNATIONAL:
        return 1000;
      default:
        return 250;
    }
  }
}
