import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshFolderTreeCommand } from 'modules/accounts/commands/refresh-folder-tree.command';
import { AccountUserRepository } from 'modules/accounts/repositories/account-user.repository';
import { FolderRepository } from 'modules/folders/repositories/folder.repository';
import { FoldersResponseFactory } from 'modules/folders/factories/folders-response.factory';
import { GatewayService } from 'modules/gateway/services/gateway.service';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(RefreshFolderTreeCommand)
export class RefreshFolderTreeCommandHandler
  implements ICommandHandler<RefreshFolderTreeCommand>
{
  constructor(
    private readonly accountUserRepository: AccountUserRepository,
    private readonly folderRepository: FolderRepository,
    private readonly foldersResponseFactory: FoldersResponseFactory,
    private readonly gatewayService: GatewayService,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the RefreshFolderTreeCommand which refreshes the folder tree for a given account.
   * It retrieves account users and the folder tree, creates the response and handles the folder tree for each user account.
   *
   * @param {RefreshFolderTreeCommand} command - The command containing necessary parameters such as accountId.
   * @return {Promise<void>} A promise that resolves when the command execution is complete.
   */
  async execute(command: RefreshFolderTreeCommand): Promise<void> {
    this.cliLoggingService.log('Start: RefreshFolderTreeCommandHandler');
    try {
      const accountUsers = await this.accountUserRepository.getAccountUsers(
        command.accountId,
      );

      const folderTree = await this.folderRepository.getTree(command.accountId);

      for (const userAccount of accountUsers) {
        const tree = this.foldersResponseFactory.createResponse(folderTree, {
          userId: userAccount.user.id,
        });

        await this.gatewayService.handleFoldersTree(
          command.accountId,
          userAccount.user.id,
          tree,
        );
      }
    } catch (errors) {
      this.cliLoggingService.error(
        `Error: RefreshFolderTreeCommandHandler (${JSON.stringify(command)})`,
        errors,
      );
    }
  }
}
