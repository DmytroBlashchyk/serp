import {
  IsDate,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';

export function IsValidDate({
  invalidErrorMessage = 'Date is invalid',
  requiredErrorMessage = 'Date is a required field',
  ...res
}: {
  requiredErrorMessage?: string;
  invalidErrorMessage?: string;
} & ValidationOptions = {}) {
  return applyDecorators(
    IsDate({
      ...res,
      message: (args: ValidationArguments) => {
        if (!args.value) {
          return requiredErrorMessage;
        } else {
          return invalidErrorMessage;
        }
      },
    }),
    Type(() => Date),
  );
}
