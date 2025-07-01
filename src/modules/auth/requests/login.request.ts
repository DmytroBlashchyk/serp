import { ApiProperty } from '@nestjs/swagger';
import { IsValidEmail } from 'modules/common/decorators/is-valid-email.decorator';
import { IsString } from 'class-validator';

export class LoginRequest {
  @ApiProperty()
  @IsValidEmail()
  email: string;

  @ApiProperty()
  @IsString({ message: 'Password is a required field' })
  password: string;
}
