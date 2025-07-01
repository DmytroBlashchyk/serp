import { WithSorting } from 'modules/common/mixins/with-sorting.mixin';
import { SortRetrieveContentsInFolderEnum } from 'modules/folders/enums/sort-retrieve-contents-in-folder.enum';
import { PaginatedSearchRequest } from 'modules/common/requests/paginated-search.request';
import { ApiProperty } from '@nestjs/swagger';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { IdType } from 'modules/common/types/id-type.type';

export class RetrieveContentsInFolderRequest extends WithSorting(
  SortRetrieveContentsInFolderEnum,
  PaginatedSearchRequest,
) {
  @ApiProperty({ nullable: true, required: false })
  @IsId({ each: true, nullable: true })
  tagIds?: IdType[];
}
