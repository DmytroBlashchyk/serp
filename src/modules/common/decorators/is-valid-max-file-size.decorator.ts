import {
  ValidateBy,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { isFile } from 'nestjs-form-data';

export function isValidMaxFileSize(
  validationOptions?: ValidationOptions & {
    nullable: boolean;
    each: boolean;
    maxSizeBytes: number;
  },
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isValidMaxFileSize',
      constraints: [validationOptions.maxSizeBytes],
      validator: {
        validate(
          value: any,
          args: ValidationArguments,
        ): Promise<boolean> | boolean {
          const size: number = args.constraints[0];
          if (value === '' && validationOptions.nullable) {
            return true;
          }
          if (validationOptions.each && Array.isArray(value)) {
            const array: boolean[] = [];
            value.map((v) => array.push(v.size <= size));
            return array.find((item) => item === false) === undefined;
          }
          if (isFile(value)) {
            return value.size <= size;
          }

          return false;
        },
        defaultMessage(validationArguments?: ValidationArguments): string {
          return `Maximum file size is ${validationArguments.constraints[0]}`;
        },
      },
    },
    validationOptions,
  );
}
