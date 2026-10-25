import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const actorId = req.user?.id;
    const method = req.method;
    const url = req.url;
    const ipAddress = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || null) as string | null;
    const userAgent = req.headers['user-agent'] || null;

    return next.handle().pipe(
      tap({
        next: (responseData) => {
          if (!actorId) return;

          // Asynchronously record audit log without blocking the HTTP response
          this.recordLog({
            actorId,
            action: `${method} ${url}`,
            targetType: req.params?.id ? 'ENTITY' : 'COLLECTION',
            targetId: req.params?.id || actorId,
            oldValue: req.body || null,
            newValue: responseData || null,
            ipAddress,
            userAgent,
          }).catch((err) => {
            this.logger.error(`Failed to record audit log: ${err.message}`);
          });
        },
      }),
    );
  }

  private async recordLog(data: {
    actorId: string;
    action: string;
    targetType: string;
    targetId: string;
    oldValue: any;
    newValue: any;
    ipAddress: string | null;
    userAgent: string | null;
  }) {
    await this.prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId,
        oldValue: data.oldValue ? JSON.parse(JSON.stringify(data.oldValue)) : undefined,
        newValue: data.newValue ? JSON.parse(JSON.stringify(data.newValue)) : undefined,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }
}
