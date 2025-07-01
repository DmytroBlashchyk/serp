import { IsValidEmail } from 'modules/common/decorators/is-valid-email.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailChangeConfirmationRequest {
  @ApiProperty()
  @IsValidEmail()
  newEmail: string;
}
