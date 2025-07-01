import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteAccountRequest {
  @ApiProperty({ required: true })
  @IsString()
  reason: string;
}
