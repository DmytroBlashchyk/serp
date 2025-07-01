import { IdType } from 'modules/common/types/id-type.type';

export class DeleteFoldersCommand {
  constructor(public readonly folderIds: IdType[]) {}
}
