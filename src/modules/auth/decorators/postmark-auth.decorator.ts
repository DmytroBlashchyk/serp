import { applyDecorators, UseGuards } from '@nestjs/common';
import { PostmarkAuthGuard } from 'modules/auth/guards/postmark-auth.guard';

export const PostmarkAuth = () => {
  return applyDecorators(UseGuards(PostmarkAuthGuard));
};
