/**
 * Encodes specific characters in an email address.
 * Specifically, it replaces the plus sign (+) with its URL-encoded equivalent (%2B).
 *
 * @param {string} email - The email address to encode.
 * @return {string} The encoded email address.
 */
export function encodeSpecificEmailChars(email: string) {
  return email.replace(/\+/g, '%2B');
}
