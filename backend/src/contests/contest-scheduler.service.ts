import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContestStatus } from '@prisma/client';
import { ContestGateway } from '../gateway/contest.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContestSchedulerService {
  private readonly logger = new Logger(ContestSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: ContestGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    await this.tickSchedule();
  }

  async tickSchedule() {
    const now = new Date();

    // 1. SCHEDULED -> LIVE
    const scheduledToLive = await this.prisma.contest.findMany({
      where: {
        status: ContestStatus.SCHEDULED,
        contestStartAt: { lte: now },
      },
    });

    for (const contest of scheduledToLive) {
      await this.prisma.contest.update({
        where: { id: contest.id },
        data: { status: ContestStatus.LIVE },
      });
      this.logger.log(`Contest transitioned to LIVE: ${contest.title} (${contest.id})`);
      this.gateway.broadcastContestStarted(contest.id, {
        title: contest.title,
        durationMinutes: contest.durationMinutes,
      });

      // Dispatch real-time CONTEST_LIVE notification to all registered participants
      const registrations = await this.prisma.contestRegistration.findMany({
        where: { contestId: contest.id },
        select: { userId: true },
      });
      for (const reg of registrations) {
        await this.notificationsService
          .createNotification({
            userId: reg.userId,
            type: 'CONTEST_LIVE',
            title: `Contest is LIVE: ${contest.title}`,
            message: `The Olympiad contest is now LIVE! You have ${contest.durationMinutes} minutes to compete.`,
            referenceType: 'CONTEST',
            referenceId: contest.id,
          })
          .catch((err) => {
            this.logger.warn(`Failed to notify participant ${reg.userId}: ${err.message}`);
          });
      }
    }

    // 2. LIVE -> EVALUATION
    const liveContests = await this.prisma.contest.findMany({
      where: {
        status: ContestStatus.LIVE,
      },
    });

    const transitionedToEval: string[] = [];

    for (const contest of liveContests) {
      const endTime = new Date(
        contest.contestStartAt.getTime() + contest.durationMinutes * 60 * 1000,
      );

      if (now >= endTime) {
        await this.prisma.contest.update({
          where: { id: contest.id },
          data: { status: ContestStatus.EVALUATION },
        });
        transitionedToEval.push(contest.id);
        this.logger.log(`Contest transitioned to EVALUATION: ${contest.title} (${contest.id})`);
        this.gateway.broadcastContestEnded(contest.id, {
          title: contest.title,
        });
      }
    }

    return {
      now: now.toISOString(),
      transitionedToLive: scheduledToLive.map((c) => ({ id: c.id, title: c.title })),
      transitionedToEvaluation: transitionedToEval,
    };
  }
}
