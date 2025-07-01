import { IdType } from 'modules/common/types/id-type.type';

export class DeletingEmptySharedLinksEvent {
  readonly sharedLinkIds: IdType[];
  readonly accountId: IdType;

  constructor(data: DeletingEmptySharedLinksEvent) {
    Object.assign(this, data);
  }
}
