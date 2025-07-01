import { IdType } from 'modules/common/types/id-type.type';

export class AssignProjectToAFolderManagerCommand {
  constructor(
    public readonly folderId: IdType,
    public readonly projectId: IdType,
  ) {}
}
