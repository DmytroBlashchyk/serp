import moment from 'moment/moment';

/**
 * Formats a given date into the style used by Google. The format will be "MMM D, h:mm A".
 *
 * @param {Date} entityUpdatedAt - The date object to format.
 * @return {string} The formatted date string.
 */
export function formatGoogleStyleDate(entityUpdatedAt: Date): string {
  const updatedDate = moment(entityUpdatedAt);

  return `${updatedDate.format('MMM D, h:mm A')}`;
}
