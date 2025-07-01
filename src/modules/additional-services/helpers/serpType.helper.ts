import { SerpTypeEnum } from 'modules/additional-services/enums/serp-type.enum';

/**
 * Converts a 'type' string to its corresponding value in the SerpTypeEnum
 * enumeration and returns a formatted string.
 *
 * @param {string} type - The string representation of the SERP type.
 * @return {string} Formatted string containing the corresponding SERP feature value.
 */
export function serpTypeHelper(type: string): string {
  const value = SerpTypeEnum[type as keyof typeof SerpTypeEnum] ?? '';
  return `SERP feature: ${value}`;
}
