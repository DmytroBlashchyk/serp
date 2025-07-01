import { IdType } from 'modules/common/types/id-type.type';

export class AssignProjectToAFolderManagerEvent {
  readonly folderId: IdType;
  readonly projectId: IdType;
  constructor(data: AssignProjectToAFolderManagerEvent) {
    Object.assign(this, data);
  }
}
