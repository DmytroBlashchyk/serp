import * as url from 'url';
import { extractStringBeforeSlash } from 'modules/projects/helpers/domain.helper';

/**
 * Compares the hostname of the user-input URL with the hostname of the search result URL
 * after removing the 'www.' prefix, if present.
 *
 * @param {string} userInputUrl - The URL provided by the user.
 * @param {string} searchResultUrl - The URL obtained from the search result.
 * @return {boolean} - Returns true if the hostnames match, false otherwise.
 */
export function exactHelper(
  userInputUrl: string,
  searchResultUrl: string,
): boolean {
  const parsedUserInputUrl = url.parse(userInputUrl);
  const parsedSearchResultUrl = url.parse(searchResultUrl);
  let userInputHost;
  if (parsedUserInputUrl.hostname) {
    userInputHost = (parsedUserInputUrl.hostname || '').replace(/^www\./, '');
  } else {
    userInputHost = (
      extractStringBeforeSlash(parsedUserInputUrl.href) || ''
    ).replace(/^www\./, '');
  }
  let searchResultHost;
  if (parsedSearchResultUrl.hostname) {
    searchResultHost = (parsedSearchResultUrl.hostname || '').replace(
      /^www\./,
      '',
    );
  } else {
    searchResultHost = (
      extractStringBeforeSlash(parsedSearchResultUrl.href) || ''
    ).replace(/^www\./, '');
  }
  return userInputHost === searchResultHost;
}
