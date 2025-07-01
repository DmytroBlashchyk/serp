import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { CreateKeywordsForGoogleLocalCommand } from 'modules/projects/commands/create-keywords-for-google-local.command';
import { KeywordTagEntity } from 'modules/tags/entities/keyword-tag.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { Queue } from 'bull';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { DeviceTypesRepository } from 'modules/device-types/repositories/device-types.repository';
import { KeywordTagRepository } from 'modules/tags/repositories/keyword-tag.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { IdType } from 'modules/common/types/id-type.type';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { StartOfKeywordUpdateEvent } from 'modules/keywords/events/start-of-keyword-update.event';
import { UpdateDataForKeywordRankingsEvent } from 'modules/keywords/events/update-data-for-keyword-rankings.event';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';

@CommandHandler(CreateKeywordsForGoogleLocalCommand)
export class CreateKeywordsForGoogleLocalCommandHandler
  implements ICommandHandler<CreateKeywordsForGoogleLocalCommand>
{
  constructor(
    @InjectQueue(Queues.UpdateKeywordPosition)
    private readonly updateKeywordPositionQueue: Queue,
    private readonly keywordRepository: KeywordRepository,
    private readonly deviceTypesRepository: DeviceTypesRepository,
    private readonly keywordTagRepository: KeywordTagRepository,
    private readonly cliLoggingService: CliLoggingService,
    private readonly accountLimitsService: AccountLimitsService,
    private readonly eventBus: EventBus,
    private readonly projectRepository: ProjectRepository,
    @InjectQueue(Queues.Projects)
    private readonly projectsQueue: Queue,
    private readonly configService: ConfigService,
  ) {}
  /**
   * Executes the CreateKeywordsForGoogleLocalCommand.
   *
   * @param {CreateKeywordsForGoogleLocalCommand} command - The command containing the necessary data to create keywords for Google Local.
   * @return {Promise<void>} - A promise that resolves when the operation is complete.
   */
  async execute(command: CreateKeywordsForGoogleLocalCommand): Promise<void> {
    this.cliLoggingService.log(
      'Start: CreateKeywordsForGoogleLocalCommandHandler',
    );
    try {
      let project = await this.projectRepository.findOne({
        where: { id: command.projectId },
      });

      while (!project) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        project = await this.projectRepository.findOne({
          where: { id: command.projectId },
        });
      }

      const deviceType = await this.deviceTypesRepository.getDeviceTypeByName(
        command.deviceTypeName,
      );
      let tags: KeywordTagEntity[] = [];
      if (command.tagIds?.length > 0) {
        tags = await this.keywordTagRepository.getTagsByIds(command.tagIds);
      }
      const result = await this.keywordRepository.save(
        command.keywords.map((keyword) => {
          return {
            name: keyword.trim().toLowerCase(),
            project,
            deviceType,
            positionUpdate: true,
            lastUpdateDate: null,
            tags,
            updatedAt: null,
          };
        }),
      );
      const ids = result.map((item) => item.id);
      const updatedKeywords =
        await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
          command.accountId,
          result,
          5,
        );
      const commonElements = await this.findIdsNotInSecondArray(
        ids,
        updatedKeywords,
      );
      if (commonElements.length > 0) {
        await this.keywordRepository.stopUpdating(commonElements);
      }
      const keywordIds = [];
      let counter = 0;
      const promises = [];
      const manualKeywordIds = [];
      const liveModeKeywordIds = [];
      const updatedKeywordIds = updatedKeywords.map((item) => item.id);
      const keywords =
        await this.accountLimitsService.limitLiveModeKeywordUpdatesToADailyLimit(
          command.accountId,
          updatedKeywords,
        );

      const keywordsForPriorityQueue = await this.findIdsNotInSecondArray(
        updatedKeywordIds,
        keywords,
      );

      if (keywordsForPriorityQueue.length > 0) {
        manualKeywordIds.push(...keywordsForPriorityQueue);
        keywordIds.push(...keywordsForPriorityQueue);
      }

      for (const keyword of keywords) {
        counter++;
        if (
          counter <=
          this.configService.get<number>(
            ConfigEnvEnum.NUMBER_OF_KEYWORDS_USING_LIVE_MODE_FOR_OTHER_SEARCH_ENGINES,
          )
        ) {
          const result = this.updateKeywordPositionQueue.add(
            QueueEventEnum.ManualKeywordUpdatesInLiveModeForGoogleLocal,
            {
              keywordId: keyword.id,
              isManual: false,
            },
          );
          liveModeKeywordIds.push(keyword.id);
          promises.push(result);
        } else {
          manualKeywordIds.push(keyword.id);
        }

        keywordIds.push(keyword.id);
      }
      if (liveModeKeywordIds.length) {
        const result = await this.projectRepository.getKeywordsGroupedByProject(
          liveModeKeywordIds,
        );
        for (const project of result) {
          await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
            project.account.id,
            project.keywords.length * 5,
          );
          await this.accountLimitsService.takeIntoAccountQuotaOfLiveModeUpdatesPerDay(
            project.account.id,
            project.keywords.length,
          );
        }
        await this.eventBus.publish(
          new StartOfKeywordUpdateEvent({
            keywordIds: liveModeKeywordIds,
          }),
        );
      }

      if (manualKeywordIds.length > 0) {
        await this.updateKeywordPositionQueue.add(
          QueueEventEnum.ManualKeywordUpdatesForGoogleLocal,
          {
            keywordIds: manualKeywordIds,
            isManual: false,
          },
        );
      }

      await this.projectsQueue.add(
        QueueEventEnum.UpdateProjectSchedules,
        {
          projectId: command.projectId,
        },
        {
          jobId: `update-project-${command.projectId}`,
          removeOnComplete: true,
          removeOnFail: true,
          delay: 6000,
        },
      );
    } catch (error) {
      this.cliLoggingService.error(
        `Error: CreateKeywordsForGoogleLocalCommandHandler (${JSON.stringify(
          command,
        )})`,
        error,
      );
    }
  }

  /**
   * Finds IDs from the first array that are not present in the ID field of objects in the second array.
   *
   * @param {IdType[]} ids - The array of IDs to check.
   * @param {KeywordEntity[]} objects - The array of objects, each containing an ID field, to compare against.
   * @return {Promise<IdType[]>} A promise that resolves to an array of IDs that are in the first array but not in the second array's objects.
   */
  async findIdsNotInSecondArray(
    ids: IdType[],
    objects: KeywordEntity[],
  ): Promise<IdType[]> {
    if (objects.length === 0) {
      return ids;
    }

    const objectIds = objects.map((item) => item.id);

    return ids.filter((id) => !objectIds.includes(id));
  }
}
