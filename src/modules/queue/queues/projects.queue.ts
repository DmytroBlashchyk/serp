import { BaseQueue } from 'modules/queue/queues/base.queue';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { Job, Queue } from 'bull';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { LatestProjectOverviewRepository } from 'modules/projects/repositories/latest-project-overview.repository';
import { RedisPublisherService } from 'modules/redis/services/redis-publisher.service';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { UpdateDataForProjectsEvent } from 'modules/projects/events/update-data-for-projects.event';
import { EventBus } from '@nestjs/cqrs';

@Processor(Queues.Projects)
export class ProjectsQueue extends BaseQueue {
  constructor(
    protected readonly cliLoggingService: CliLoggingService,
    private readonly keywordRepository: KeywordRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly latestProjectOverviewRepository: LatestProjectOverviewRepository,
    private readonly redisPublisherService: RedisPublisherService,
    private readonly accountLimitsService: AccountLimitsService,
    @InjectQueue(Queues.Triggers)
    private readonly triggersQueue: Queue,
    private readonly eventBus: EventBus,
  ) {
    super(cliLoggingService);
  }

  /**
   * Updates the schedules of projects by checking the number of updated
   * keywords and updating the projects if necessary.
   * It continuously checks until there are no updated keywords left for the project.
   *
   * @param {Job} job - The job object containing the project ID to process.
   * @return {Promise<void>} Resolves when the project schedules have been updated.
   */
  @Process({ name: QueueEventEnum.UpdateProjectSchedules, concurrency: 1 })
  async updateProjectSchedules(job: Job) {
    this.cliLoggingService.log('Start: updateProjectSchedules');

    try {
      let count =
        await this.keywordRepository.getNumberOfUpdatedKeywordsOfProject(
          job.data.projectId,
        );

      while (count > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        count =
          await this.keywordRepository.getNumberOfUpdatedKeywordsOfProject(
            job.data.projectId,
          );
      }

      await this.projectRepository.updateProjectsByProjectIds([
        job.data.projectId,
      ]);
      await this.eventBus.publish(
        new UpdateDataForProjectsEvent({
          projectId: job.data.projectId,
        }),
      );
    } catch (errors) {
      this.cliLoggingService.error('Error: updateProjectSchedules', errors);
    }
  }

  /**
   * Updates data for projects based on provided keyword IDs.
   * The function fetches keywords that are being updated and processes
   * the relevant projects by updating their details and publishing updates
   * through Redis.
   *
   * @param {Job} job - The job containing data such as keyword IDs
   * @return {Promise<void>} - A promise that resolves when data update
   * for projects is complete
   */
  @Process({ name: QueueEventEnum.UpdateDataForProjects, concurrency: 1 })
  async updateDataForProjects(job: Job): Promise<void> {
    this.cliLoggingService.log('Start: updateDataForProjects');
    try {
      const projectsInfo =
        await this.keywordRepository.getKeywordsThatAreBeingUpdated(
          job.data.keywordIds,
        );

      const projects = [];
      for (const project of projectsInfo) {
        if (project.count_true == 0) {
          projects.push({
            id: project.project_id,
            accountId: project.account_id,
          });
        }
      }
      if (projects.length > 0) {
        const projectIds = projects.map((project) => project.id);
        await this.projectRepository.updateProjectsByProjectIds(projectIds);
        for (const id of projectIds) {
          await this.latestProjectOverviewRepository.insertOrUpdateLatestProjectOverview(
            id,
          );
        }

        const updatedProjectsWithData =
          await this.projectRepository.getUpdatedProjectsWithData(projectIds);

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
        for (const id of projectIds) {
          await this.triggersQueue.add(QueueEventEnum.TriggerInitialization, {
            id,
          });
        }
      }
    } catch (error) {
      this.cliLoggingService.error(
        'Error: UpdateDataForProjectsCommandHandler',
        error,
      );
    }
  }
}
