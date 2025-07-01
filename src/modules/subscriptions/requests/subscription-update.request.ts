import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SubscriptionUpdateRequest {
  @ApiProperty()
  @IsString()
  paddleProductId: string;
}
