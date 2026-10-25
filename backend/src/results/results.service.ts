import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RatingCalculationService } from './rating-calculation.service';

@Injectable()
export class ResultsService {
  private readonly logger = new Logger(ResultsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ratingCalculationService: RatingCalculationService,
  ) {}

  /**
   * Finalizes contest evaluation, computes ranks, ratings, points, and scorecards.
   */
  async finalizeContest(contestId: string, actorId: string, role: string) {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID ${contestId} not found`);
    }

    if (role !== UserRole.ADMIN && contest.creatorId !== actorId) {
      throw new ForbiddenException('Only contest organizer or platform admin can finalize this contest');
    }

    if (!['EVALUATION', 'COMPLETED', 'LIVE'].includes(contest.status)) {
      throw new BadRequestException(
        `Cannot finalize contest in status ${contest.status}. Contest must be in EVALUATION or LIVE.`,
      );
    }

    const results = await this.ratingCalculationService.processContestResults(contestId);

    return {
      message: 'Contest finalized and results computed successfully',
      contestId,
      status: 'COMPLETED',
      totalParticipants: results.length,
      results,
    };
  }

  /**
   * Returns paginated official results/rankings for a completed contest.
   */
  async getContestResults(
    contestId: string,
    page: number = 1,
    limit: number = 20,
    requestingUser?: { id: string; role: string },
  ) {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      select: { id: true, title: true, slug: true, status: true, basePoints: true, difficulty: true },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID ${contestId} not found`);
    }

    const isPrivileged =
      requestingUser &&
      (requestingUser.role === UserRole.ADMIN || requestingUser.role === UserRole.ORGANIZER);

    if (contest.status !== 'COMPLETED' && !isPrivileged) {
      throw new BadRequestException(
        'Contest results are not available yet. Contest evaluation is still underway.',
      );
    }

    const skip = (page - 1) * limit;

    const [total, results] = await Promise.all([
      this.prisma.contestResult.count({ where: { contestId } }),
      this.prisma.contestResult.findMany({
        where: { contestId },
        orderBy: { finalRank: 'asc' },
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

    // Attach raw score from submission
    const userIds = results.map((r) => r.userId);
    const submissions = await this.prisma.submission.findMany({
      where: {
        contestId,
        userId: { in: userIds },
      },
      select: { userId: true, rawScore: true, submittedAt: true },
    });

    const subMap = new Map(submissions.map((s) => [s.userId, s]));

    const formattedItems = results.map((r) => {
      const sub = subMap.get(r.userId);
      return {
        id: r.id,
        finalRank: r.finalRank,
        percentile: Number(r.percentile),
        pointsAwarded: r.pointsAwarded,
        preRating: r.preRating,
        postRating: r.postRating,
        ratingDelta: r.ratingDelta,
        scorecardQrHash: r.scorecardQrHash,
        rawScore: sub ? Number(sub.rawScore) : null,
        submittedAt: sub ? sub.submittedAt : null,
        user: r.user,
      };
    });

    return {
      contest,
      items: formattedItems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Returns student's personal contest result + complete question breakdown with explanations.
   */
  async getMyResult(contestId: string, userId: string) {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        questions: {
          orderBy: { questionOrder: 'asc' },
        },
      },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID ${contestId} not found`);
    }

    if (contest.status !== 'COMPLETED') {
      throw new BadRequestException('Results and scorecards are only published once the contest is COMPLETED.');
    }

    const [result, submission] = await Promise.all([
      this.prisma.contestResult.findUnique({
        where: {
          contestId_userId: {
            contestId,
            userId,
          },
        },
      }),
      this.prisma.submission.findUnique({
        where: {
          contestId_userId: {
            contestId,
            userId,
          },
        },
        include: {
          answers: true,
        },
      }),
    ]);

    if (!result || !submission) {
      throw new NotFoundException('You do not have a recorded result for this contest.');
    }

    // Map question breakdown
    const answersMap = new Map(submission.answers.map((a) => [a.questionId, a]));

    const questionBreakdown = contest.questions.map((q) => {
      const ans = answersMap.get(q.id);
      return {
        questionId: q.id,
        questionOrder: q.questionOrder,
        questionText: q.questionText,
        type: q.type,
        maxPoints: Number(q.maxPoints),
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        userAnswer: {
          selectedOption: ans?.selectedOption ?? null,
          answerContent: ans?.answerContent ?? null,
          isCorrect: ans?.isCorrect ?? false,
          awardedScore: ans ? Number(ans.score) : 0,
        },
      };
    });

    return {
      contest: {
        id: contest.id,
        title: contest.title,
        slug: contest.slug,
        category: contest.category,
        difficulty: contest.difficulty,
        maxScore: contest.maxScore,
        basePoints: contest.basePoints,
        contestStartAt: contest.contestStartAt,
      },
      scorecard: {
        finalRank: result.finalRank,
        percentile: Number(result.percentile),
        rawScore: Number(submission.rawScore),
        pointsAwarded: result.pointsAwarded,
        preRating: result.preRating,
        postRating: result.postRating,
        ratingDelta: result.ratingDelta,
        scorecardQrHash: result.scorecardQrHash,
        completedAt: result.createdAt,
      },
      questions: questionBreakdown,
    };
  }

  /**
   * Returns all official scorecards for a user by username.
   */
  async getUserScorecards(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        institutionName: true,
        studentStats: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User @${username} not found`);
    }

    const results = await this.prisma.contestResult.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        contest: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            difficulty: true,
            contestStartAt: true,
            bannerUrl: true,
          },
        },
      },
    });

    return {
      user: {
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        institutionName: user.institutionName,
        stats: user.studentStats,
      },
      scorecards: results.map((r) => ({
        id: r.id,
        finalRank: r.finalRank,
        percentile: Number(r.percentile),
        pointsAwarded: r.pointsAwarded,
        preRating: r.preRating,
        postRating: r.postRating,
        ratingDelta: r.ratingDelta,
        scorecardQrHash: r.scorecardQrHash,
        contest: r.contest,
        issuedAt: r.createdAt,
      })),
    };
  }

  /**
   * Public scorecard verification endpoint.
   */
  async verifyScorecard(hash: string) {
    const result = await this.prisma.contestResult.findUnique({
      where: { scorecardQrHash: hash },
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
        contest: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            difficulty: true,
            maxScore: true,
            basePoints: true,
            contestStartAt: true,
            organization: {
              select: {
                id: true,
                name: true,
                officialDomain: true,
                websiteUrl: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundException(
        'Scorecard verification failed: invalid or expired cryptographic hash',
      );
    }

    return {
      verified: true,
      verificationHash: result.scorecardQrHash,
      student: result.user,
      contest: result.contest,
      achievement: {
        finalRank: result.finalRank,
        percentile: Number(result.percentile),
        pointsAwarded: result.pointsAwarded,
        postRating: result.postRating,
        ratingDelta: result.ratingDelta,
        verifiedAt: result.createdAt,
      },
    };
  }
}
