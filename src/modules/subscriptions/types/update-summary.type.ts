import { CreditType } from 'modules/subscriptions/types/credit.type';
import { ChargeType } from 'modules/subscriptions/types/charge.type';
import { ResultType } from 'modules/subscriptions/types/result.type';

export interface UpdateSummaryType {
  credit: CreditType;
  charge: ChargeType;
  result: ResultType;
}
