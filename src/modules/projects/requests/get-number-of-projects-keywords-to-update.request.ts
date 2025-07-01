import { ApiProperty } from '@nestjs/swagger';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { IdType } from 'modules/common/types/id-type.type';
import { IsOptional } from 'class-validator';

export class GetNumberOfProjectsKeywordsToUpdateRequest {
  @ApiProperty({ isArray: true })
  @IsId({ each: true, nullable: true })
  projectIds: IdType[];

  @ApiProperty({ isArray: true })
  @IsId({ each: true, nullable: true })
  folderIds: IdType[];
}
