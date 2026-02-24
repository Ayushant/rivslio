import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'blog-summary' }),
  ],
  providers: [BlogsService],
  controllers: [BlogsController],
  exports: [BlogsService],
})
export class BlogsModule {}
