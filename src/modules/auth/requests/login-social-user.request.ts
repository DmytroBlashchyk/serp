import { IsOptional } from 'class-validator';
import { IsValidEmail } from 'modules/common/decorators/is-valid-email.decorator';

export class LoginSocialUserRequest {
  @IsValidEmail()
  email: string;

  @IsOptional()
  username?: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  googleId?: number;
}
