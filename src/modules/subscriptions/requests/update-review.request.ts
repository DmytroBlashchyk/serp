import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReviewRequest {
  @ApiProperty()
  @IsString()
  paddleProductId: string;
}
