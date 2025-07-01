import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NecessaryRemovalRequest {
  @ApiProperty()
  @IsString()
  paddleProductId: string;
}
