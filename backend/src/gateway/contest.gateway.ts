import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  namespace: '/ws',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ContestGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ContestGateway.name);
  private readonly accessSecret: string;
  private readonly userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.accessSecret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'olympido_jwt_access_super_secret_token_key_development_2026',
    );
  }

  async handleConnection(client: Socket) {
    try {
      const rawToken =
        client.handshake.auth?.token ||
        (client.handshake.headers.authorization
          ? client.handshake.headers.authorization.replace('Bearer ', '')
          : null);

      if (!rawToken) {
        this.logger.debug(`Anonymous client connected: ${client.id}`);
        return;
      }

      const payload = this.jwtService.verify(rawToken, {
        secret: this.accessSecret,
      });

      client.data.user = payload;

      // Track user socket ID
      if (!this.userSockets.has(payload.sub)) {
        this.userSockets.set(payload.sub, new Set());
      }
      this.userSockets.get(payload.sub)?.add(client.id);

      this.logger.log(`Authenticated client connected: ${client.id} (User: ${payload.sub})`);
    } catch (err: any) {
      this.logger.warn(`WebSocket handshake auth failed for client ${client.id}: ${err.message}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.user?.sub;
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)?.delete(client.id);
      if (this.userSockets.get(userId)?.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('contest:join')
  async handleJoinContest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { contestId: string },
  ) {
    if (!data?.contestId) {
      return { error: 'contestId is required' };
    }

    const room = `contest:${data.contestId}`;
    await client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);

    return {
      event: 'contest:joined',
      room,
      timestamp: new Date().toISOString(),
    };
  }

  @SubscribeMessage('contest:leave')
  async handleLeaveContest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { contestId: string },
  ) {
    if (!data?.contestId) return;

    const room = `contest:${data.contestId}`;
    await client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);

    return { event: 'contest:left', room };
  }

  @SubscribeMessage('contest:ping')
  handlePing(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { contestId?: string },
  ) {
    return {
      event: 'contest:pong',
      serverTime: new Date().toISOString(),
      contestId: data?.contestId,
    };
  }

  // Server broadcast methods
  broadcastContestStarted(contestId: string, details?: any) {
    const room = `contest:${contestId}`;
    this.server.to(room).emit('contest:started', {
      contestId,
      timestamp: new Date().toISOString(),
      details,
    });
    this.logger.log(`Broadcasted 'contest:started' to room ${room}`);
  }

  broadcastContestEnded(contestId: string, details?: any) {
    const room = `contest:${contestId}`;
    this.server.to(room).emit('contest:ended', {
      contestId,
      timestamp: new Date().toISOString(),
      details,
    });
    this.logger.log(`Broadcasted 'contest:ended' to room ${room}`);
  }

  broadcastTick(contestId: string, remainingSeconds: number) {
    const room = `contest:${contestId}`;
    this.server.to(room).emit('contest:tick', {
      contestId,
      remainingSeconds,
      timestamp: new Date().toISOString(),
    });
  }

  sendSubmissionAck(userId: string, data: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets && sockets.size > 0) {
      for (const socketId of sockets) {
        this.server.to(socketId).emit('submission:ack', data);
      }
    }
  }

  sendNotificationToUser(userId: string, notification: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets && sockets.size > 0) {
      for (const socketId of sockets) {
        this.server.to(socketId).emit('notification:new', notification);
      }
      this.logger.log(`Pushed real-time notification to user ${userId} across ${sockets.size} active socket(s)`);
    }
  }
}
