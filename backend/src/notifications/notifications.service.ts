import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ContestGateway } from '../gateway/contest.gateway';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  message?: string;
  referenceType?: string;
  referenceId?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: ContestGateway,
  ) {}

  /**
   * Persists a notification to PostgreSQL and pushes real-time event to user's active WebSockets.
   */
  async createNotification(params: CreateNotificationParams) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        referenceType: params.referenceType,
        referenceId: params.referenceId,
      },
    });

    this.logger.log(`Created notification [${notification.type}] for user ${params.userId}: "${notification.title}"`);

    // Real-time WebSocket push
    try {
      this.gateway.sendNotificationToUser(params.userId, notification);
    } catch (err: any) {
      this.logger.warn(`Failed to push notification via WebSocket: ${err.message}`);
    }

    return notification;
  }

  /**
   * Retrieves paginated notifications for the user.
   */
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [total, unreadCount, items] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items,
      meta: {
        total,
        unreadCount,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Returns current count of unread notifications.
   */
  async getUnreadCount(userId: string) {
    const unreadCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { unreadCount };
  }

  /**
   * Marks a single notification as read.
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException(`Notification with ID ${notificationId} not found`);
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  /**
   * Marks all notifications as read for the user.
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return {
      message: 'All notifications marked as read',
      updatedCount: result.count,
    };
  }
}
