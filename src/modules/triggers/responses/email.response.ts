import { IsBoolean, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidEmail } from 'modules/common/decorators/is-valid-email.decorator';
import { BaseResponse } from 'modules/common/responses/base.response';

export class EmailResponse extends BaseResponse<EmailResponse> {
  @ApiProperty()
  @IsValidEmail()
  email: string;

  @ApiProperty()
  @IsBoolean()
  subscribed: boolean;
}
