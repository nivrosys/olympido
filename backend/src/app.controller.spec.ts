import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';

describe('AppController', () => {
  let appController: AppController;
  let mockPrisma: any;
  let mockRedis: any;

  beforeEach(async () => {
    mockPrisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    };
    mockRedis = {
      isHealthy: jest.fn().mockResolvedValue(true),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return operational status and dependencies', async () => {
      const health = await appController.getHealth();
      expect(health.status).toBe('ok');
      expect(health.service).toBe('Olympido Backend API');
      expect(health.version).toBe('1.0.0');
      expect(health.dependencies.database).toBe('connected');
      expect(health.dependencies.redis).toBe('connected');
    });
  });
});
