import { PaginatedQueryRequest } from 'modules/common/requests/paginated-query.request';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PaginatedSearchRequest extends PaginatedQueryRequest {
  @ApiProperty({ nullable: true, required: false })
  @IsString()
  @IsOptional()
  search?: string;
}
