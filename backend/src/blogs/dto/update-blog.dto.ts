import { IsString, IsBoolean, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateBlogDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
