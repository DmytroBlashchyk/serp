import { IsId } from 'modules/common/decorators/is-id.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkDeleteRequest {
  @ApiProperty({ isArray: true })
  @IsId({ each: true })
  noteIds: [];
}
