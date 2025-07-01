import {
  ValidateBy,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function isValidKeywordValue(keyword: unknown): string | undefined {
  if (typeof keyword !== 'string') {
    return 'Value must be a string.';
  }

  const forbiddenPrefixes = [
    'allinanchor:',
    'allintext:',
    'allintitle:',
    'allinurl:',
    'define:',
    'filetype:',
    'id:',
    'inanchor:',
    'info:',
    'intext:',
    'intitle:',
    'inurl:',
    'link:',
    'site:',
    'cache:',
  ];

  const forbiddenPrefix = forbiddenPrefixes.find((prefix) =>
    keyword.startsWith(prefix),
  );
  return forbiddenPrefix ? forbiddenPrefix : undefined;
}

export function IsValidKeyword(
  { nullable, each }: { nullable: boolean; each: boolean },
  validationOptions?: ValidationOptions,
) {
  return ValidateBy(
    {
      name: 'IsValidKeyword',
      constraints: [],
      validator: {
        async validate(
          value: string | string[],
          validationArguments?: ValidationArguments,
        ): Promise<boolean> {
          if (each && Array.isArray(value)) {
            const invalidKeyword = value.find((v) => isValidKeywordValue(v));
            if (invalidKeyword) {
              const forbiddenPrefix = isValidKeywordValue(invalidKeyword);
              validationArguments?.constraints.push(forbiddenPrefix);
              return false;
            }
            return true;
          }

          const forbiddenPrefix = isValidKeywordValue(value as string);
          if (forbiddenPrefix) {
            validationArguments?.constraints.push(forbiddenPrefix);
            return false;
          }

          return true;
        },
        defaultMessage(validationArguments?: ValidationArguments): string {
          const forbiddenPrefix = validationArguments?.constraints[
            validationArguments?.constraints.length - 1
          ] as string;
          return forbiddenPrefix
            ? `Search operator ${forbiddenPrefix} is not permitted. Please remove it and try again.`
            : 'Please enter a valid keyword.';
        },
      },
    },
    validationOptions,
  );
}
