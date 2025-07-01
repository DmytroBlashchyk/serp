import { applyDecorators } from '@nestjs/common';

import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export function QuantityProperty({ nullable } = { nullable: false }) {
  return applyDecorators(ResponseProperty({ nullable, cls: Number }));
}
