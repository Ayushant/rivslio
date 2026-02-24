import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Get('feed')
  getFeed(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.publicService.getFeed(Number(page), Number(limit));
  }

  @Get('blogs/:slug')
  getBlogBySlug(@Param('slug') slug: string) {
    return this.publicService.getBlogBySlug(slug);
  }
}
