import moment from 'moment';
/**
 * Provides a human-readable description of how much time has passed since the given date.
 *
 * @param {Date} date - The date to compare against the current time.
 * @return {string} A string representing the amount of time that has passed since the given date.
 *                  Possible values include "just now", "x mins", "x hrs", or "x days".
 */
export function dateHelper(date: Date): string {
  const now = moment();
  const currentDate = moment(date);
  const minutes = now.diff(currentDate, 'm');
  const hours = now.diff(currentDate, 'h');
  const days = now.diff(currentDate, 'days');

  const hoursLimit = 24;

  if (minutes < 1) {
    return 'just now';
  } else if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'min' : 'mins'}`;
  } else if (hours < hoursLimit) {
    return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
  } else {
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  }
}
