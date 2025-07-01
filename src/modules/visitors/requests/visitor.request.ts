import { ApiProperty } from '@nestjs/swagger';
import { IsIP } from 'class-validator';

export class VisitorRequest {
  @ApiProperty()
  @IsIP()
  ipAddress: string;
}
