import { applyDecorators } from '@nestjs/common';
import { IsEmail, ValidationArguments } from 'class-validator';
import { ToLowerCase } from 'modules/common/decorators/to-lower-case.decorator';

export function IsValidEmail() {
  return applyDecorators(
    IsEmail(
      {},
      {
        message: (args: ValidationArguments) => {
          if (!args.value) {
            return 'Email is a required field';
          } else {
            return 'Invalid email address.';
          }
        },
      },
    ),

    ToLowerCase(),
  );
}
