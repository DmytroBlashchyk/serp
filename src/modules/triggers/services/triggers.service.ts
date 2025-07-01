import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTriggerType } from 'modules/triggers/types/create-trigger.type';
import { TriggerTypesService } from 'modules/triggers/services/trigger-types.service';
import { TriggerRulesService } from 'modules/triggers/services/trigger-rules.service';
import { ProjectsService } from 'modules/projects/services/projects.service';
import { TriggerTypeEnum } from 'modules/triggers/enums/trigger-type.enum';
import { TriggerRepository } from 'modules/triggers/repositories/trigger.repository';
import { TriggerRecipientRepository } from 'modules/triggers/repositories/trigger-recipient.repository';
import { KeywordsService } from 'modules/keywords/services/keywords.service';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { TriggerKeywordRepository } from 'modules/triggers/repositories/trigger-keyword.repository';
import { IdType } from 'modules/common/types/id-type.type';
import { GeTriggersByProjectRequest } from 'modules/triggers/requests/ge-triggers-by-project.request';
import { TriggersByProjectResponse } from 'modules/triggers/responses/triggers-by-project.response';
import { TriggerByProjectResponse } from 'modules/triggers/responses/trigger-by-project.response';
import { TriggersByKeywordsResponseFactory } from 'modules/triggers/factories/triggers-by-keywords-response.factory';
import { TriggersByKeywordsResponse } from 'modules/triggers/responses/triggers-by-keywords.response';
import { DeleteTriggersByProjectsType } from 'modules/triggers/types/delete-triggers-by-projects.type';
import { DeleteTriggersByKeywordsType } from 'modules/triggers/types/delete-triggers-by-keywords.type';
import { TriggerType } from 'modules/triggers/types/trigger.type';
import { TriggerResponse } from 'modules/triggers/responses/trigger.response';
import { UpdateTriggerType } from 'modules/triggers/types/update-trigger.type';
import { GetTriggerKeywordsType } from 'modules/triggers/types/get-trigger-keywords.type';
import { GetTriggerKeywordsRequest } from 'modules/triggers/requests/get-trigger-keywords.request';
import { TriggerKeywordsResponse } from 'modules/triggers/responses/trigger-keywords.response';
import { TriggerKeywordResponse } from 'modules/triggers/responses/trigger-keyword.response';
import { UpdateProjectTriggerType } from 'modules/triggers/types/update-project-trigger.type';
import { EventBus } from '@nestjs/cqrs';
import { CreateTriggerWithKeywordsEvent } from 'modules/triggers/events/create-trigger-with-keywords.event';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { RecipientResponse } from 'modules/triggers/responses/recipient.response';
import { CreateAlertEvent } from 'modules/alerts/events/create-alert.event';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { CreateTriggerResponse } from 'modules/triggers/responses/create-trigger.response';
import { getFaviconHelper } from 'modules/projects/helpers/getFaviconHelper';

@Injectable()
export class TriggersService {
  constructor(
    private readonly triggerTypesService: TriggerTypesService,
    private readonly triggerRulesService: TriggerRulesService,
    private readonly projectsService: ProjectsService,
    private readonly triggerRepository: TriggerRepository,
    private readonly triggerRecipientRepository: TriggerRecipientRepository,
    private readonly keywordsService: KeywordsService,
    private readonly triggerKeywordRepository: TriggerKeywordRepository,
    private readonly triggersByKeywordsResponseFactory: TriggersByKeywordsResponseFactory,
    private readonly eventBus: EventBus,
    private readonly projectRepository: ProjectRepository,
    private readonly accountLimitsService: AccountLimitsService,
  ) {}

  /**
   * Initializes triggers for a given project by fetching trigger IDs associated
   * with the project and publishing a CreateAlertEvent for each trigger.
   *
   * @param {IdType} projectId - The unique identifier of the project whose triggers
   * need to be initialized.
   *
   * @return {Promise<void>} - A promise that resolves when all triggers have been
   * initialized.
   */
  async initializationOfTriggers(projectId: IdType): Promise<void> {
    const triggerIds = await this.triggerRepository.getProjectTriggers(
      projectId,
    );
    for (const trigger of triggerIds) {
      this.eventBus.publish(new CreateAlertEvent({ triggerId: trigger.id }));
    }
  }

  /**
   * Updates a project trigger based on the given payload. It fetches the existing trigger by its ID and account ID,
   * validates its type, and updates its rule and threshold if specified in the payload. Additionally, it manages the
   * trigger recipients by adding new emails and removing old ones as specified in the payload.
   *
   * @param {UpdateProjectTriggerType} payload - The payload object containing the trigger details to be updated.
   * @return {Promise<void>} - A promise that resolves when the project trigger is successfully updated.
   * @throws {NotFoundException} - Throws an exception if the trigger is not found or its type is not 'ByProject'.
   */
  @Transactional()
  async updateProjectTrigger(payload: UpdateProjectTriggerType): Promise<void> {
    const trigger = await this.triggerRepository.getTriggerByIdAndAccountId(
      payload.triggerId,
      payload.accountId,
      payload.userId,
    );
    if (!trigger || trigger.type.name !== TriggerTypeEnum.ByProject) {
      throw new NotFoundException('Trigger not found.');
    }
    if (payload.triggerRule) {
      trigger.rule = await this.triggerRulesService.getTriggerRule(
        payload.triggerRule,
      );
    }
    if (payload.threshold) {
      trigger.threshold = payload.threshold;
    }
    await this.triggerRepository.save(trigger);
    if (payload.emails?.length > 0) {
      const newEmails = [];
      const deleteEmails = [];
      for (const i of payload.emails) {
        if (!trigger.recipients.find((item) => item.email === i.email)) {
          newEmails.push(i);
        }
      }
      if (newEmails.length > 0) {
        await this.triggerRecipientRepository.save(
          newEmails.map((item) => {
            return { trigger, email: item.email, subscribed: item.subscribed };
          }),
        );
      }
      for (const item of trigger.recipients) {
        if (!payload.emails.find((i) => i.email === item.email)) {
          deleteEmails.push(item);
        }
      }
      if (deleteEmails.length > 0) {
        await this.triggerRecipientRepository.remove(deleteEmails);
      }
    }
  }

  /**
   * Retrieves the trigger keywords based on the provided payload and options.
   *
   * @param {GetTriggerKeywordsType} payload - The payload containing the criteria for fetching trigger keywords.
   * @param {GetTriggerKeywordsRequest} options - Options for the request, including pagination and filters.
   * @return {Promise<TriggerKeywordsResponse>} A promise that resolves to a TriggerKeywordsResponse object containing the fetched trigger keywords and metadata.
   */
  async getTriggerKeywords(
    payload: GetTriggerKeywordsType,
    options: GetTriggerKeywordsRequest,
  ): Promise<TriggerKeywordsResponse> {
    const { items, meta } =
      await this.triggerKeywordRepository.getTriggerKeywords(payload, options);
    return new TriggerKeywordsResponse({
      items: items.map((item) => {
        return new TriggerKeywordResponse({
          triggerKeywordId: item.id,
          name: item.keyword.name,
          deviceType: item.keyword.deviceType,
          keywordId: item.keyword.id,
        });
      }),
      meta,
    });
  }

  /**
   * Updates the keyword trigger based on the provided payload. This includes updating the trigger rules, keywords, threshold,
   * and recipient emails associated with the trigger.
   *
   * @param {UpdateTriggerType} payload - The data required to update the keyword trigger, including trigger ID, account ID,
   * user ID, trigger rules, keyword IDs, threshold, and recipient emails.
   *
   * @returns {Promise<void>} - A promise that resolves when the keyword trigger update is complete.
   *
   * @throws {NotFoundException} - If the trigger is not found or the trigger type is not "ByKeywords".
   */
  @Transactional()
  async updateKeywordTrigger(payload: UpdateTriggerType): Promise<void> {
    const trigger = await this.triggerRepository.getTriggerByIdAndAccountId(
      payload.triggerId,
      payload.accountId,
      payload.userId,
    );
    if (!trigger || trigger.type.name !== TriggerTypeEnum.ByKeywords) {
      throw new NotFoundException('Trigger not found.');
    }
    if (payload.triggerRule) {
      await this.triggerRepository.save({
        id: trigger.id,
        rule: await this.triggerRulesService.getTriggerRule(
          payload.triggerRule,
        ),
      });
    }

    const newKeywordIds = [];
    const deleteKeywords = [];
    for (const id of payload.keywordIds) {
      if (!trigger.triggerKeywords.find((item) => item.keyword.id == id)) {
        newKeywordIds.push(id);
      }
    }
    for (const item of trigger.triggerKeywords) {
      if (!payload.keywordIds.includes(Number(item.keyword.id))) {
        deleteKeywords.push(item);
      }
    }
    if (deleteKeywords.length > 0) {
      await this.triggerKeywordRepository.remove(deleteKeywords);
    }
    if (newKeywordIds.length > 0) {
      const getUniqueIds =
        await this.triggerKeywordRepository.getIdsOfUniqueKeywordsForTrigger(
          trigger.project.id,
          payload.triggerRule,
          payload.threshold,
        );
      const keywordIds = newKeywordIds.filter(
        (value) => !getUniqueIds.includes(value),
      );
      this.eventBus.publish(
        new CreateTriggerWithKeywordsEvent({
          keywordIds: keywordIds,
          triggerId: trigger.id,
        }),
      );
    }

    if (payload.threshold) {
      await this.triggerRepository.save({
        id: trigger.id,
        threshold: payload.threshold,
      });
    }
    if (payload.emails?.length > 0) {
      const newEmails = [];
      const deleteEmails = [];
      for (const i of payload.emails) {
        if (!trigger.recipients.find((item) => item.email === i.email)) {
          newEmails.push(i);
        }
      }
      if (newEmails.length > 0) {
        await this.triggerRecipientRepository.save(
          newEmails.map((item) => {
            return { trigger, email: item.email, subscribed: item.subscribed };
          }),
        );
      }
      for (const item of trigger.recipients) {
        if (!payload.emails.find((i) => i.email === item.email)) {
          deleteEmails.push(item);
        }
      }
      if (deleteEmails.length > 0) {
        await this.triggerRecipientRepository.remove(deleteEmails);
      }
    }
  }

  /**
   * Retrieves a trigger based on the given payload.
   *
   * @param {TriggerType} payload - The identifier and account information needed to fetch the trigger.
   * @return {Promise<TriggerResponse>} A promise that resolves to a TriggerResponse object containing the trigger details.
   * @throws {NotFoundException} If no trigger is found with the given parameters.
   */
  async getTrigger(payload: TriggerType): Promise<TriggerResponse> {
    const trigger = await this.triggerRepository.getTriggerByIdAndAccountId(
      payload.id,
      payload.accountId,
      payload.userId,
    );
    if (!trigger) {
      throw new NotFoundException('Trigger not found.');
    }
    return new TriggerResponse({
      ...trigger,
      recipients: trigger.recipients.map(
        (item) => new RecipientResponse({ ...item }),
      ),
      totalKeywords: trigger.triggerKeywords.length,
    });
  }

  /**
   * Removes keywords from triggers based on the provided payload.
   *
   * @param {DeleteTriggersByKeywordsType} payload - The payload containing account ID and trigger keyword IDs.
   * @return {Promise<void>} A promise that resolves when the keywords and associated triggers are removed.
   * @throws {NotFoundException} If some of the trigger keywords are not found.
   */
  @Transactional()
  async removeKeywordsFromTrigger(
    payload: DeleteTriggersByKeywordsType,
  ): Promise<void> {
    const triggerKeywords =
      await this.triggerKeywordRepository.getTriggerKeywordsByIdsAndAccountId(
        payload.accountId,
        payload.triggerKeywordIds,
      );
    if (triggerKeywords.length !== payload.triggerKeywordIds.length) {
      throw new NotFoundException('Triggers by keywords not found.');
    }
    const triggerIds = [];
    for (const triggerKeyword of triggerKeywords) {
      triggerIds.push(triggerKeyword.trigger.id);
    }
    await this.triggerKeywordRepository.remove(triggerKeywords);
    const triggers = await this.triggerRepository.getTriggersByTypeAndIds(
      TriggerTypeEnum.ByKeywords,
      triggerIds,
      payload.accountId,
    );
    const triggersWithoutKeywords = [];
    for (const item of triggers) {
      if (item.triggerKeywords.length === 0) {
        triggersWithoutKeywords.push(item);
      }
    }
    await this.triggerRepository.remove(triggersWithoutKeywords);
  }

  /**
   * Deletes triggers identified by keywords.
   *
   * @param {DeleteTriggersByProjectsType} payload - The payload containing the account ID and trigger IDs to remove.
   * @return {Promise<void>} No return value.
   * @throws {NotFoundException} If any of the triggers identified by the given IDs are not found.
   */
  async deleteTriggersByKeywords(
    payload: DeleteTriggersByProjectsType,
  ): Promise<void> {
    const triggers = await this.triggerRepository.getTriggersByTypeAndIds(
      TriggerTypeEnum.ByKeywords,
      payload.ids,
      payload.accountId,
    );
    if (triggers.length !== payload.ids.length) {
      throw new NotFoundException('Triggers by ids not found.');
    }

    await this.triggerRepository.remove(triggers);
    await this.accountLimitsService.accountingOfTriggers(
      payload.accountId,
      triggers.length * -1,
    );
  }

  /**
   * Deletes triggers associated with specific projects.
   *
   * This method takes a payload containing project IDs and an account ID,
   * retrieves the associated triggers, and removes them from the repository.
   * It also updates the account limits based on the number of triggers removed.
   *
   * @param {DeleteTriggersByProjectsType} payload - The payload containing project IDs and account ID.
   * @return {Promise<void>} A promise that resolves when the triggers have been successfully deleted.
   * @throws {NotFoundException} If any of the trigger IDs provided in the payload are not found.
   */
  async deleteTriggersByProjects(
    payload: DeleteTriggersByProjectsType,
  ): Promise<void> {
    const triggers = await this.triggerRepository.getTriggersByTypeAndIds(
      TriggerTypeEnum.ByProject,
      payload.ids,
      payload.accountId,
    );
    if (triggers.length !== payload.ids.length) {
      throw new NotFoundException('Triggers by ids not found.');
    }

    await this.triggerRepository.remove(triggers);
    await this.accountLimitsService.accountingOfTriggers(
      payload.accountId,
      triggers.length * -1,
    );
  }

  /**
   * Fetches the triggers by keywords for a given account and user based on the specified options.
   *
   * @param {IdType} accountId - The ID of the account.
   * @param {IdType} userId - The ID of the user.
   * @param {GeTriggersByProjectRequest} options - The options for fetching the triggers.
   * @return {Promise<TriggersByKeywordsResponse>} - A promise that resolves to a response containing the triggers by keywords.
   */
  async getTriggersByKeywords(
    accountId: IdType,
    userId: IdType,
    options: GeTriggersByProjectRequest,
  ): Promise<TriggersByKeywordsResponse> {
    const { items, meta } = await this.triggerRepository.paginatedTriggers(
      TriggerTypeEnum.ByKeywords,
      accountId,
      userId,
      options,
    );
    return this.triggersByKeywordsResponseFactory.createResponse(items, meta);
  }

  /**
   * Retrieves trigger data grouped by projects for a specified account and user.
   *
   * @param {IdType} accountId - The identifier for the account.
   * @param {IdType} userId - The identifier for the user.
   * @param {GeTriggersByProjectRequest} options - Additional options for retrieving triggers.
   * @returns {Promise<TriggersByProjectResponse>} A promise that resolves to a response object containing the triggers grouped by projects.
   */
  async getTriggersByProjects(
    accountId: IdType,
    userId: IdType,
    options: GeTriggersByProjectRequest,
  ): Promise<TriggersByProjectResponse> {
    const { items, meta } = await this.triggerRepository.paginatedTriggers(
      TriggerTypeEnum.ByProject,
      accountId,
      userId,
      options,
    );
    return new TriggersByProjectResponse({
      items: items.map((item) => {
        return new TriggerByProjectResponse({
          ...item,
          projectName: item.project.projectName,
          favicon: item.project.url ? getFaviconHelper(item.project.url) : null,
        });
      }),
      meta,
    });
  }

  /**
   * Creates a new trigger based on the specified payload. The trigger can be associated
   * with a specific project and linked to certain rules and thresholds. Notifications
   * can be sent to specified email addresses upon trigger creation.
   *
   * @param {CreateTriggerType} payload - The data required to create a trigger, including
   *        trigger type, rule, project ID, threshold, user info, account ID, emails, and keyword IDs.
   *
   * @return {Promise<CreateTriggerResponse>} - A promise that resolves to a response
   *         indicating whether duplicate triggers for keywords were omitted.
   */
  @Transactional()
  async createTrigger(
    payload: CreateTriggerType,
  ): Promise<CreateTriggerResponse> {
    const triggerType = await this.triggerTypesService.getTriggerType(
      payload.triggerType,
    );
    const triggerRule = await this.triggerRulesService.getTriggerRule(
      payload.triggerRule,
    );
    const project = await this.projectsService.getProjectById(
      payload.projectId,
    );

    if (triggerType.name === TriggerTypeEnum.ByProject) {
      const uniqueTrigger =
        await this.triggerRepository.getAUniqueTriggerByProject(
          project.id,
          triggerType.name,
          triggerRule.name,
          payload.threshold,
        );
      if (uniqueTrigger) {
        throw new BadRequestException(
          'A trigger with these settings already exists.',
        );
      }

      const trigger = await this.triggerRepository.save({
        project,
        owner: { id: payload.user.id },
        account: { id: payload.accountId },
        type: triggerType,
        rule: triggerRule,
        threshold: payload.threshold,
      });
      await this.accountLimitsService.accountingOfTriggers(
        payload.accountId,
        1,
      );
      if (payload.emails.length > 0) {
        await this.triggerRecipientRepository.save(
          payload.emails.map((item) => {
            return {
              email: item.email,
              subscribed: item.subscribed,
              trigger,
            };
          }),
        );
      }
      const keywordIds = await this.projectRepository.getKeywordIdsForProject(
        project.id,
      );
      if (keywordIds.length > 0) {
        await this.eventBus.publish(
          new CreateTriggerWithKeywordsEvent({
            keywordIds,
            triggerId: trigger.id,
          }),
        );
      }
      return new CreateTriggerResponse({
        duplicateTriggersForKeywordsHaveBeenOmitted: false,
      });
    } else {
      const getUniqueIds =
        await this.triggerKeywordRepository.getIdsOfUniqueKeywordsForTrigger(
          project.id,
          payload.triggerRule,
          payload.threshold,
        );
      const keywordIds = payload.keywordIds.filter(
        (value) => !getUniqueIds.includes(value),
      );

      if (!keywordIds || keywordIds.length > 0) {
        const keywords =
          await this.keywordsService.getKeywordsByIdsAndProjectId(
            keywordIds,
            payload.projectId,
          );
        if (keywords.length > 0) {
          const trigger = await this.triggerRepository.save({
            project,
            owner: { id: payload.user.id },
            account: { id: payload.accountId },
            type: triggerType,
            rule: triggerRule,
            threshold: payload.threshold,
          });
          await this.accountLimitsService.accountingOfTriggers(
            payload.accountId,
            1,
          );
          if (payload.emails.length > 0) {
            await this.triggerRecipientRepository.save(
              payload.emails.map((item) => {
                return {
                  email: item.email,
                  subscribed: item.subscribed,
                  trigger,
                };
              }),
            );
          }
          this.eventBus.publish(
            new CreateTriggerWithKeywordsEvent({
              keywordIds: keywords.map((keyword) => keyword.id),
              triggerId: trigger.id,
            }),
          );
        }
        return new CreateTriggerResponse({
          duplicateTriggersForKeywordsHaveBeenOmitted:
            payload.keywordIds.length !== keywords.length,
        });
      }
      return new CreateTriggerResponse({
        duplicateTriggersForKeywordsHaveBeenOmitted: true,
      });
    }
  }
}
