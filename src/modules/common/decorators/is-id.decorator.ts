import { applyDecorators } from '@nestjs/common';
import {
  ArrayMinSize,
  IsInt,
  IsOptional,
  ValidationArguments,
} from 'class-validator';
import { ToArrayNumber } from 'modules/common/decorators/to-array-number.decorator';
import { Transform } from 'class-transformer';

export const IsId = ({
  nullable = false,
  each = false,
  message = {
    requiredErrorMessage: null,
    invalidErrorMessage: 'Validation failed',
  },
} = {}) => {
  return applyDecorators(
    nullable ? IsOptional() : (): unknown => null,
    each && !nullable ? ArrayMinSize(1) : (): unknown => null,
    IsInt({
      each,
      message: (args: ValidationArguments) => {
        if (!args.value) {
          return message.requiredErrorMessage ?? args.property + ' is required';
        } else {
          return message.invalidErrorMessage;
        }
      },
    }),
    each
      ? ToArrayNumber()
      : Transform(({ value }) => {
          return Number(value);
        }),
  );
};
