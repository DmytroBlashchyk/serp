import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { AlertKeywordEntity } from 'modules/alerts/entities/alert-keyword.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';
import { GetAlertsByKeywordsRequest } from 'modules/alerts/requests/get-alerts-by-keywords.request';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { TriggerTypeEnum } from 'modules/triggers/enums/trigger-type.enum';
import { getKeyByValue } from 'modules/common/utils/get-enum-value-by-key';
import { SortAlertsByKeywordsEnum } from 'modules/alerts/enums/sort-alerts-by-keywords.enum';
import { AlertKeywordsType } from 'modules/alerts/types/alert-keywords.type';
import { GetAlertKeywordsRequest } from 'modules/alerts/requests/get-alert-keywords.request';

@Injectable()
@EntityRepository(AlertKeywordEntity)
export class AlertKeywordRepository extends BaseRepository<AlertKeywordEntity> {
  /**
   * Retrieves an alert keyword type by keywords using the provided ID.
   *
   * @param {IdType} id - The ID of the alert keyword entry to retrieve.
   * @return {Promise<AlertKeywordEntity>} A promise that resolves to the alert keyword entity with the specified ID.
   */
  async getAlertKeywordTypeByKeywordsById(
    id: IdType,
  ): Promise<AlertKeywordEntity> {
    return this.createQueryBuilder('alerts_keywords')
      .leftJoinAndSelect('alerts_keywords.views', 'views')
      .leftJoinAndSelect('views.user', 'user')
      .leftJoinAndSelect('alerts_keywords.alert', 'alert')
      .leftJoinAndSelect('alert.trigger', 'trigger')
      .leftJoinAndSelect('trigger.type', 'type')
      .where('alerts_keywords.id =:id and type.name =:typeName', {
        id,
        typeName: TriggerTypeEnum.ByKeywords,
      })
      .getOne();
  }
  /**
   * Paginate the alert keywords based on the provided payload and options.
   *
   * @param {AlertKeywordsType} payload - The payload containing the alert identifiers.
   * @param {GetAlertKeywordsRequest} options - The pagination options including page and limit.
   * @return {Promise<Pagination<AlertKeywordEntity>>} - A promise that resolves to a pagination object containing alert keywords.
   */
  async paginateAlertKeywords(
    payload: AlertKeywordsType,
    options: GetAlertKeywordsRequest,
  ): Promise<Pagination<AlertKeywordEntity>> {
    const queryBuilder = this.createQueryBuilder('alerts_keywords')
      .leftJoinAndSelect('alerts_keywords.alert', 'alert')
      .leftJoinAndSelect('alerts_keywords.keyword', 'keyword')
      .leftJoinAndSelect('keyword.deviceType', 'deviceType')
      .leftJoinAndSelect(
        'alerts_keywords.keywordPositionsForDay',
        'keywordPositionsForDay',
      )
      .where('alert.id =:alertId', { alertId: payload.alertId });
    return paginate(queryBuilder, { page: options.page, limit: options.limit });
  }

  /**
   * Paginates alerts based on the provided keywords and other filtering options.
   *
   * @param {IdType} accountId - The ID of the account for which the alerts are to be fetched.
   * @param {GetAlertsByKeywordsRequest} options - An object containing the filtering and sorting options for the alerts.
   * @return {Promise<Pagination<AlertKeywordEntity>>} A promise that resolves to a paginated result of alert keyword entities.
   */
  async paginateAlertsByKeywords(
    accountId: IdType,
    options: GetAlertsByKeywordsRequest,
  ): Promise<Pagination<AlertKeywordEntity>> {
    const searchQuery = options.search
      ? ` and keyword.name ILike(:search)`
      : '';
    const queryBuilder = this.createQueryBuilder('alerts_keywords')
      .withDeleted()
      .leftJoinAndSelect('alerts_keywords.alert', 'alert')
      .leftJoinAndSelect(
        'alerts_keywords.keywordPositionsForDay',
        'keywordPositionsForDay',
      )
      .leftJoinAndSelect('alerts_keywords.views', 'views')
      .leftJoinAndSelect('views.user', 'user')
      .leftJoinAndSelect('alerts_keywords.keyword', 'keyword')
      .leftJoinAndSelect('keyword.deviceType', 'deviceType')
      .leftJoinAndSelect('alert.trigger', 'trigger')
      .leftJoinAndSelect('trigger.type', 'type')
      .leftJoinAndSelect('trigger.rule', 'rule')
      .leftJoinAndSelect('trigger.project', 'project')
      .leftJoin('project.account', 'account')
      .where(`account.id =:accountId and type.name =:typeName ${searchQuery}`, {
        accountId,
        typeName: TriggerTypeEnum.ByKeywords,
        search: options.search ? `%${options.search}%` : '%%',
      });
    if (options.projectIds && options.projectIds.length > 0) {
      queryBuilder.andWhere('project.id in(:...projectIds)', {
        projectIds: options.projectIds,
      });
    }
    if (options.sortBy) {
      queryBuilder.orderBy(
        getKeyByValue(SortAlertsByKeywordsEnum, options.sortBy),
        options.sortOrder,
      );
    } else {
      queryBuilder.orderBy('alerts_keywords.createdAt', options.sortOrder);
    }

    return paginate(queryBuilder, { page: options.page, limit: options.limit });
  }
}
