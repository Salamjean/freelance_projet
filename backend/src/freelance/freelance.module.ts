import { Module } from '@nestjs/common';
import { FreelanceService } from './freelance.service';
import { FreelanceController } from './freelance.controller';

@Module({
  controllers: [FreelanceController],
  providers: [FreelanceService],
})
export class FreelanceModule {}
