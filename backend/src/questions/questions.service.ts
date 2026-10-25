import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ContestStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { ReorderQuestionsDto } from './dto/reorder-questions.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  private readonly logger = new Logger(QuestionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    contestId: string,
    dto: CreateQuestionDto,
    userId: string,
    userRole: UserRole,
  ) {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID '${contestId}' not found.`);
    }

    if (userRole !== UserRole.ADMIN && contest.creatorId !== userId) {
      throw new ForbiddenException('Only the contest creator or an admin can add questions.');
    }

    if (
      contest.status !== ContestStatus.DRAFT &&
      contest.status !== ContestStatus.CHANGES_REQUESTED
    ) {
      throw new BadRequestException(
        `Questions can only be added when contest is in DRAFT or CHANGES_REQUESTED status. Current: ${contest.status}`,
      );
    }

    // Determine next order
    const lastQuestion = await this.prisma.contestQuestion.findFirst({
      where: { contestId },
      orderBy: { questionOrder: 'desc' },
      select: { questionOrder: true },
    });
    const questionOrder = (lastQuestion?.questionOrder ?? 0) + 1;

    const question = await this.prisma.contestQuestion.create({
      data: {
        contestId,
        questionOrder,
        type: dto.type,
        questionText: dto.questionText.trim(),
        options: dto.options ? JSON.parse(JSON.stringify(dto.options)) : undefined,
        correctAnswer: dto.correctAnswer?.trim() || null,
        explanation: dto.explanation?.trim() || null,
        maxPoints: dto.maxPoints ?? 10.0,
        timeLimitSeconds: dto.timeLimitSeconds || null,
        attachments: dto.attachments ? JSON.parse(JSON.stringify(dto.attachments)) : undefined,
      },
    });

    this.logger.log(`Question added to contest ${contestId} (Order #${questionOrder})`);
    return question;
  }

  async findAll(contestId: string, userId?: string, userRole?: UserRole) {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID '${contestId}' not found.`);
    }

    const isPrivileged =
      userRole === UserRole.ADMIN || (userId && contest.creatorId === userId);

    const isAfterContest = contest.status === ContestStatus.COMPLETED;

    const questions = await this.prisma.contestQuestion.findMany({
      where: { contestId },
      orderBy: { questionOrder: 'asc' },
    });

    // If privileged or contest is completed, return full answers & explanations
    if (isPrivileged || isAfterContest) {
      return questions;
    }

    // Otherwise, sanitize answers & explanations to prevent leaks
    return questions.map((q) => {
      let sanitizedOptions = q.options;
      if (Array.isArray(sanitizedOptions)) {
        sanitizedOptions = sanitizedOptions.map((opt: any) => ({
          label: opt.label,
          text: opt.text,
        }));
      }

      return {
        id: q.id,
        contestId: q.contestId,
        questionOrder: q.questionOrder,
        type: q.type,
        questionText: q.questionText,
        options: sanitizedOptions,
        maxPoints: q.maxPoints,
        timeLimitSeconds: q.timeLimitSeconds,
        attachments: q.attachments,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      };
    });
  }

  async findOne(
    contestId: string,
    questionId: string,
    userId?: string,
    userRole?: UserRole,
  ) {
    const contest = await this.prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) {
      throw new NotFoundException(`Contest with ID '${contestId}' not found.`);
    }

    const q = await this.prisma.contestQuestion.findFirst({
      where: { id: questionId, contestId },
    });

    if (!q) {
      throw new NotFoundException(`Question with ID '${questionId}' not found in this contest.`);
    }

    const isPrivileged =
      userRole === UserRole.ADMIN || (userId && contest.creatorId === userId);
    const isAfterContest = contest.status === ContestStatus.COMPLETED;

    if (isPrivileged || isAfterContest) {
      return q;
    }

    let sanitizedOptions = q.options;
    if (Array.isArray(sanitizedOptions)) {
      sanitizedOptions = sanitizedOptions.map((opt: any) => ({
        label: opt.label,
        text: opt.text,
      }));
    }

    return {
      id: q.id,
      contestId: q.contestId,
      questionOrder: q.questionOrder,
      type: q.type,
      questionText: q.questionText,
      options: sanitizedOptions,
      maxPoints: q.maxPoints,
      timeLimitSeconds: q.timeLimitSeconds,
      attachments: q.attachments,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    };
  }

  async update(
    contestId: string,
    questionId: string,
    dto: UpdateQuestionDto,
    userId: string,
    userRole: UserRole,
  ) {
    const contest = await this.prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) {
      throw new NotFoundException(`Contest with ID '${contestId}' not found.`);
    }

    if (userRole !== UserRole.ADMIN && contest.creatorId !== userId) {
      throw new ForbiddenException('Only the contest creator or an admin can edit questions.');
    }

    if (
      contest.status !== ContestStatus.DRAFT &&
      contest.status !== ContestStatus.CHANGES_REQUESTED
    ) {
      throw new BadRequestException('Cannot edit questions outside of DRAFT or CHANGES_REQUESTED.');
    }

    const updated = await this.prisma.contestQuestion.update({
      where: { id: questionId },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.questionText !== undefined && { questionText: dto.questionText.trim() }),
        ...(dto.options !== undefined && {
          options: JSON.parse(JSON.stringify(dto.options)),
        }),
        ...(dto.correctAnswer !== undefined && {
          correctAnswer: dto.correctAnswer?.trim() || null,
        }),
        ...(dto.explanation !== undefined && {
          explanation: dto.explanation?.trim() || null,
        }),
        ...(dto.maxPoints !== undefined && { maxPoints: dto.maxPoints }),
        ...(dto.timeLimitSeconds !== undefined && {
          timeLimitSeconds: dto.timeLimitSeconds,
        }),
        ...(dto.attachments !== undefined && {
          attachments: JSON.parse(JSON.stringify(dto.attachments)),
        }),
      },
    });

    this.logger.log(`Question ${questionId} updated in contest ${contestId}`);
    return updated;
  }

  async delete(
    contestId: string,
    questionId: string,
    userId: string,
    userRole: UserRole,
  ) {
    const contest = await this.prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) {
      throw new NotFoundException(`Contest with ID '${contestId}' not found.`);
    }

    if (userRole !== UserRole.ADMIN && contest.creatorId !== userId) {
      throw new ForbiddenException('Only the contest creator or an admin can delete questions.');
    }

    if (
      contest.status !== ContestStatus.DRAFT &&
      contest.status !== ContestStatus.CHANGES_REQUESTED
    ) {
      throw new BadRequestException('Cannot delete questions outside of DRAFT or CHANGES_REQUESTED.');
    }

    await this.prisma.contestQuestion.delete({
      where: { id: questionId },
    });

    this.logger.log(`Question ${questionId} deleted from contest ${contestId}`);
    return { message: 'Question deleted successfully.' };
  }

  async reorder(
    contestId: string,
    dto: ReorderQuestionsDto,
    userId: string,
    userRole: UserRole,
  ) {
    const contest = await this.prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) {
      throw new NotFoundException(`Contest with ID '${contestId}' not found.`);
    }

    if (userRole !== UserRole.ADMIN && contest.creatorId !== userId) {
      throw new ForbiddenException('Only the contest creator or an admin can reorder questions.');
    }

    if (
      contest.status !== ContestStatus.DRAFT &&
      contest.status !== ContestStatus.CHANGES_REQUESTED
    ) {
      throw new BadRequestException('Cannot reorder questions outside of DRAFT or CHANGES_REQUESTED.');
    }

    await this.prisma.$transaction(
      dto.orders.map((item) =>
        this.prisma.contestQuestion.update({
          where: { id: item.questionId },
          data: { questionOrder: item.newOrder },
        }),
      ),
    );

    this.logger.log(`Reordered ${dto.orders.length} questions in contest ${contestId}`);
    return { message: 'Questions reordered successfully.' };
  }
}
