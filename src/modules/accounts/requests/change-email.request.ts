import { ApiProperty } from '@nestjs/swagger';
import { IsValidEmail } from 'modules/common/decorators/is-valid-email.decorator';
import { IsValidPassword } from 'modules/common/decorators/is-valid-password.decorators';
import { IsOptional } from 'class-validator';

export class ChangeEmailRequest {
  @ApiProperty()
  @IsValidEmail()
  currentEmail: string;

  @ApiProperty()
  @IsValidEmail()
  newEmail: string;

  @ApiProperty({ nullable: true })
  @IsValidPassword()
  @IsOptional()
  confirmationPassword?: string;
}
