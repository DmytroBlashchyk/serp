import { IdLiteralType, IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkDeleteRequest {
  @ApiProperty({ isArray: true, type: IdLiteralType })
  @IsId({ each: true })
  emailReportIds: IdType[];
}
