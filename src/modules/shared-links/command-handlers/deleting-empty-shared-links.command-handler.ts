import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeletingEmptySharedLinksCommand } from 'modules/shared-links/commands/deleting-empty-shared-links.command';
import { SharedLinkRepository } from 'modules/shared-links/repositories/shared-link.repository';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(DeletingEmptySharedLinksCommand)
export class DeletingEmptySharedLinksCommandHandler
  implements ICommandHandler<DeletingEmptySharedLinksCommand>
{
  constructor(
    private readonly sharedLinkRepository: SharedLinkRepository,
    private readonly accountLimitsService: AccountLimitsService,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the command to delete empty shared links and update account limits accordingly.
   *
   * @param {DeletingEmptySharedLinksCommand} command - The command containing the details needed for execution, such as shared link IDs and account ID.
   * @return {Promise<void>} A Promise that resolves when the command execution is complete.
   */
  async execute(command: DeletingEmptySharedLinksCommand): Promise<void> {
    try {
      const sharedLinks =
        await this.sharedLinkRepository.getSharedLinksWithProjects(
          command.sharedLinkIds,
        );

      const removableSharedLinks = [];
      for (const sharedLink of sharedLinks) {
        if (sharedLink.projects.length === 0) {
          removableSharedLinks.push(sharedLink);
        }
      }
      if (removableSharedLinks.length > 0) {
        await this.sharedLinkRepository.remove(removableSharedLinks);
        await this.accountLimitsService.accountingOfSharedLinks(
          command.accountId,
          removableSharedLinks.length * -1,
        );
      }
    } catch (error) {
      this.cliLoggingService.error(
        `Error: DeletingEmptySharedLinksCommandHandler (${JSON.stringify(
          command,
        )})`,
        error,
      );
    }
  }
}
