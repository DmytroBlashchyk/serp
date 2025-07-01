import {
  ValidateBy,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
const dnsPromises = require('dns').promises;
export function cutLine(str: string): string {
  if (!str || typeof str != 'string') {
    return '';
  }

  const domain = str
    .replace('https://', '')
    .replace('http://', '')
    .replace('www.', '');
  const index = domain.indexOf('/');

  if (index !== -1) {
    return domain.substring(0, index);
  }
  return domain;
}
export async function isRealDomain(url: unknown): Promise<boolean> {
  const hostname = cutLine(url as string);
  try {
    await dnsPromises.lookup(hostname);
    return true;
  } catch (error) {
    return false;
  }
}

export function IsValidRealDomain(
  { nullable, each }: { nullable: boolean; each: boolean },
  validationOptions?: ValidationOptions,
) {
  return ValidateBy(
    {
      name: 'IsValidRealDomain',
      constraints: [],
      validator: {
        async validate(value: string | string[]) {
          if (each && Array.isArray(value)) {
            const results = await Promise.all(
              value.map((v) => isRealDomain(v)),
            );
            return results.every((result) => result);
          }
          if (value == undefined) return false;
          return isRealDomain(value);
        },
        defaultMessage(validationArguments?: ValidationArguments): string {
          return `Please enter a valid domain name.`;
        },
      },
    },
    validationOptions,
  );
}
