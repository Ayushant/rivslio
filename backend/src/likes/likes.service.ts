import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaService) {}

  async like(userId: string, blogId: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
      select: { id: true },
    });

    if (!blog) throw new NotFoundException('Blog not found');

    try {
      await this.prisma.like.create({ data: { userId, blogId } });
    } catch (err: unknown) {
      const code =
        typeof err === 'object' &&
        err !== null &&
        'code' in err
          ? (err as { code: unknown }).code
          : undefined;
      if (code === 'P2002') {
        throw new ConflictException('Already liked');
      }
      throw err;
    }

    return this.getLikeCount(blogId);
  }

  async unlike(userId: string, blogId: string) {
    await this.prisma.like.deleteMany({ where: { userId, blogId } });
    return this.getLikeCount(blogId);
  }

  private async getLikeCount(blogId: string) {
    const count = await this.prisma.like.count({ where: { blogId } });
    return { likeCount: count };
  }
}
