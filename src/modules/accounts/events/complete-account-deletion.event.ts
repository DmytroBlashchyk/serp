import { RemoteAccountUserType } from 'modules/accounts/types/remote-account-user.type';

export class CompleteAccountDeletionEvent {
  readonly remoteAccountUser: RemoteAccountUserType;
  constructor(data: CompleteAccountDeletionEvent) {
    Object.assign(this, data);
  }
}
