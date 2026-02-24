import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('blog-summary') private summaryQueue: Queue,
  ) {}

  async create(userId: string, dto: CreateBlogDto) {
    const slug = await this.generateUniqueSlug(dto.title);

    const blog = await this.prisma.blog.create({
      data: {
        userId,
        title: dto.title,
        slug,
        content: dto.content,
        isPublished: dto.isPublished ?? false,
      },
    });

    if (blog.isPublished) {
      await this.summaryQueue.add('generate', { blogId: blog.id });
    }

    return blog;
  }

  async findAllForUser(userId: string) {
    return this.prisma.blog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { likes: true, comments: true } },
      },
    });
  }

  async findOneForUser(id: string, userId: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });

    if (!blog) throw new NotFoundException('Blog not found');
    if (blog.userId !== userId) throw new ForbiddenException('Access denied');

    return blog;
  }

  async update(id: string, userId: string, dto: UpdateBlogDto) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });

    if (!blog) throw new NotFoundException('Blog not found');
    if (blog.userId !== userId) throw new ForbiddenException('Access denied');

    const updateData: {
      title?: string;
      slug?: string;
      content?: string;
      isPublished?: boolean;
    } = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.isPublished !== undefined) updateData.isPublished = dto.isPublished;

    if (dto.title && dto.title !== blog.title) {
      updateData.slug = await this.generateUniqueSlug(dto.title, id);
    }

    const updated = await this.prisma.blog.update({
      where: { id },
      data: updateData,
    });

    // Enqueue summary job when blog transitions to published
    if (!blog.isPublished && updated.isPublished) {
      await this.summaryQueue.add('generate', { blogId: updated.id });
    }

    return updated;
  }

  async remove(id: string, userId: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });

    if (!blog) throw new NotFoundException('Blog not found');
    if (blog.userId !== userId) throw new ForbiddenException('Access denied');

    await this.prisma.blog.delete({ where: { id } });
  }

  private async generateUniqueSlug(
    title: string,
    excludeId?: string,
  ): Promise<string> {
    const base = slugify(title, { lower: true, strict: true });
    let slug = base;
    let counter = 2;

    while (true) {
      const existing = await this.prisma.blog.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!existing || existing.id === excludeId) break;

      slug = `${base}-${counter}`;
      counter++;
    }

    return slug;
  }
}
