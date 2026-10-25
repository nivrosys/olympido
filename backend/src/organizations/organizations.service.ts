import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrgStatus } from '@prisma/client';
import { isDisposableDomain } from '../common/utils/domain-validator.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationQueryDto } from './dto/organization-query.dto';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: OrganizationQueryDto) {
    const { page = 1, limit = 20, status = OrgStatus.VERIFIED, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { officialDomain: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          officialDomain: true,
          contactEmail: true,
          websiteUrl: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              contests: true,
              teacherOrganizations: true,
            },
          },
        },
      }),
      this.prisma.organization.count({ where }),
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

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        verifiedBy: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
        _count: {
          select: {
            contests: true,
            teacherOrganizations: true,
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException(`Organization with ID '${id}' not found.`);
    }

    return org;
  }

  async create(dto: CreateOrganizationDto) {
    const domain = dto.officialDomain.toLowerCase().trim();
    if (isDisposableDomain(domain)) {
      throw new BadRequestException('Disposable or temporary email domains are not permitted.');
    }

    const existing = await this.prisma.organization.findUnique({
      where: { officialDomain: domain },
    });

    if (existing) {
      throw new ConflictException(
        `Organization with domain '${domain}' is already registered.`,
      );
    }

    const org = await this.prisma.organization.create({
      data: {
        name: dto.name.trim(),
        officialDomain: domain,
        contactEmail: dto.contactEmail.toLowerCase().trim(),
        websiteUrl: dto.websiteUrl?.trim() || null,
        accreditationDocumentUrl: dto.accreditationDocumentUrl?.trim() || null,
        status: OrgStatus.PENDING_VERIFICATION,
      },
    });

    this.logger.log(`New organization created: ${org.name} (${org.officialDomain})`);
    return org;
  }

  async getTeachers(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) {
      throw new NotFoundException(`Organization with ID '${organizationId}' not found.`);
    }

    const affiliations = await this.prisma.teacherOrganization.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
      },
    });

    return affiliations;
  }

  async approveTeacher(
    organizationId: string,
    teacherUserId: string,
    isApproved: boolean,
    approverUserId: string,
  ) {
    const affiliation = await this.prisma.teacherOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: teacherUserId,
          organizationId,
        },
      },
    });

    if (!affiliation) {
      throw new NotFoundException('Affiliation record not found.');
    }

    const updated = await this.prisma.teacherOrganization.update({
      where: {
        userId_organizationId: {
          userId: teacherUserId,
          organizationId,
        },
      },
      data: {
        isApproved,
        approvedById: approverUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
          },
        },
      },
    });

    this.logger.log(
      `Teacher affiliation ${isApproved ? 'approved' : 'rejected'} for ${teacherUserId} in org ${organizationId}`,
    );

    return updated;
  }
}
