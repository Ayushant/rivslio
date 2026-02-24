import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

interface SummaryJobData {
  blogId: string;
}

@Processor('blog-summary')
export class BlogSummaryProcessor extends WorkerHost {
  private readonly logger = new Logger(BlogSummaryProcessor.name);

  constructor(private prisma: PrismaService) {
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
      throw err; // BullMQ will retry based on queue config
    }
  }

  private async generateSummary(title: string, content: string): Promise<string> {
    const apiKey = process.env['CORTEXONE_API_KEY'];

    if (!apiKey) {
      this.logger.warn('CORTEXONE_API_KEY not set, using fallback summary');
      return this.fallbackSummary(content);
    }

    try {
      const response = await fetch('https://cortexone.rival.io/api/v1/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          function: 'blog-summary-generator',
          input: { title, content },
        }),
      });

      if (!response.ok) {
        this.logger.warn(`CortexOne returned ${response.status}, using fallback`);
        return this.fallbackSummary(content);
      }

      const result = (await response.json()) as { output?: { summary?: string } };
      return result?.output?.summary ?? this.fallbackSummary(content);
    } catch {
      this.logger.warn('CortexOne call failed, using fallback summary');
      return this.fallbackSummary(content);
    }
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
