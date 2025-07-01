import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchRequest {
  @ApiProperty()
  @IsString()
  search: string;
}
