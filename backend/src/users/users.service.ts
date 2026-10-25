import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfileByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: username.toLowerCase().trim() },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        bio: true,
        institutionName: true,
        createdAt: true,
        studentStats: {
          select: {
            currentRating: true,
            peakRating: true,
            totalPoints: true,
            contestsParticipated: true,
            podiumFinishes: true,
            currentStreak: true,
            longestStreak: true,
          },
        },
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with username '${username}' not found.`);
    }

    return {
      ...user,
      studentStats: user.studentStats
        ? {
            ...user.studentStats,
            totalPoints: Number(user.studentStats.totalPoints),
          }
        : null,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName.trim() }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl.trim() }),
        ...(dto.bio !== undefined && { bio: dto.bio.trim() }),
        ...(dto.institutionName !== undefined && {
          institutionName: dto.institutionName.trim(),
        }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        bio: true,
        institutionName: true,
        isEmailVerified: true,
        updatedAt: true,
      },
    });

    return updated;
  }
}
