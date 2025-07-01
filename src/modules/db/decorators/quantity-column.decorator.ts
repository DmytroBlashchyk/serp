import { applyDecorators } from '@nestjs/common';
import { Column } from 'typeorm';
import { ColumnNumericTransformer } from 'modules/common/transformers/column-numeric.transformer';

interface QuantityColumnParams {
  nullable?: boolean;
  default?: number;
}

export function QuantityColumn(
  params: QuantityColumnParams = { nullable: false },
) {
  const { nullable } = params;
  return applyDecorators(
    Column('decimal', {
      precision: 60,
      scale: 16,
      default: params.default,
      nullable,
      transformer: new ColumnNumericTransformer(),
    }),
  );
}
