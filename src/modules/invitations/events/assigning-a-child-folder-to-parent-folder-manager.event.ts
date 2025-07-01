import { IdType } from 'modules/common/types/id-type.type';

export class AssigningAChildFolderToParentFolderManagerEvent {
  readonly folderId: IdType;
  readonly accountId: IdType;
  constructor(data: AssigningAChildFolderToParentFolderManagerEvent) {
    Object.assign(this, data);
  }
}
