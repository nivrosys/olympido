import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth('bearer')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get paginated notifications for current authenticated user',
    description: 'Returns notifications ordered by createdAt DESC with optional unreadOnly filter.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean, example: false })
  async getUserNotifications(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('unreadOnly') unreadOnly?: boolean | string,
  ) {
    const isUnreadOnly = unreadOnly === true || unreadOnly === 'true';
    return this.notificationsService.getUserNotifications(
      req.user.id,
      Number(page) || 1,
      Number(limit) || 20,
      isUnreadOnly,
    );
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get total unread notifications count for current user',
    description: 'Lightweight endpoint for polling or badge display.',
  })
  async getUnreadCount(@Request() req: any) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Put('mark-all-read')
  @ApiOperation({
    summary: 'Mark all unread notifications as read',
    description: 'Bulk updates all unread notifications belonging to the logged-in user.',
  })
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Put(':id/read')
  @ApiOperation({
    summary: 'Mark a single notification as read',
    description: 'Updates isRead = true for the specified notification ID.',
  })
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }
}
