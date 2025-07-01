import { join } from 'path';

/**
 * Joins multiple URL segments into a single URL.
 *
 * @param {...string} parts - The different parts of the URL to be joined.
 * @return {string} The joined URL as a string.
 */
export function joinUrl(...parts: string[]): string {
  return new URL(join(...[...parts.slice(1)]), parts[0]).href;
}
