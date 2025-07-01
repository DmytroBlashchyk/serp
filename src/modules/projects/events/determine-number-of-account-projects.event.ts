import { IdType } from 'modules/common/types/id-type.type';

export class DetermineNumberOfAccountProjectsEvent {
  readonly accountId: IdType;
  constructor(data: DetermineNumberOfAccountProjectsEvent) {
    Object.assign(this, data);
  }
}
