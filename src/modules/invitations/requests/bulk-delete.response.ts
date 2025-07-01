import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkDeleteResponse {
  @ApiProperty({ isArray: true, type: Number })
  @IsId({ each: true })
  ids: IdType[];
}
