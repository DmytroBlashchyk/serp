/**
 * Extracts the domain name from a given URL.
 *
 * @param {string} url - The URL string from which to extract the domain.
 * @return {string} The extracted domain name.
 */
export function extractDomain(url: string): string {
  let domain = url.replace(/(^\w+:|^)\/\//, '');
  domain = domain.replace(/^www\./, '');
  domain = domain.split('/')[0];
  return domain;
}
