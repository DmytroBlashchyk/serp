import { BaseResponse } from 'modules/common/responses/base.response';
import { IPaginationMeta } from 'nestjs-typeorm-paginate';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class PaginationMetaType
  extends BaseResponse
  implements IPaginationMeta
{
  @ResponseProperty()
  itemCount: number;

  @ResponseProperty()
  totalItems: number;

  @ResponseProperty()
  itemsPerPage: number;

  @ResponseProperty()
  totalPages: number;

  @ResponseProperty()
  currentPage: number;
}
