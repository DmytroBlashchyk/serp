import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { Queue } from 'bull';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { DeviceTypesRepository } from 'modules/device-types/repositories/device-types.repository';
import { KeywordTagRepository } from 'modules/tags/repositories/keyword-tag.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { CreateKeywordsForGoogleMapsCommand } from 'modules/projects/commands/create-keywords-for-google-maps.command';
import { KeywordTagEntity } from 'modules/tags/entities/keyword-tag.entity';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { StartOfKeywordUpdateEvent } from 'modules/keywords/events/start-of-keyword-update.event';
import { UpdateDataForKeywordRankingsEvent } from 'modules/keywords/events/update-data-for-keyword-rankings.event';
import { IdType } from 'modules/common/types/id-type.type';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';

@CommandHandler(CreateKeywordsForGoogleMapsCommand)
export class CreateKeywordsForGoogleMapsCommandHandler
  implements ICommandHandler<CreateKeywordsForGoogleMapsCommand>
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
   * Executes the CreateKeywordsForGoogleMapsCommand.
   *
   * @param {CreateKeywordsForGoogleMapsCommand} command - The command containing the information needed to create keywords for Google Maps.
   * @return {Promise<void>} - A promise that resolves when the command execution is complete.
   */
  async execute(command: CreateKeywordsForGoogleMapsCommand): Promise<void> {
    this.cliLoggingService.log(
      'Start: CreateKeywordsForGoogleMapsCommandHandler',
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
            ConfigEnvEnum.NUMBER_OF_KEYWORDS_USING_LIVE_MODE_FOR_STANDARD_SEARCH_ENGINES,
          )
        ) {
          const result = this.updateKeywordPositionQueue.add(
            QueueEventEnum.ManualKeywordUpdatesInLiveModeForGoogleMaps,
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
            project.keywords.length,
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
          QueueEventEnum.ManualKeywordUpdatesForGoogleMaps,
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
    } catch (errors) {
      this.cliLoggingService.error(
        `Error: CreateKeywordsForGoogleMapsCommandHandler (${JSON.stringify(
          command,
        )})`,
        errors,
      );
    }
  }

  /**
   * Finds and returns an array of IDs that are present in the first array but not in the second array of objects.
   *
   * @param {IdType[]} ids - An array of IDs to be checked.
   * @param {KeywordEntity[]} objects - An array of objects containing IDs to check against.
   * @return {Promise<IdType[]>} A promise that resolves to an array of IDs not found in the second array.
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
