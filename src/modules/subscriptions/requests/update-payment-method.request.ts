import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePaymentMethodRequest {
  @ApiProperty()
  @IsString()
  subscriptionId: string;
}
