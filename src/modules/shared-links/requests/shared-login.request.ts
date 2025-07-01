import { IsValidPassword } from 'modules/common/decorators/is-valid-password.decorators';
import { ApiProperty } from '@nestjs/swagger';

export class SharedLoginRequest {
  @ApiProperty()
  @IsValidPassword()
  password: string;
}
