import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';

export class GetTagsRequest {
  @ApiProperty({ required: false, nullable: true })
  @IsString()
  @IsOptional()
  search?: string;
}
