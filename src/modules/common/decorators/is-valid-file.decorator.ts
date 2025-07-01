import { StoredFile } from 'nestjs-form-data';
import {
  ValidateBy,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function isFile(value: any): boolean {
  return value && value instanceof StoredFile;
}

export function IsValidFile(
  { nullable, each }: { nullable: boolean; each: boolean },
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'IsValidFile',
      constraints: [],
      validator: {
        validate(value: any) {
          if (each && Array.isArray(value)) {
            const array: boolean[] = [];
            value.map((v) => array.push(isFile(v)));
            return array.find((item) => item === false) === undefined;
          }
          return value === '' && nullable ? true : isFile(value);
        },
        defaultMessage(validationArguments?: ValidationArguments): string {
          return `${validationArguments.property} does not contain file`;
        },
      },
    },
    validationOptions,
  );
}
