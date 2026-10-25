import { Module } from '@nestjs/common';
import { ContestSchedulerService } from './contest-scheduler.service';
import { ContestsController } from './contests.controller';
import { ContestsService } from './contests.service';

@Module({
  controllers: [ContestsController],
  providers: [ContestsService, ContestSchedulerService],
  exports: [ContestsService, ContestSchedulerService],
})
export class ContestsModule {}
