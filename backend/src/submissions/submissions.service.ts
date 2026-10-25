import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ContestStatus, EvaluationStatus, UserRole } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AutoGraderService } from './auto-grader.service';
import { GradeAnswerDto } from './dto/grade-answer.dto';
import { SaveSingleAnswerDto } from './dto/save-single-answer.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly autoGrader: AutoGraderService,
  ) {}

  async submitAnswers(contestId: string, userId: string, dto: SubmitAnswersDto) {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID '${contestId}' not found.`);
    }

    if (
      contest.status !== ContestStatus.LIVE &&
      contest.status !== ContestStatus.SCHEDULED
    ) {
      throw new BadRequestException(
        `Cannot submit answers. Contest is in '${contest.status}' status.`,
      );
    }

    // Verify registration
    const registration = await this.prisma.contestRegistration.findUnique({
      where: {
        contestId_userId: {
          contestId,
          userId,
        },
      },
    });

    if (!registration) {
      throw new ForbiddenException('You are not registered for this contest.');
    }

    // Upsert submission header
    const submission = await this.prisma.submission.upsert({
      where: {
        contestId_userId: {
          contestId,
          userId,
        },
      },
      update: {
        timeTakenSeconds: dto.timeTakenSeconds,
        submittedAt: new Date(),
        status: EvaluationStatus.PENDING,
      },
      create: {
        contestId,
        userId,
        timeTakenSeconds: dto.timeTakenSeconds,
        status: EvaluationStatus.PENDING,
      },
    });

    // Save each answer
    for (const ans of dto.answers) {
      await this.prisma.submissionAnswer.upsert({
        where: {
          submissionId_questionId: {
            submissionId: submission.id,
            questionId: ans.questionId,
          },
        },
        update: {
          selectedOption: ans.selectedOption?.trim() || null,
          answerContent: ans.answerContent?.trim() || null,
          answerFileUrl: ans.answerFileUrl?.trim() || null,
        },
        create: {
          submissionId: submission.id,
          questionId: ans.questionId,
          selectedOption: ans.selectedOption?.trim() || null,
          answerContent: ans.answerContent?.trim() || null,
          answerFileUrl: ans.answerFileUrl?.trim() || null,
        },
      });
    }

    // Execute automated evaluation
    const graded = await this.autoGrader.gradeSubmission(submission.id);

    this.logger.log(`Full contest submission processed for user ${userId} in contest ${contestId}`);

    return {
      message: 'Contest answers submitted successfully.',
      submission: graded || submission,
    };
  }

  async saveSingleAnswer(
    contestId: string,
    questionId: string,
    userId: string,
    dto: SaveSingleAnswerDto,
  ) {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID '${contestId}' not found.`);
    }

    // Verify registration
    const registration = await this.prisma.contestRegistration.findUnique({
      where: {
        contestId_userId: {
          contestId,
          userId,
        },
      },
    });

    if (!registration) {
      throw new ForbiddenException('You are not registered for this contest.');
    }

    // Find or create parent submission
    const submission = await this.prisma.submission.upsert({
      where: {
        contestId_userId: {
          contestId,
          userId,
        },
      },
      update: {},
      create: {
        contestId,
        userId,
        timeTakenSeconds: 0,
        status: EvaluationStatus.PENDING,
      },
    });

    // Upsert answer
    const answer = await this.prisma.submissionAnswer.upsert({
      where: {
        submissionId_questionId: {
          submissionId: submission.id,
          questionId,
        },
      },
      update: {
        selectedOption: dto.selectedOption?.trim() || null,
        answerContent: dto.answerContent?.trim() || null,
        answerFileUrl: dto.answerFileUrl?.trim() || null,
      },
      create: {
        submissionId: submission.id,
        questionId,
        selectedOption: dto.selectedOption?.trim() || null,
        answerContent: dto.answerContent?.trim() || null,
        answerFileUrl: dto.answerFileUrl?.trim() || null,
      },
    });

    return {
      message: 'Answer saved.',
      answer,
    };
  }

  async getMySubmission(contestId: string, userId: string) {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      select: { status: true, title: true },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID '${contestId}' not found.`);
    }

    const submission = await this.prisma.submission.findUnique({
      where: {
        contestId_userId: {
          contestId,
          userId,
        },
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                questionOrder: true,
                questionText: true,
                type: true,
                maxPoints: true,
                options: true,
                // Include explanations only after contest is completed
                ...(contest.status === ContestStatus.COMPLETED && {
                  correctAnswer: true,
                  explanation: true,
                }),
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return null;
    }

    return submission;
  }

  async getContestSubmissions(
    contestId: string,
    userId: string,
    userRole: UserRole,
    query: PaginationDto,
  ) {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID '${contestId}' not found.`);
    }

    if (userRole !== UserRole.ADMIN && contest.creatorId !== userId) {
      throw new ForbiddenException(
        'Only the contest creator or an admin can inspect participant submissions.',
      );
    }

    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.submission.findMany({
        where: { contestId },
        skip,
        take: limit,
        orderBy: { rawScore: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              institutionName: true,
            },
          },
          _count: {
            select: {
              answers: true,
            },
          },
        },
      }),
      this.prisma.submission.count({ where: { contestId } }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async gradeManualAnswer(
    answerId: string,
    graderId: string,
    userRole: UserRole,
    dto: GradeAnswerDto,
  ) {
    const answer = await this.prisma.submissionAnswer.findUnique({
      where: { id: answerId },
      include: {
        submission: {
          include: {
            contest: true,
          },
        },
        question: true,
      },
    });

    if (!answer) {
      throw new NotFoundException(`Submission answer with ID '${answerId}' not found.`);
    }

    const contest = answer.submission.contest;
    if (userRole !== UserRole.ADMIN && contest.creatorId !== graderId) {
      throw new ForbiddenException('Only the contest creator or an admin can grade answers.');
    }

    const updatedAnswer = await this.prisma.submissionAnswer.update({
      where: { id: answerId },
      data: {
        score: dto.score,
        isCorrect: dto.isCorrect ?? (dto.score > 0),
        gradedById: graderId,
        gradedAt: new Date(),
      },
    });

    // Recompute total rawScore for the submission
    const allAnswers = await this.prisma.submissionAnswer.findMany({
      where: { submissionId: answer.submissionId },
    });

    const newRawScore = allAnswers.reduce((acc, curr) => acc + Number(curr.score), 0);

    const hasUngraded = allAnswers.some(
      (a) => a.id !== answerId && a.gradedAt === null,
    );

    await this.prisma.submission.update({
      where: { id: answer.submissionId },
      data: {
        rawScore: newRawScore,
        status: hasUngraded
          ? EvaluationStatus.MANUAL_REVIEW
          : EvaluationStatus.GRADED,
      },
    });

    return updatedAnswer;
  }
}
