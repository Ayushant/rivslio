import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, blogId: string, dto: CreateCommentDto) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
      select: { id: true },
    });

    if (!blog) throw new NotFoundException('Blog not found');

    return this.prisma.comment.create({
      data: { userId, blogId, content: dto.content },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { id: true, email: true } },
      },
    });
  }

  async findAll(blogId: string) {
    return this.prisma.comment.findMany({
      where: { blogId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { id: true, email: true } },
      },
    });
  }
}
