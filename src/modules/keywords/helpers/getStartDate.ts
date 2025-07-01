import { TemporalFiltersEnum } from 'modules/projects/enums/temporal-filters.enum';
import moment from 'moment';

export function getStartDate(period: TemporalFiltersEnum): string {
  switch (period) {
    case TemporalFiltersEnum.Week:
      return moment().subtract(1, 'weeks').format('YYYY-MM-DD');
    case TemporalFiltersEnum.Month:
      return moment().subtract(1, 'months').format('YYYY-MM-DD');
    case TemporalFiltersEnum.Year:
      return moment().subtract(1, 'years').format('YYYY-MM-DD');
    case TemporalFiltersEnum.SixMonths:
      return moment().subtract(6, 'months').format('YYYY-MM-DD');
    default:
      return moment().subtract(100, 'years').format('YYYY-MM-DD');
  }
}
