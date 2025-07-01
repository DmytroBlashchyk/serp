import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateKeywordsCommand } from 'modules/projects/commands/create-keywords.command';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { Queue } from 'bull';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { DeviceTypesRepository } from 'modules/device-types/repositories/device-types.repository';
import { KeywordTagRepository } from 'modules/tags/repositories/keyword-tag.repository';
import { KeywordTagEntity } from 'modules/tags/entities/keyword-tag.entity';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';
import { IdType } from 'modules/common/types/id-type.type';
import { StartOfKeywordUpdateEvent } from 'modules/keywords/events/start-of-keyword-update.event';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';

/**
 * Handles the creation of keywords.
 *
 * This handler processes the CreateKeywordsCommand. It interacts with various repositories,
 * queues, and services to manage the creation and positioning of keywords. This includes
 * fetching device types, saving keywords, and handling keyword position updates.
 *
 * @param {Queue} updateKeywordPositionQueue - Queue for updating keyword positions.
 * @param {KeywordRepository} keywordRepository - Repository for CRUD operations on keywords.
 * @param {DeviceTypesRepository} deviceTypesRepository - Repository for fetching device types.
 * @param {KeywordTagRepository} keywordTagRepository - Repository for fetching keyword tags.
 * @param {CliLoggingService} cliLoggingService - Service for logging during command execution.
 * @param {AccountLimitsService} accountLimitsService - Service to manage account limits.
 * @param {EventBus} eventBus - Event bus for publishing events.
 * @param {ProjectRepository} projectRepository - Repository for project-related operations.
 * @param {Queue} projectsQueue - Queue for updating project schedules.
 * @param {ConfigService} configService - Service for accessing configuration settings.
 */
@CommandHandler(CreateKeywordsCommand)
export class CreateKeywordCommandHandler
  implements ICommandHandler<CreateKeywordsCommand>
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
   * Executes the CreateKeywordsCommand by adding keywords to the repository,
   * managing keyword update queues, and ensuring compliance with account limits.
   *
   * @param {CreateKeywordsCommand} command - The command containing the necessary data to create keywords.
   * @return {Promise<void>} - A promise that resolves when the command execution is complete.
   */
  async execute(command: CreateKeywordsCommand): Promise<void> {
    this.cliLoggingService.log('Start: CreateKeywordCommandHandler');
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

      let tags: KeywordTagEntity[] = [];
      if (command.tagIds?.length > 0) {
        tags = await this.keywordTagRepository.getTagsByIds(command.tagIds);
      }
      let result;
      if (command.deviceTypeName === DeviceTypesEnum.DesktopAndMobile) {
        const data = [];
        const deviceTypeDesktop =
          await this.deviceTypesRepository.getDeviceTypeByName(
            DeviceTypesEnum.Desktop,
          );
        const deviceTypeMobile =
          await this.deviceTypesRepository.getDeviceTypeByName(
            DeviceTypesEnum.Mobile,
          );
        for (const keyword of command.keywords) {
          data.push({
            name: keyword.trim().toLowerCase(),
            project,
            deviceType: deviceTypeDesktop,
            positionUpdate: true,
            lastUpdateDate: null,
            tags,
            updatedAt: null,
          });
          data.push({
            name: keyword.trim().toLowerCase(),
            project: { id: command.projectId },
            deviceType: deviceTypeMobile,
            positionUpdate: true,
            lastUpdateDate: null,
            updatedAt: null,
            tags,
          });
        }
        result = await this.keywordRepository.save(data);
      } else {
        const deviceType = await this.deviceTypesRepository.getDeviceTypeByName(
          command.deviceTypeName,
        );
        result = await this.keywordRepository.save(
          command.keywords.map((keyword) => {
            return {
              name: keyword.trim().toLowerCase(),
              project,
              deviceType,
              positionUpdate: true,
              lastUpdateDate: null,
              updatedAt: null,
              tags,
            };
          }),
        );
      }
      if (result && result.length > 0) {
        const ids = result.map((item) => item.id);
        if (command.deviceTypeName === DeviceTypesEnum.Mobile) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
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
              QueueEventEnum.ManualKeywordUpdatesInLiveMode,
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
          await this.eventBus.publish(
            new StartOfKeywordUpdateEvent({
              keywordIds: liveModeKeywordIds,
            }),
          );
          const result =
            await this.projectRepository.getKeywordsGroupedByProject(
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
        }

        if (keywordIds.length > 0) {
          await this.updateKeywordPositionQueue.add(
            QueueEventEnum.GetCPCAndSearchVolume,
            {
              keywordIds,
              projectId: command.projectId,
            },
          );
          if (manualKeywordIds.length > 0) {
            await this.updateKeywordPositionQueue.add(
              QueueEventEnum.ManualKeywordUpdates,
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
        }
      }
    } catch (error) {
      this.cliLoggingService.error(
        `Error: CreateKeywordCommandHandler (${JSON.stringify(command)})`,
        error,
      );
    }
  }

  /**
   * Find IDs that are present in the first array but not in the second array of objects.
   *
   * @param {IdType[]} ids - An array of IDs to be checked.
   * @param {KeywordEntity[]} objects - An array of objects containing IDs to filter against.
   * @return {Promise<IdType[]>} A promise that resolves to an array of IDs not present in the second array of objects.
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
