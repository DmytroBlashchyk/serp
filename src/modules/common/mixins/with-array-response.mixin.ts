import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { BaseResponse } from 'modules/common/responses/base.response';

export type ClassType<T = any> = new (...args: any[]) => T;

/**
 * Creates a response type with an array of resource items.
 *
 * @param {T} ResourceCls - The class type of the resources to be included in the response array.
 * @return {typeof BaseResponse} A class that extends BaseResponse, including an array of resource items.
 */
export function WithArrayResponse<T extends ClassType>(ResourceCls: T) {
  class SimpleArrayResponse extends BaseResponse {
    @ResponseProperty({ each: true, cls: ResourceCls })
    readonly items: T[];
  }
  return SimpleArrayResponse;
}
