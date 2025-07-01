import { WithSorting } from 'modules/common/mixins/with-sorting.mixin';
import { SortAlertsByProjectEnum } from 'modules/alerts/enums/sort-alerts-by-project.enum';
import { PaginatedSearchRequest } from 'modules/common/requests/paginated-search.request';
import { IdType } from 'modules/common/types/id-type.type';
import { ApiProperty } from '@nestjs/swagger';
import { IsId } from 'modules/common/decorators/is-id.decorator';

export class GetAlertsByProjectRequest extends WithSorting(
  SortAlertsByProjectEnum,
  PaginatedSearchRequest,
) {
  @ApiProperty({ required: false, nullable: true })
  @IsId({ each: true, nullable: true })
  projectIds: IdType[];
}
