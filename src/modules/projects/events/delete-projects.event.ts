import { IdType } from 'modules/common/types/id-type.type';

export class DeleteProjectsEvent {
  readonly accountId: IdType;
  readonly projectIds: IdType[];
  constructor(data: DeleteProjectsEvent) {
    Object.assign(this, data);
  }
}
