import {
  IsString,
  MaxLength,
  MinLength,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import { ToTrimDecorator } from 'modules/common/decorators/to-trim.decorator';

export function IsNotEmptyStringDecorator({
  invalidErrorMessage = 'String is invalid',
  requiredErrorMessage = 'String is a required field',
  ...res
}: {
  requiredErrorMessage?: string;
  invalidErrorMessage?: string;
} & ValidationOptions = {}) {
  return applyDecorators(
    MinLength(3),
    MaxLength(2500),
    IsString({
      ...res,
      message: (args: ValidationArguments) => {
        if (!args.value) {
          return requiredErrorMessage;
        } else {
          return invalidErrorMessage;
        }
      },
    }),
    Type(() => String),
    ToTrimDecorator(),
  );
}
