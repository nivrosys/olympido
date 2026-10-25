import { Module } from '@nestjs/common';
import { RatingCalculationService } from './rating-calculation.service';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';

@Module({
  controllers: [ResultsController],
  providers: [ResultsService, RatingCalculationService],
  exports: [ResultsService, RatingCalculationService],
})
export class ResultsModule {}
