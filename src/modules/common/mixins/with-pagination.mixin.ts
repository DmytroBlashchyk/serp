import { BaseResponse } from 'modules/common/responses/base.response';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { PaginationMetaType } from 'modules/common/responses/pagination.response';

export type ClassType<T = any> = new (...args: any[]) => T;

/**
 * Creates a paginated response class for a given resource class.
 *
 * @param ResourceCls - The resource class type to be used in the paginated response.
 * @returns A class extending BaseResponse that implements the Pagination interface, containing the items and meta properties.
 */
export function WithPaginatedResponse<T extends ClassType>(ResourceCls: T) {
  class PaginatedResponse extends BaseResponse implements Pagination<T> {
    @ResponseProperty({ cls: ResourceCls, each: true })
    readonly items: T[];

    @ResponseProperty({ cls: PaginationMetaType })
    readonly meta: PaginationMetaType;
  }
  return PaginatedResponse;
}
