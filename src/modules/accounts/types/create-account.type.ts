import { UserEntity } from 'modules/users/entities/user.entity';
import { IdType } from 'modules/common/types/id-type.type';

export interface CreateAccountType {
  owner: UserEntity;
  tariffPlan: IdType;
  timezoneId?: IdType;
  countryId?: IdType;
}
