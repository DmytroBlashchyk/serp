import { IdType } from 'modules/common/types/id-type.type';

export class RemoteProjectsEvent {
  readonly projectIds: IdType[];
  readonly accountId: IdType;

  constructor(data: RemoteProjectsEvent) {
    Object.assign(this, data);
  }
}
