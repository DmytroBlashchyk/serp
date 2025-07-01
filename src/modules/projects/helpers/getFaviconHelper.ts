/**
 * Generates a URL for fetching the favicon of a site.
 *
 * @param {string} siteUrl - The URL of the site for which the favicon is required.
 * @return {string} The URL to fetch the favicon.
 */
export function getFaviconHelper(siteUrl: string): string {
  return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${addHttpIfNeeded(
    siteUrl,
  )}&size=32`;
}

/**
 * Ensures that a given URL starts with 'http://' or 'https://'.
 * If the URL does not start with either, 'http://' is prepended.
 *
 * @param {string} url - The URL to be verified and possibly modified.
 * @return {string} - The URL with 'http://' prepended if needed, or the original URL if it already starts with 'http://' or 'https://'.
 */
function addHttpIfNeeded(url: string) {
  if (!/^https?:\/\//i.test(url)) {
    return 'http://' + url;
  }
  return url;
}
