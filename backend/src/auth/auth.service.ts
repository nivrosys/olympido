import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly bcryptRounds: number;
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiry: string;
  private readonly refreshExpiry: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.bcryptRounds = Number(this.configService.get<number>('BCRYPT_ROUNDS', 12));
    this.accessSecret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'olympido_jwt_access_super_secret_token_key_development_2026',
    );
    this.refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'olympido_jwt_refresh_super_secret_token_key_development_2026',
    );
    this.accessExpiry = this.configService.get<string>('JWT_ACCESS_EXPIRY', '15m');
    this.refreshExpiry = this.configService.get<string>('JWT_REFRESH_EXPIRY', '7d');
  }

  async registerStudent(dto: RegisterStudentDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email.toLowerCase().trim() },
          { username: dto.username.toLowerCase().trim() },
        ],
      },
    });

    if (existing) {
      if (existing.email.toLowerCase() === dto.email.toLowerCase().trim()) {
        throw new ConflictException('An account with this email address already exists.');
      }
      throw new ConflictException('This username is already taken.');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds);
    const verificationRawToken = uuidv4();
    const tokenHash = crypto.createHash('sha256').update(verificationRawToken).digest('hex');

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          username: dto.username.toLowerCase().trim(),
          fullName: dto.fullName.trim(),
          passwordHash,
          role: UserRole.STUDENT,
          institutionName: dto.institutionName?.trim() || null,
          isEmailVerified: false,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          username: true,
          fullName: true,
          role: true,
          institutionName: true,
          isEmailVerified: true,
          createdAt: true,
        },
      });

      await tx.studentStats.create({
        data: {
          userId: user.id,
          currentRating: 1200,
          peakRating: 1200,
          totalPoints: BigInt(0),
          contestsParticipated: 0,
          podiumFinishes: 0,
          currentStreak: 0,
          longestStreak: 0,
        },
      });

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await tx.authToken.create({
        data: {
          userId: user.id,
          tokenType: TokenType.EMAIL_VERIFICATION,
          tokenHash,
          expiresAt,
        },
      });

      return { user, verificationToken: verificationRawToken };
    });

    this.logger.log(`Student registered successfully: ${result.user.email} (${result.user.id})`);

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      user: result.user,
      verificationToken: result.verificationToken, // Expose for testing/demo
    };
  }

  async login(dto: LoginDto) {
    const identifier = dto.emailOrUsername.toLowerCase().trim();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email/username or password.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email/username or password.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated. Please contact support.');
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');

    const authToken = await this.prisma.authToken.findFirst({
      where: {
        tokenHash,
        tokenType: TokenType.EMAIL_VERIFICATION,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!authToken) {
      throw new BadRequestException('Invalid or expired email verification token.');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: authToken.userId },
        data: { isEmailVerified: true },
      }),
      this.prisma.authToken.update({
        where: { id: authToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    this.logger.log(`Email verified for user: ${authToken.user.email}`);

    return {
      message: 'Email verified successfully. You now have full access to contest participation.',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      // Return ambiguous message for security
      return {
        message: 'If the provided email is associated with an account, a reset link has been dispatched.',
      };
    }

    const rawToken = uuidv4();
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.authToken.create({
      data: {
        userId: user.id,
        tokenType: TokenType.PASSWORD_RESET,
        tokenHash,
        expiresAt,
      },
    });

    this.logger.log(`Password reset requested for user: ${user.email}`);

    return {
      message: 'If the provided email is associated with an account, a reset link has been dispatched.',
      resetToken: rawToken, // Expose for testing/demo
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');

    const authToken = await this.prisma.authToken.findFirst({
      where: {
        tokenHash,
        tokenType: TokenType.PASSWORD_RESET,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!authToken) {
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, this.bcryptRounds);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: authToken.userId },
        data: { passwordHash },
      }),
      this.prisma.authToken.update({
        where: { id: authToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    this.logger.log(`Password reset completed for user ID: ${authToken.userId}`);

    return {
      message: 'Password reset successful. Please log in with your new credentials.',
    };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
        secret: this.refreshSecret,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User account no longer active.');
      }

      const tokens = await this.generateTokens({
        sub: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
      });

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
            following: true,
            followers: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    // Convert BigInt totalPoints to number or string for JSON serialization
    const formattedStats = user.studentStats
      ? {
          ...user.studentStats,
          totalPoints: Number(user.studentStats.totalPoints),
        }
      : null;

    return {
      ...user,
      studentStats: formattedStats,
    };
  }

  private async generateTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
          username: payload.username,
        },
        {
          secret: this.accessSecret,
          expiresIn: this.accessExpiry as any,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
          username: payload.username,
        },
        {
          secret: this.refreshSecret,
          expiresIn: this.refreshExpiry as any,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
