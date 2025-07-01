import { IdType } from 'modules/common/types/id-type.type';

export class DeletingEmptySharedLinksCommand {
  constructor(
    public readonly sharedLinkIds: IdType[],
    public readonly accountId: IdType,
  ) {}
}
