import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompleteAccountDeletionCommand } from 'modules/accounts/commands/complete-account-deletion.command';
import { AccountRepository } from 'modules/accounts/repositories/account.repository';
import { AccountUserRepository } from 'modules/accounts/repositories/account-user.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { UserRepository } from 'modules/users/repositories/user.repository';
import { MailingService } from 'modules/mailing/services/mailing.service';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@CommandHandler(CompleteAccountDeletionCommand)
export class CompleteAccountDeletionCommandHandler
  implements ICommandHandler<CompleteAccountDeletionCommand>
{
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly accountUserRepository: AccountUserRepository,
    private readonly cliLoggingService: CliLoggingService,
    private readonly userRepository: UserRepository,
    private readonly mailingService: MailingService,
  ) {}

  @Transactional()
  async execute(command: CompleteAccountDeletionCommand): Promise<void> {
    this.cliLoggingService.log('Start: CompleteAccountDeletionCommandHandler');
    try {
      const account = await this.accountRepository.getAnAccountWithAllEntities(
        command.remoteAccountUser.account_id,
      );
      if (account.owner.accountUsers.length > 0) {
        await this.accountUserRepository.deleteAllUserAccountsUserId(
          account.owner.id,
        );
      }
      if (account.owner.projects.length > 0) {
        await this.accountUserRepository.removeLinkBetweenProjectsAndUser(
          account.owner.id,
          account.owner.projects.map((project) => project.id),
        );
      }
      if (account.owner.folders.length > 0) {
        await this.accountUserRepository.removeLinkBetweenFoldersAndUser(
          account.owner.id,
          account.owner.folders.map((folder) => folder.id),
        );
      }
      if (account.accountUsers.length > 0) {
        await this.accountUserRepository.deleteAllUsersAssignedToAccount(
          account.id,
        );
      }
      if (account.projects.length > 0) {
        await this.accountUserRepository.deleteAllUsersAssignedToProjects(
          account.projects.map((project) => project.id),
        );
      }
      if (account.folders.length > 0) {
        await this.accountUserRepository.deleteAllUsersAssignedToFolders(
          account.folders.map((folder) => folder.id),
        );
      }

      await this.accountRepository.deleteAccountsByIds([account.id]);
      await this.userRepository.deleteUsersByIds([account.owner.id]);
      await this.mailingService.sendManyEmailsAboutCompletelyDeletingAccount([
        command.remoteAccountUser,
      ]);
    } catch (error) {
      this.cliLoggingService.error(
        `Error: CompleteAccountDeletionCommandHandler (${JSON.stringify(
          command,
        )})`,
        error,
      );
    }
  }
}
