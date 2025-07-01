import { IdType } from 'modules/common/types/id-type.type';

export class AssigningAChildFolderToParentFolderManagerCommand {
  constructor(
    public readonly folderId: IdType,
    public readonly accountId: IdType,
  ) {}
}
