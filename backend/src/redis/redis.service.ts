import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD', '');

    try {
      this.client = new Redis({
        host,
        port: Number(port),
        password: password || undefined,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy(times) {
          if (times > 3) {
            return null; // Stop reconnecting after 3 tries if redis server is unavailable
          }
          return Math.min(times * 1000, 3000);
        },
      });

      this.client.on('connect', () => {
        this.logger.log(`Connected to Redis at ${host}:${port}`);
      });

      this.client.on('error', (err) => {
        this.logger.warn(`Redis connection error: ${err.message}`);
      });

      // Attempt to connect non-blocking
      this.client.connect().catch((err) => {
        this.logger.warn(`Redis initial connection skipped: ${err.message}`);
      });
    } catch (err: any) {
      this.logger.warn(`Redis initialization failed: ${err.message}`);
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  async isHealthy(): Promise<boolean> {
    if (!this.client) return false;
    try {
      const res = await this.client.ping();
      return res === 'PONG';
    } catch {
      return false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    try {
      return await this.client.get(key);
    } catch (err: any) {
      this.logger.error(`Error reading key ${key} from Redis: ${err.message}`);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) return;
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (err: any) {
      this.logger.error(`Error setting key ${key} in Redis: ${err.message}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.del(key);
    } catch (err: any) {
      this.logger.error(`Error deleting key ${key} from Redis: ${err.message}`);
    }
  }

  async zadd(key: string, score: number, member: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.zadd(key, score, member);
    } catch (err: any) {
      this.logger.error(`Error in zadd for key ${key}: ${err.message}`);
    }
  }

  async zrevrangeWithScores(
    key: string,
    start: number,
    stop: number,
  ): Promise<Array<{ member: string; score: number }>> {
    if (!this.client) return [];
    try {
      const result = await this.client.zrevrange(key, start, stop, 'WITHSCORES');
      const formatted: Array<{ member: string; score: number }> = [];
      for (let i = 0; i < result.length; i += 2) {
        formatted.push({
          member: result[i],
          score: parseFloat(result[i + 1]),
        });
      }
      return formatted;
    } catch (err: any) {
      this.logger.error(`Error in zrevrange for key ${key}: ${err.message}`);
      return [];
    }
  }

  async zrevrank(key: string, member: string): Promise<number | null> {
    if (!this.client) return null;
    try {
      return await this.client.zrevrank(key, member);
    } catch (err: any) {
      this.logger.error(`Error in zrevrank for key ${key}: ${err.message}`);
      return null;
    }
  }

  async zincrby(key: string, increment: number, member: string): Promise<number | null> {
    if (!this.client) return null;
    try {
      const res = await this.client.zincrby(key, increment, member);
      return parseFloat(res);
    } catch (err: any) {
      this.logger.error(`Error in zincrby for key ${key}: ${err.message}`);
      return null;
    }
  }

  async zscore(key: string, member: string): Promise<number | null> {
    if (!this.client) return null;
    try {
      const res = await this.client.zscore(key, member);
      return res !== null ? parseFloat(res) : null;
    } catch (err: any) {
      this.logger.error(`Error in zscore for key ${key}: ${err.message}`);
      return null;
    }
  }

  async zcard(key: string): Promise<number> {
    if (!this.client) return 0;
    try {
      return await this.client.zcard(key);
    } catch (err: any) {
      this.logger.error(`Error in zcard for key ${key}: ${err.message}`);
      return 0;
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.expire(key, seconds);
    } catch (err: any) {
      this.logger.error(`Error in expire for key ${key}: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit().catch(() => {});
      this.logger.log('Redis client closed.');
    }
  }
}
