import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsValidPassword(
  validationOptions?: ValidationOptions & { nullable?: boolean },
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsValidPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: (args: ValidationArguments) => {
          if (!args.value) {
            return 'Password is a required field';
          } else {
            return 'Minimum 8 characters, including at least one number (0-9).';
          }
        },
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          if (!value && validationOptions?.nullable) return true;

          return (
            typeof value === 'string' &&
            value.length >= 8 &&
            /[0-9]/.test(value)
          );
        },
      },
    });
  };
}
