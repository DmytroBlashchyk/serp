/**
 * Retrieves the key corresponding to the provided value in an enumeration object.
 *
 * @param {object} Enum - The enumeration object to search.
 * @param {string} value - The value to find the key for.
 * @return {string|undefined} The key associated with the given value, or undefined if not found.
 */
export function getKeyByValue(Enum: unknown, value: string) {
  const indexOfS = Object.values(Enum).indexOf(value as unknown);
  return Object.keys(Enum)[indexOfS];
}
