import {
  ValidateBy,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { isFile } from 'nestjs-form-data';

export function isValidHasMimeType(
  validationOptions?: ValidationOptions & {
    each: boolean;
    nullable: boolean;
    allowedMimeTypes: string[];
  },
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isValidHasMimeType',
      constraints: [validationOptions.allowedMimeTypes],
      validator: {
        validate(value, args: ValidationArguments) {
          const allowedMimeTypes: string[] = args.constraints[0] || [];
          if (value === '' && validationOptions.nullable) {
            return true;
          }
          if (validationOptions.each && Array.isArray(value)) {
            const array: boolean[] = [];
            value.map((v) =>
              array.push(allowedMimeTypes.includes(v.machineType)),
            );
            return array.find((item) => item === false) === undefined;
          }
          if (isFile(value)) {
            return allowedMimeTypes.includes(value.mimetype);
          }
          return false;
        },
        defaultMessage(validationArguments?: ValidationArguments): string {
          const allowedMimeTypes: string[] =
            validationArguments.constraints[0] || [];
          return `File must be of one of the types ${allowedMimeTypes.join(
            ', ',
          )}`;
        },
      },
    },
    validationOptions,
  );
}
