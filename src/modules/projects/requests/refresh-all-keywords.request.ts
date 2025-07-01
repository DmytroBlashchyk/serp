import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshAllKeywordsRequest {
  @ApiProperty({ isArray: true, required: false, nullable: true })
  @IsId({ nullable: true, each: true })
  projectIds?: IdType[];

  @ApiProperty({ isArray: true, required: false, nullable: true })
  @IsId({ nullable: true, each: true })
  folderIds?: IdType[];
}
