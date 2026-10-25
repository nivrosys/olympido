import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ContestStatus, OrgStatus } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewContestDto } from './dto/review-contest.dto';
import { ReviewOrganizationDto } from './dto/review-organization.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPendingContests(query: PaginationDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.contest.findMany({
        where: { status: ContestStatus.IN_REVIEW },
        skip,
        take: limit,
        orderBy: { updatedAt: 'asc' },
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              username: true,
              email: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              officialDomain: true,
            },
          },
          _count: {
            select: {
              questions: true,
            },
          },
        },
      }),
      this.prisma.contest.count({
        where: { status: ContestStatus.IN_REVIEW },
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

  async reviewContest(id: string, dto: ReviewContestDto, adminId: string) {
    const contest = await this.prisma.contest.findUnique({
      where: { id },
      include: { _count: { select: { questions: true } } },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID '${id}' not found.`);
    }

    if (contest.status !== ContestStatus.IN_REVIEW && contest.status !== ContestStatus.DRAFT) {
      throw new BadRequestException(
        `Contest is in status '${contest.status}' and cannot be reviewed. Must be in IN_REVIEW.`,
      );
    }

    if (dto.status === ContestStatus.APPROVED && contest._count.questions === 0) {
      throw new BadRequestException('Cannot approve a contest that has no questions.');
    }

    // Per plan: If approved and start time is in future -> automatically transition to SCHEDULED
    let targetStatus = dto.status;
    if (dto.status === ContestStatus.APPROVED) {
      if (new Date(contest.contestStartAt) > new Date()) {
        targetStatus = ContestStatus.SCHEDULED;
      }
    }

    const updated = await this.prisma.contest.update({
      where: { id },
      data: {
        status: targetStatus,
        reviewedById: adminId,
        reviewedAt: new Date(),
        adminReviewNotes: dto.reviewNotes || null,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    this.logger.log(`Contest ${id} reviewed by admin ${adminId}: ${targetStatus}`);
    return updated;
  }

  async getPendingOrganizations(query: PaginationDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.organization.findMany({
        where: { status: OrgStatus.PENDING_VERIFICATION },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.organization.count({
        where: { status: OrgStatus.PENDING_VERIFICATION },
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

  async reviewOrganization(id: string, dto: ReviewOrganizationDto, adminId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!org) {
      throw new NotFoundException(`Organization with ID '${id}' not found.`);
    }

    const updated = await this.prisma.organization.update({
      where: { id },
      data: {
        status: dto.status,
        verifiedById: adminId,
        verifiedAt: new Date(),
        rejectionReason: dto.rejectionReason || null,
      },
    });

    this.logger.log(`Organization ${id} reviewed by admin ${adminId}: ${dto.status}`);
    return updated;
  }

  async getAuditLogs(query: PaginationDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count(),
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
