import { applyDecorators } from '@nestjs/common';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { IsId } from 'modules/common/decorators/is-id.decorator';

export function IdProperty(
  { nullable, each } = { nullable: false, each: false },
) {
  return applyDecorators(
    ResponseProperty({ nullable, cls: Number, each }),
    IsId({ nullable, each }),
  );
}
