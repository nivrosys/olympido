import { Module } from '@nestjs/common';
import { AutoGraderService } from './auto-grader.service';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';

@Module({
  controllers: [SubmissionsController],
  providers: [SubmissionsService, AutoGraderService],
  exports: [SubmissionsService, AutoGraderService],
})
export class SubmissionsModule {}
