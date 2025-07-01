import { IdType } from 'modules/common/types/id-type.type';

export class RefreshFolderTreeEvent {
  readonly accountId: IdType;

  constructor(data: RefreshFolderTreeEvent) {
    Object.assign(this, data);
  }
}
