import { IdType } from 'modules/common/types/id-type.type';

export class RefreshFolderTreeCommand {
  constructor(public readonly accountId: IdType) {}
}
