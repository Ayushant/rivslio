import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CortexService } from './cortex.service';

interface SummaryJobData {
  blogId: string;
}

@Processor('blog-summary')
export class BlogSummaryProcessor extends WorkerHost {
  private readonly logger = new Logger(BlogSummaryProcessor.name);

  constructor(
    private prisma: PrismaService,
    private cortex: CortexService,
  ) {
    super();
  }

  async process(job: Job<SummaryJobData>): Promise<void> {
    const { blogId } = job.data;
    this.logger.log({ jobId: job.id, blogId, event: 'job_started' });

    try {
      const blog = await this.prisma.blog.findUnique({
        where: { id: blogId },
        select: { id: true, content: true, title: true },
      });

      if (!blog) {
        this.logger.warn({ jobId: job.id, blogId, event: 'blog_not_found' });
        return;
      }

      const summary = await this.generateSummary(blog.title, blog.content);

      await this.prisma.blog.update({
        where: { id: blogId },
        data: { summary },
      });

      this.logger.log({ jobId: job.id, blogId, event: 'job_completed' });
    } catch (err) {
      this.logger.error({
        jobId: job.id,
        blogId,
        event: 'job_failed',
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  private async generateSummary(title: string, content: string): Promise<string> {
    const summary = await this.cortex.generateSummary(title, content);

    if (summary) {
      return summary;
    }

    this.logger.warn('CortexOne summary failed or skipped, using fallback');
    return this.fallbackSummary(content);
  }

  private fallbackSummary(content: string): string {
    const sentences = content
      .replace(/\s+/g, ' ')
      .trim()
      .split(/(?<=[.!?])\s+/)
      .slice(0, 3);
    return sentences.join(' ');
  }
}
