import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteFoldersCommand } from 'modules/folders/commands/delete-folders.command';
import { FolderRepository } from 'modules/folders/repositories/folder.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(DeleteFoldersCommand)
export class DeleteFoldersCommandHandler
  implements ICommandHandler<DeleteFoldersCommand>
{
  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly cliLoggingService: CliLoggingService,
  ) {}

  /**
   * Executes the delete folders command.
   *
   * @param {DeleteFoldersCommand} command - The command containing the folder IDs to be deleted.
   * @return {Promise<void>} A promise that resolves when the folders have been deleted.
   */
  async execute(command: DeleteFoldersCommand): Promise<void> {
    try {
      const folders = await this.folderRepository.getFoldersByIds(
        command.folderIds,
      );
      await this.folderRepository.deleteAllAssignedFolders(
        folders.map((folder) => folder.id),
      );
      await this.folderRepository.remove(folders);
    } catch (errors) {
      this.cliLoggingService.error(
        'Error: DeleteFoldersCommandHandler',
        errors,
        JSON.stringify(command),
      );
    }
  }
}
