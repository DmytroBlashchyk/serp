import { BaseResponse } from 'modules/common/responses/base.response';
import { IdProperty } from 'modules/common/decorators/id-property';
import { IdType } from 'modules/common/types/id-type.type';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { IsString } from 'class-validator';

/**
 * Creates a DTO class with an enum property.
 *
 * @param {unknown} enumRef - The reference of the enum to be used for the property.
 * @return {typeof EnumItemDto} The generated DTO class with the specified enum property.
 */
export function WithEnumDto<T extends unknown>(enumRef: unknown) {
  class EnumItemDto extends BaseResponse<EnumItemDto> {
    @IdProperty()
    id: IdType;

    @ResponseProperty({ enum: enumRef })
    @IsString()
    name: T;
  }
  return EnumItemDto;
}
