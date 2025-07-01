import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PasswordConfirmationRequest {
  @ApiProperty({ required: true })
  @IsString()
  password: string;
}
