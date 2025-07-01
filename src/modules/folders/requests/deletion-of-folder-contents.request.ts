import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class DeletionOfFolderContentsRequest {
  @ApiProperty({ isArray: true, nullable: true, required: false })
  @IsId({ each: true, nullable: true })
  projectIds?: IdType[];

  @ApiProperty({ isArray: true, nullable: true, required: false })
  @IsId({ each: true, nullable: true })
  folderIds?: IdType[];
}
