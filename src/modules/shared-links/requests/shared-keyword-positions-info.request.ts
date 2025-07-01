import { WithSorting } from 'modules/common/mixins/with-sorting.mixin';
import { SortKeywordPositionsEnum } from 'modules/keywords/enums/sort-keyword-positions.enum';
import { PaginatedQueryRequest } from 'modules/common/requests/paginated-query.request';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';
import { ToNumber } from 'modules/common/decorators/to-number.decorator';

export class SharedKeywordPositionsInfoRequest extends WithSorting(
  SortKeywordPositionsEnum,
  PaginatedQueryRequest,
) {
  @ApiProperty()
  @IsInt()
  @Min(1)
  @ToNumber()
  page: number;

  @ApiProperty()
  @IsInt()
  @Max(100)
  @Min(1)
  @ToNumber()
  limit: number;
}
