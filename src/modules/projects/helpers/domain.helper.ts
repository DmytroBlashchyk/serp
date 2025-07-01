import * as url from 'url';

/**
 * Compares the domain of a `projectUrl` with a `searchDomain` to determine if they match.
 *
 * @param {string} projectUrl - The project's root URL to be compared.
 * @param {string} searchDomain - The domain to be searched and compared against the project URL.
 * @return {boolean} - Returns `true` if the domains match, otherwise `false`.
 */
export function domainHelper(
  projectUrl: string,
  searchDomain: string,
): boolean {
  const parsedRootUrl = url.parse(projectUrl);
  let rootHostname;
  if (parsedRootUrl.hostname) {
    rootHostname = parsedRootUrl.hostname?.replace(/^www\./, '');
  } else {
    let url = parsedRootUrl.href;
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    rootHostname = extractStringBeforeSlash(url)?.replace(/^www\./, '');
  }
  const parsedSubdomainUrl = url.parse(searchDomain);
  let subdomainHostname;
  if (parsedSubdomainUrl.hostname) {
    subdomainHostname = parsedSubdomainUrl.hostname?.replace(/^www\./, '');
  } else {
    let url = parsedSubdomainUrl.href;
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    subdomainHostname = extractStringBeforeSlash(url)?.replace(/^www\./, '');
  }
  if (rootHostname && subdomainHostname) {
    const rootParts = rootHostname.split('.').reverse();
    const subdomainParts = subdomainHostname.split('.').reverse();
    let trueCount = 0;
    for (let i = 0; i < rootParts.length; i++) {
      if (rootParts[i] === subdomainParts[i]) {
        trueCount++;
      }
    }
    if (rootParts.length === trueCount) {
      return true;
    }
    if (rootHostname !== subdomainHostname) {
      return false;
    }
  }
  if (!subdomainHostname) {
    const rootPath = parsedRootUrl.pathname?.replace(/\/$/, '');
    const subdomainPath = parsedSubdomainUrl.pathname?.replace(/\/$/, '');
    return subdomainPath?.startsWith(rootPath || '');
  }

  return false;
}

/**
 * Extracts the substring from the beginning of the input string up to, but not including, the first occurrence of a slash ('/').
 *
 * @param {string} url - The input string from which to extract the substring.
 * @return {string} - The substring before the first slash, or the entire string if no slash is found.
 */
export function extractStringBeforeSlash(url: string) {
  const index = url.indexOf('/');
  if (index !== -1) {
    return url.substring(0, index);
  } else {
    return url;
  }
}
