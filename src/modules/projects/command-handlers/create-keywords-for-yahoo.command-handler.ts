import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateKeywordsForGoogleLocalCommand } from 'modules/projects/commands/create-keywords-for-google-local.command';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { Queue } from 'bull';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { DeviceTypesRepository } from 'modules/device-types/repositories/device-types.repository';
import { KeywordTagRepository } from 'modules/tags/repositories/keyword-tag.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { CreateKeywordsForYahooCommand } from 'modules/projects/commands/create-keywords-for-yahoo.command';
import { IdType } from 'modules/common/types/id-type.type';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';
import { KeywordTagEntity } from 'modules/tags/entities/keyword-tag.entity';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { StartOfKeywordUpdateEvent } from 'modules/keywords/events/start-of-keyword-update.event';
import { UpdateDataForKeywordRankingsEvent } from 'modules/keywords/events/update-data-for-keyword-rankings.event';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';

@CommandHandler(CreateKeywordsForYahooCommand)
export class CreateKeywordsForYahooCommandHandler
  implements ICommandHandler<CreateKeywordsForYahooCommand>
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
   * Executes the CreateKeywordsForYahooCommand by creating keywords in the database,
   * updating keyword positions, and managing quotas and schedules.
   *
   * @param {CreateKeywordsForYahooCommand} command - The command containing the necessary data to create keywords for Yahoo.
   * @return {Promise<void>} - A promise that resolves once the command has been executed.
   */
  async execute(command: CreateKeywordsForYahooCommand): Promise<void> {
    this.cliLoggingService.log('Start: CreateKeywordsForYahooCommandHandler');
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
            project,
            deviceType: deviceTypeMobile,
            positionUpdate: true,
            lastUpdateDate: null,
            tags,
            updatedAt: null,
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
              tags,
              updatedAt: null,
            };
          }),
        );
      }
      if (result && result.length > 0) {
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
              QueueEventEnum.ManualKeywordUpdatesInLiveModeForYahoo,
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
          await this.eventBus.publish(
            new StartOfKeywordUpdateEvent({
              keywordIds: liveModeKeywordIds,
            }),
          );
        }

        if (manualKeywordIds.length > 0) {
          await this.updateKeywordPositionQueue.add(
            QueueEventEnum.ManualKeywordUpdatesForYahoo,
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
    } catch (error) {
      this.cliLoggingService.error(
        `Error: CreateKeywordsForYahooCommandHandler (${JSON.stringify(
          command,
        )})`,
        error,
      );
    }
  }

  /**
   * Finds and returns the IDs that are not present in the second array of objects.
   *
   * @param {IdType[]} ids - An array of IDs to be filtered.
   * @param {KeywordEntity[]} objects - An array of objects containing IDs to be checked against.
   * @return {Promise<IdType[]>} A promise that resolves with the array of IDs not found in the second array.
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
