/**
 * Transforms the discovered URL by removing the protocol and 'www' prefix,
 * and then checks if it starts with the transformed tracked domain.
 * If it does, it returns the path part of the URL; otherwise, it returns the modified discovered URL.
 *
 * @param {string} trackedDomain - The domain being tracked (with or without protocol and 'www').
 * @param {string} discoveredUrl - The URL that was discovered and needs to be transformed.
 * @return {string} - The transformed URL based on the relationship with the tracked domain.
 */
export function displayUrlHelper(
  trackedDomain: string,
  discoveredUrl: string,
): string {
  const trackedDomainWithoutPrefix = trackedDomain.replace(
    /^https?:\/\/(www\.)?/,
    '',
  );
  const discoveredUrlWithoutPrefix = discoveredUrl.replace(
    /^https?:\/\/(www\.)?/,
    '',
  );
  if (!discoveredUrlWithoutPrefix.startsWith(trackedDomainWithoutPrefix)) {
    return discoveredUrlWithoutPrefix;
  } else {
    const pathIndex = discoveredUrlWithoutPrefix.indexOf('/');
    return pathIndex !== -1 ? discoveredUrlWithoutPrefix.slice(pathIndex) : '/';
  }
}
