import { RemoteAccountUserType } from 'modules/accounts/types/remote-account-user.type';

export class CompleteAccountDeletionCommand {
  constructor(public readonly remoteAccountUser: RemoteAccountUserType) {}
}
