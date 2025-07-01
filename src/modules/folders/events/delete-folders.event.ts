import { IdType } from 'modules/common/types/id-type.type';

export class DeleteFoldersEvent {
  readonly folderIds: IdType[];

  constructor(data: DeleteFoldersEvent) {
    Object.assign(this, data);
  }
}
