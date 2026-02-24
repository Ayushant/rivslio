import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest extends Request {
  user: { id: string };
}

@Controller('blogs/:blogId/comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('blogId') blogId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: AuthRequest,
  ) {
    return this.commentsService.create(req.user.id, blogId, dto);
  }

  @Get()
  findAll(@Param('blogId') blogId: string) {
    return this.commentsService.findAll(blogId);
  }
}
