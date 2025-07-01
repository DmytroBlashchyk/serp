import { WithSorting } from 'modules/common/mixins/with-sorting.mixin';
import { SortMyFoldersEnum } from 'modules/folders/enums/sort-my-folders.enum';
import { PaginatedSearchRequest } from 'modules/common/requests/paginated-search.request';
import { ApiProperty } from '@nestjs/swagger';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { IdType } from 'modules/common/types/id-type.type';

export class GetMyFoldersRequest extends WithSorting(
  SortMyFoldersEnum,
  PaginatedSearchRequest,
) {
  @ApiProperty({ nullable: true, required: false })
  @IsId({ each: true, nullable: true })
  tagIds?: IdType[];
}
