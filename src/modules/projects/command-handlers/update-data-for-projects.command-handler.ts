import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { Queue } from 'bull';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { UpdateDataForProjectsCommand } from 'modules/projects/commands/update-data-for-projects.command';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { LatestProjectOverviewRepository } from 'modules/projects/repositories/latest-project-overview.repository';
import { RedisPublisherService } from 'modules/redis/services/redis-publisher.service';

@CommandHandler(UpdateDataForProjectsCommand)
export class UpdateDataForProjectsCommandHandler
  implements ICommandHandler<UpdateDataForProjectsCommand>
{
  constructor(
    private readonly cliLoggingService: CliLoggingService,
    private readonly accountLimitsService: AccountLimitsService,
    @InjectQueue(Queues.Triggers)
    private readonly triggersQueue: Queue,
    private readonly projectRepository: ProjectRepository,
    private readonly latestProjectOverviewRepository: LatestProjectOverviewRepository,
    private readonly redisPublisherService: RedisPublisherService,
  ) {}
  /**
   * Executes the UpdateDataForProjectsCommand.
   *
   * @param {UpdateDataForProjectsCommand} command - The command containing the project ID to update.
   *
   * @return {Promise<void>} - A promise that resolves when the update process is complete.
   */
  async execute(command: UpdateDataForProjectsCommand): Promise<void> {
    this.cliLoggingService.log('Start: UpdateDataForProjectsCommandHandler');
    try {
      await this.projectRepository.updateProjectsByProjectIds([
        command.projectId,
      ]);
      await this.latestProjectOverviewRepository.insertOrUpdateLatestProjectOverview(
        command.projectId,
      );

      const updatedProjectsWithData =
        await this.projectRepository.getUpdatedProjectsWithData([
          command.projectId,
        ]);
      for (const item of updatedProjectsWithData) {
        const accountId = item.account_id;
        await this.redisPublisherService.publish('handle-update-projects', {
          accountId,
          projects: [item],
        });
        await this.redisPublisherService.publish('update-project-graphics', {
          accountId,
          projectIds: [item.id],
        });

        const limits =
          await this.accountLimitsService.getDailyAndMonthlyAccountLimits(
            accountId,
          );
        await this.redisPublisherService.publish('addition-of-keywords', {
          accountId,
          accountLimitUsed: limits.numberOfKeywords,
          balanceAccountLimit:
            limits.balanceAccountLimitNumberOfDailyUpdatesOfKeywordPositions,
        });
        await this.redisPublisherService.publish('monthly-keyword-update', {
          accountId: accountId,
          accountLimitUsed: limits.numberOfKeywords,
          balanceAccountLimit:
            limits.balanceAccountLimitNumberOfMonthlyUpdatesOfKeywordPositions,
        });
      }
      await this.triggersQueue.add(QueueEventEnum.TriggerInitialization, {
        id: command.projectId,
      });
    } catch (error) {
      this.cliLoggingService.error(
        `Error: UpdateDataForProjectsCommandHandler (${JSON.stringify(
          command,
        )})`,
        error,
      );
    }
  }
}
