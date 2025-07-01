import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkDeleteRequest {
  @ApiProperty()
  @IsId({ each: true })
  userIds: IdType[];
}
