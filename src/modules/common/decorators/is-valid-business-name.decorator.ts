import { applyDecorators } from '@nestjs/common';
import { IsString, ValidationArguments } from 'class-validator';
import { ToLowerCase } from 'modules/common/decorators/to-lower-case.decorator';
import { ToTrimDecorator } from 'modules/common/decorators/to-trim.decorator';

export function IsValidBusinessName() {
  return applyDecorators(
    IsString({
      message: (args: ValidationArguments) => {
        if (!args.value) {
          return 'Business Name is a required field';
        }
      },
    }),
    ToLowerCase(),
    ToTrimDecorator(),
  );
}
