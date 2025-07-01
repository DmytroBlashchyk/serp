import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshAllKeywordsForProjectsRequest {
  @ApiProperty({ isArray: true })
  @IsId({ each: true, nullable: true })
  projectIds: IdType[];

  @ApiProperty({ isArray: true })
  @IsId({ each: true, nullable: true })
  folderIds: IdType[];
}
