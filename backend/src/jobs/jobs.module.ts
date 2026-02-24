import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BlogSummaryProcessor } from './blog-summary.processor';
import { CortexService } from './cortex.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'blog-summary' }),
  ],
  providers: [BlogSummaryProcessor, CortexService],
  exports: [CortexService],
})
export class JobsModule { }
