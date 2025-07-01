import { IdType } from 'modules/common/types/id-type.type';

export class DeleteAssignedProjectsEvent {
  readonly projectIds: IdType[];
  constructor(data: DeleteAssignedProjectsEvent) {
    Object.assign(this, data);
  }
}
