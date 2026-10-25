import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ContestStatus, UserRole } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { generateSlug } from '../common/utils/slug.util';
import { PrismaService } from '../prisma/prisma.service';
import { ContestQueryDto } from './dto/contest-query.dto';
import { CreateContestDto } from './dto/create-contest.dto';
import { UpdateContestDto } from './dto/update-contest.dto';

@Injectable()
export class ContestsService {
  private readonly logger = new Logger(ContestsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ContestQueryDto, currentUserId?: string) {
    const { page = 1, limit = 20, status, category, difficulty, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(status
        ? { status }
        : {
            status: {
              in: [
                ContestStatus.SCHEDULED,
                ContestStatus.LIVE,
                ContestStatus.COMPLETED,
              ],
            },
          }),
      ...(category && { category }),
      ...(difficulty && { difficulty }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.contest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { contestStartAt: 'asc' },
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          difficulty: true,
          status: true,
          bannerUrl: true,
          registrationStartAt: true,
          registrationEndAt: true,
          contestStartAt: true,
          durationMinutes: true,
          maxScore: true,
          basePoints: true,
          organization: {
            select: {
              id: true,
              name: true,
              officialDomain: true,
            },
          },
          creator: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
          _count: {
            select: {
              registrations: true,
              questions: true,
            },
          },
        },
      }),
      this.prisma.contest.count({ where }),
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

  async findBySlug(slug: string, currentUserId?: string) {
    const contest = await this.prisma.contest.findUnique({
      where: { slug },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            officialDomain: true,
            websiteUrl: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
            username: true,
            institutionName: true,
          },
        },
        _count: {
          select: {
            registrations: true,
            questions: true,
          },
        },
      },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with slug '${slug}' not found.`);
    }

    let isRegistered = false;
    if (currentUserId) {
      const reg = await this.prisma.contestRegistration.findUnique({
        where: {
          contestId_userId: {
            contestId: contest.id,
            userId: currentUserId,
          },
        },
      });
      isRegistered = Boolean(reg);
    }

    return {
      ...contest,
      isRegistered,
    };
  }

  async create(dto: CreateContestDto, creatorId: string, userRole: UserRole) {
    // Validate schedule sequence
    if (new Date(dto.registrationStartAt) >= new Date(dto.registrationEndAt)) {
      throw new BadRequestException('registrationStartAt must be earlier than registrationEndAt.');
    }
    if (new Date(dto.registrationEndAt) > new Date(dto.contestStartAt)) {
      throw new BadRequestException('registrationEndAt cannot be after contestStartAt.');
    }

    // If teacher, verify affiliation approval with organization
    if (userRole === UserRole.TEACHER) {
      if (!dto.organizationId) {
        throw new BadRequestException('Teachers must link contests to an approved organization.');
      }
      const affiliation = await this.prisma.teacherOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId: creatorId,
            organizationId: dto.organizationId,
          },
        },
      });

      if (!affiliation || !affiliation.isApproved) {
        throw new ForbiddenException(
          'You are not an approved teacher for this organization.',
        );
      }
    }

    const slug = generateSlug(dto.title);

    const contest = await this.prisma.contest.create({
      data: {
        creatorId,
        organizationId: dto.organizationId || null,
        title: dto.title.trim(),
        slug,
        category: dto.category,
        description: dto.description.trim(),
        rules: dto.rules.trim(),
        difficulty: dto.difficulty,
        bannerUrl: dto.bannerUrl || null,
        status: ContestStatus.DRAFT,
        registrationStartAt: new Date(dto.registrationStartAt),
        registrationEndAt: new Date(dto.registrationEndAt),
        contestStartAt: new Date(dto.contestStartAt),
        durationMinutes: dto.durationMinutes,
        maxScore: dto.maxScore ?? 100,
        basePoints: dto.basePoints ?? 500,
      },
    });

    this.logger.log(`Contest created in DRAFT: ${contest.title} (${contest.id})`);
    return contest;
  }

  async update(
    id: string,
    dto: UpdateContestDto,
    userId: string,
    userRole: UserRole,
  ) {
    const contest = await this.prisma.contest.findUnique({ where: { id } });
    if (!contest) {
      throw new NotFoundException(`Contest with ID '${id}' not found.`);
    }

    if (userRole !== UserRole.ADMIN && contest.creatorId !== userId) {
      throw new ForbiddenException('Only the contest creator or an admin can update this contest.');
    }

    if (
      contest.status !== ContestStatus.DRAFT &&
      contest.status !== ContestStatus.CHANGES_REQUESTED
    ) {
      throw new BadRequestException(
        `Contest cannot be edited in '${contest.status}' status. Only DRAFT or CHANGES_REQUESTED allows edits.`,
      );
    }

    const updated = await this.prisma.contest.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title.trim() }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.description !== undefined && { description: dto.description.trim() }),
        ...(dto.rules !== undefined && { rules: dto.rules.trim() }),
        ...(dto.difficulty !== undefined && { difficulty: dto.difficulty }),
        ...(dto.bannerUrl !== undefined && { bannerUrl: dto.bannerUrl }),
        ...(dto.registrationStartAt !== undefined && {
          registrationStartAt: new Date(dto.registrationStartAt),
        }),
        ...(dto.registrationEndAt !== undefined && {
          registrationEndAt: new Date(dto.registrationEndAt),
        }),
        ...(dto.contestStartAt !== undefined && {
          contestStartAt: new Date(dto.contestStartAt),
        }),
        ...(dto.durationMinutes !== undefined && { durationMinutes: dto.durationMinutes }),
        ...(dto.maxScore !== undefined && { maxScore: dto.maxScore }),
        ...(dto.basePoints !== undefined && { basePoints: dto.basePoints }),
      },
    });

    this.logger.log(`Contest updated: ${updated.id}`);
    return updated;
  }

  async submitReview(id: string, userId: string, userRole: UserRole) {
    const contest = await this.prisma.contest.findUnique({
      where: { id },
      include: { _count: { select: { questions: true } } },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID '${id}' not found.`);
    }

    if (userRole !== UserRole.ADMIN && contest.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can submit this contest for review.');
    }

    if (
      contest.status !== ContestStatus.DRAFT &&
      contest.status !== ContestStatus.CHANGES_REQUESTED
    ) {
      throw new BadRequestException(
        `Contest must be in DRAFT or CHANGES_REQUESTED to be submitted for review. Current: ${contest.status}`,
      );
    }

    if (contest._count.questions < 1) {
      throw new BadRequestException(
        'Cannot submit contest for review without at least 1 question in the problem set.',
      );
    }

    const updated = await this.prisma.contest.update({
      where: { id },
      data: {
        status: ContestStatus.IN_REVIEW,
      },
    });

    this.logger.log(`Contest ${id} submitted for admin review by ${userId}`);
    return {
      message: 'Contest submitted successfully for platform review.',
      contest: updated,
    };
  }

  async register(id: string, userId: string) {
    const contest = await this.prisma.contest.findUnique({
      where: { id },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID '${id}' not found.`);
    }

    if (
      contest.status !== ContestStatus.SCHEDULED &&
      contest.status !== ContestStatus.LIVE
    ) {
      throw new BadRequestException(
        `Registration is closed. Contest is currently in '${contest.status}' status.`,
      );
    }

    const now = new Date();
    if (now < contest.registrationStartAt) {
      throw new BadRequestException('Registration has not opened yet.');
    }
    if (now > contest.registrationEndAt) {
      throw new BadRequestException('Registration deadline has passed.');
    }

    const existing = await this.prisma.contestRegistration.findUnique({
      where: {
        contestId_userId: {
          contestId: id,
          userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('You are already registered for this contest.');
    }

    const registration = await this.prisma.contestRegistration.create({
      data: {
        contestId: id,
        userId,
      },
      include: {
        contest: {
          select: {
            title: true,
            slug: true,
            contestStartAt: true,
          },
        },
      },
    });

    this.logger.log(`User ${userId} registered for contest ${id}`);
    return {
      message: 'Successfully registered for the contest.',
      registration,
    };
  }

  async getMyContests(userId: string, query: PaginationDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.contest.findMany({
        where: { creatorId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              questions: true,
              registrations: true,
            },
          },
        },
      }),
      this.prisma.contest.count({
        where: { creatorId: userId },
      }),
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
}
