import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest extends Request {
  user: { id: string };
}

@Controller('blogs/:blogId/like')
@UseGuards(JwtAuthGuard)
export class LikesController {
  constructor(private likesService: LikesService) {}

  @Post()
  like(@Param('blogId') blogId: string, @Req() req: AuthRequest) {
    return this.likesService.like(req.user.id, blogId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  unlike(@Param('blogId') blogId: string, @Req() req: AuthRequest) {
    return this.likesService.unlike(req.user.id, blogId);
  }
}
