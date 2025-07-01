import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidPassword } from 'modules/common/decorators/is-valid-password.decorators';

export class ChangePasswordRequest {
  @ApiProperty({ required: true })
  @IsString()
  currentPassword: string;

  @ApiProperty({ required: true })
  @IsValidPassword()
  newPassword: string;
}
