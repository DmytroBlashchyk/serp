import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsValidPassword } from 'modules/common/decorators/is-valid-password.decorators';

export class ResetPasswordRequest {
  @ApiProperty()
  @IsString()
  passwordResetConfirmationToken: string;

  @ApiProperty()
  @IsValidPassword()
  password: string;
}
