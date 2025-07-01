import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { TriggerKeywordEntity } from 'modules/triggers/entities/trigger-keyword.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { getKeyByValue } from 'modules/common/utils/get-enum-value-by-key';
import { GetTriggerKeywordsType } from 'modules/triggers/types/get-trigger-keywords.type';
import { GetTriggerKeywordsRequest } from 'modules/triggers/requests/get-trigger-keywords.request';
import { SortTriggerKeywordsEnum } from 'modules/triggers/enums/sort-trigger-keywords.enum';
import { DataOfProjectKeywordsHitByTriggerRuleType } from 'modules/alerts/types/data-of-project-keywords-hit-by-trigger-rule.type';
import { TriggerRuleEnum } from 'modules/triggers/enums/trigger-rule.enum';

@Injectable()
@EntityRepository(TriggerKeywordEntity)
export class TriggerKeywordRepository extends BaseRepository<TriggerKeywordEntity> {
  /**
   * Fetches a list of unique keyword IDs associated with a specific trigger rule in a given project.
   *
   * @param {IdType} projectId - The ID of the project to fetch keywords from.
   * @param {TriggerRuleEnum} ruleName - The name of the trigger rule to match.
   * @param {number} threshold - The threshold value to match.
   * @return {Promise<number[]>} A promise that resolves to an array of unique keyword IDs.
   */
  async getIdsOfUniqueKeywordsForTrigger(
    projectId: IdType,
    ruleName: TriggerRuleEnum,
    threshold: number,
  ): Promise<number[]> {
    const result = await this.query(
      `
select DISTINCT triggers_keywords.keyword_id from triggers_keywords
left join triggers on triggers_keywords.trigger_id = triggers.id
left join trigger_rules on triggers.rule_id = trigger_rules.id
left join trigger_types on triggers.type_id = trigger_types.id
where triggers.threshold = $1
  and trigger_rules.name = $2
  and triggers.project_id = $3`,
      [threshold, ruleName, projectId],
    );
    return result.map((i: { keyword_id: IdType }) => Number(i.keyword_id));
  }

  /**
   * Retrieves data of project keywords that are impacted by a specified trigger rule.
   *
   * @param {IdType} triggerId - The ID of the specific trigger rule.
   * @return {Promise<Array<DataOfProjectKeywordsHitByTriggerRuleType>>} A promise that resolves to an array of data containing project keywords hit by the trigger rule.
   */
  async getDataOfProjectKeywordsHitByTriggerRule(
    triggerId: IdType,
  ): Promise<Array<DataOfProjectKeywordsHitByTriggerRuleType>> {
    return this.query(
      `
WITH last_keyword_positions AS (
    SELECT
        DATE(MAX(keyword_positions_for_day.update_date)) as date,
        keyword_positions_for_day.keyword_id as keyword_id
    FROM
        keyword_positions_for_day
        join keywords on keyword_positions_for_day.keyword_id = keywords.id
        left join triggers_keywords on keywords.id = triggers_keywords.keyword_id
        where triggers_keywords.trigger_id = $1
    GROUP BY
        keyword_positions_for_day.keyword_id
)
SELECT keywords.id as keyword_id,
       keywords.name as keyword_name,
       keyword_positions_for_day.position as current_position,
       keyword_positions_for_day.previous_position as previous_position,
       keyword_positions_for_day.id as keyword_positions_for_day_id,
       desktop_types.id as device_type_id,
       desktop_types.name as device_type_name,
       triggers.id
from triggers_keywords
left join triggers on triggers_keywords.trigger_id = triggers.id
left join trigger_rules on triggers.rule_id = trigger_rules.id
left join keywords on triggers_keywords.keyword_id = keywords.id
left join desktop_types on keywords.device_type_id = desktop_types.id
left join last_keyword_positions on keywords.id = last_keyword_positions.keyword_id
left join keyword_positions_for_day on keywords.id = keyword_positions_for_day.keyword_id AND last_keyword_positions.date = keyword_positions_for_day.update_date
where triggers_keywords.trigger_id = $1 AND triggers_keywords.trigger_initialization is TRUE
AND( (
    trigger_rules.name = '${TriggerRuleEnum.ChangesByMoreThan}'
    AND ABS(keyword_positions_for_day.previous_position - keyword_positions_for_day.position) > triggers.threshold
    AND keyword_positions_for_day.position != 101
    )
    OR
    (
    trigger_rules.name ='${TriggerRuleEnum.EntersTheTop}'
    AND keyword_positions_for_day.position < triggers.threshold
    AND keyword_positions_for_day.previous_position > triggers.threshold
    AND keyword_positions_for_day.position != 101
    )
    OR
    (
    trigger_rules.name = '${TriggerRuleEnum.LeavesTheTop}'
    AND keyword_positions_for_day.position > triggers.threshold
    AND keyword_positions_for_day.previous_position < triggers.threshold
    AND keyword_positions_for_day.position != 101
    )
    OR
    (
    trigger_rules.name = '${TriggerRuleEnum.ImprovesMoreThan}'
        AND keyword_positions_for_day.previous_position > keyword_positions_for_day.position
        AND keyword_positions_for_day.previous_position - keyword_positions_for_day.position > triggers.threshold
        AND keyword_positions_for_day.position != 101
    )
    OR
    (
        trigger_rules.name = '${TriggerRuleEnum.DeclinesMoreThan}'
        AND keyword_positions_for_day.previous_position < keyword_positions_for_day.position
        AND keyword_positions_for_day.position - keyword_positions_for_day.previous_position > triggers.threshold
        AND keyword_positions_for_day.position != 101
    ))
    `,
      [triggerId],
    );
  }

  /**
   * Updates the trigger initialization status for the keywords matching the provided IDs.
   *
   * @param {IdType[]} keywordIds - An array of keyword IDs for which the trigger initialization status should be updated.
   * @param {boolean} [triggerInitialization=false] - The new trigger initialization status to apply. Default is false.
   * @return {Promise<void>} A promise that resolves when the update operation is complete.
   */
  async changeTriggerInitialization(
    keywordIds: IdType[],
    triggerInitialization: boolean = false,
  ): Promise<void> {
    await this.createQueryBuilder('triggers_keywords')
      .leftJoin('triggers_keywords.keyword', 'keyword')
      .update()
      .set({ triggerInitialization })
      .where('keyword.id in(:...keywordIds)', { keywordIds })
      .execute();
  }

  /**
   * Updates the initialization state of trigger keywords.
   *
   * @param {IdType[]} keywordIds - An array of keyword identifiers.
   * @param {IdType} triggerId - The identifier of the trigger.
   * @param {boolean} [triggerInitialization=false] - The initialization state to set for the trigger keywords.
   * @return {Promise<void>} A promise that resolves when the update is complete.
   */
  async changesInInitializationOfTriggerKeywords(
    keywordIds: IdType[],
    triggerId: IdType,
    triggerInitialization: boolean = false,
  ): Promise<void> {
    await this.createQueryBuilder('triggers_keywords')
      .leftJoin('triggers_keywords.keyword', 'keyword')
      .leftJoin('triggers_keywords.trigger', 'trigger')
      .update()
      .set({ triggerInitialization })
      .where('keyword.id in(:...keywordIds) and trigger.id =:triggerId', {
        keywordIds,
        triggerId,
      })
      .execute();
  }

  /**
   * Retrieves the count of trigger keywords associated with a specific trigger.
   *
   * @param {IdType} triggerId - The unique identifier of the trigger.
   * @return {Promise<number>} - A promise that resolves to the number of trigger keywords.
   */
  async getTriggerKeywordsCount(triggerId: IdType): Promise<number> {
    return this.createQueryBuilder('triggers_keywords')
      .leftJoinAndSelect('triggers_keywords.trigger', 'trigger')
      .where('trigger.id =:triggerId', { triggerId })
      .getCount();
  }
  /**
   * Retrieves trigger keywords based on the provided payload and options.
   *
   * @param {GetTriggerKeywordsType} payload - The payload containing the account ID, trigger ID, and user ID.
   * @param {GetTriggerKeywordsRequest} options - The request options including search query, sorting, pagination, etc.
   * @return {Promise<Pagination<TriggerKeywordEntity>>} - A promise that resolves to the paginated result of trigger keywords.
   */
  async getTriggerKeywords(
    payload: GetTriggerKeywordsType,
    options: GetTriggerKeywordsRequest,
  ): Promise<Pagination<TriggerKeywordEntity>> {
    const searchQuery = options.search
      ? ' AND keyword.name ILike(:search)'
      : '';
    const queryBuilder = this.createQueryBuilder('triggers_keywords')
      .withDeleted()
      .leftJoinAndSelect('triggers_keywords.trigger', 'trigger')
      .leftJoinAndSelect('trigger.project', 'project')
      .leftJoinAndSelect('project.users', 'users')
      .leftJoinAndSelect('project.account', 'account')
      .leftJoinAndSelect('triggers_keywords.keyword', 'keyword')
      .leftJoinAndSelect('keyword.deviceType', 'deviceType')
      .where(
        `account.id =:accountId and trigger.id =:triggerId and users.id =:userId ${searchQuery}`,
        {
          accountId: payload.accountId,
          triggerId: payload.triggerId,
          userId: payload.userId,
          search: `%${options.search}%`,
        },
      );

    if (options.sortBy) {
      queryBuilder.orderBy(
        getKeyByValue(SortTriggerKeywordsEnum, options.sortBy),
      );
    } else {
      queryBuilder.orderBy('keyword.name', options.sortOrder);
    }
    return paginate(queryBuilder, { page: options.page, limit: options.limit });
  }

  /**
   * Fetches trigger keywords by account ID and a list of keyword IDs.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {IdType[]} ids - An array of unique identifiers for the trigger keywords.
   * @return {Promise<TriggerKeywordEntity[]>} A promise that resolves to an array of trigger keyword entities.
   */
  async getTriggerKeywordsByIdsAndAccountId(
    accountId: IdType,
    ids: IdType[],
  ): Promise<TriggerKeywordEntity[]> {
    return this.createQueryBuilder('triggers_keywords')
      .withDeleted()
      .leftJoinAndSelect('triggers_keywords.trigger', 'trigger')
      .leftJoinAndSelect('trigger.project', 'project')
      .leftJoinAndSelect('project.account', 'account')
      .where('account.id =:accountId and triggers_keywords.id in(:...ids)', {
        accountId,
        ids,
      })
      .getMany();
  }
}
