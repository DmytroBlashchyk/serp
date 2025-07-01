import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { Queue } from 'bull';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { DeviceTypesRepository } from 'modules/device-types/repositories/device-types.repository';
import { KeywordTagRepository } from 'modules/tags/repositories/keyword-tag.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { CreateKeywordsForBaiduCommand } from 'modules/projects/commands/create-keywords-for-baidu.command';
import { KeywordTagEntity } from 'modules/tags/entities/keyword-tag.entity';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { IdType } from 'modules/common/types/id-type.type';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';

@CommandHandler(CreateKeywordsForBaiduCommand)
export class CreateKeywordsForBaiduCommandHandler
  implements ICommandHandler<CreateKeywordsForBaiduCommand>
{
  constructor(
    @InjectQueue(Queues.UpdateKeywordPosition)
    private readonly updateKeywordPositionQueue: Queue,
    private readonly keywordRepository: KeywordRepository,
    private readonly deviceTypesRepository: DeviceTypesRepository,
    private readonly keywordTagRepository: KeywordTagRepository,
    private readonly cliLoggingService: CliLoggingService,
    private readonly accountLimitsService: AccountLimitsService,
    @InjectQueue(Queues.Projects)
    private readonly projectsQueue: Queue,
    private readonly projectRepository: ProjectRepository,
  ) {}
  /**
   * Executes the CreateKeywordsForBaiduCommand.
   *
   * @param {CreateKeywordsForBaiduCommand} command - The command containing the parameters for creating keywords.
   * @return {Promise<void>} A promise that resolves when the execution is complete.
   */
  async execute(command: CreateKeywordsForBaiduCommand): Promise<void> {
    this.cliLoggingService.log('Start: CreateKeywordsForBaiduCommandHandler');
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
        const keywords =
          await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
            command.accountId,
            result,
          );
        const commonElements = await this.findIdsNotInSecondArray(
          ids,
          keywords,
        );
        if (commonElements.length > 0) {
          await this.keywordRepository.stopUpdating(commonElements);
        }

        if (keywords.length > 0) {
          await this.updateKeywordPositionQueue.add(
            QueueEventEnum.ManualKeywordUpdatesForBaidu,
            {
              keywordIds: keywords.map((keyword) => keyword.id),
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
        `Error: CreateKeywordsForBaiduCommandHandler (${JSON.stringify(
          command,
        )})`,
        error,
      );
    }
  }

  /**
   * Filters out IDs that are present in the second array of objects.
   *
   * @param {IdType[]} ids - The array of IDs to filter.
   * @param {KeywordEntity[]} objects - The array of objects containing IDs to exclude.
   * @return {Promise<IdType[]>} A promise that resolves to an array of IDs not present in the objects array.
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
