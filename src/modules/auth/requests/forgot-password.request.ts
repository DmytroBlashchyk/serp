import { ApiProperty } from '@nestjs/swagger';
import { IsValidEmail } from 'modules/common/decorators/is-valid-email.decorator';

export class ForgotPasswordRequest {
  @ApiProperty()
  @IsValidEmail()
  email: string;
}
