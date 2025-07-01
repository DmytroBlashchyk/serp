import { IdType } from 'modules/common/types/id-type.type';
import { LimitTypesEnum } from 'modules/account-limits/enums/limit-types.enum';

export interface AccountType {
  current_limit: number;
  limit_types_id: IdType;
  limit_types_name: LimitTypesEnum;
  default_limit: number;
}
