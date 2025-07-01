import { IdType } from 'modules/common/types/id-type.type';

export class UpdateDataForProjectsEvent {
  readonly projectId: IdType;

  constructor(data: UpdateDataForProjectsEvent) {
    Object.assign(this, data);
  }
}
