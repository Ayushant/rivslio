import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BlogSummaryProcessor } from './blog-summary.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'blog-summary' }),
  ],
  providers: [BlogSummaryProcessor],
})
export class JobsModule {}
