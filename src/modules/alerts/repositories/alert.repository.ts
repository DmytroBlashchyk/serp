import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { AlertEntity } from 'modules/alerts/entities/alert.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';
import { GetAlertsByProjectRequest } from 'modules/alerts/requests/get-alerts-by-project.request';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { getKeyByValue } from 'modules/common/utils/get-enum-value-by-key';
import { TriggerTypeEnum } from 'modules/triggers/enums/trigger-type.enum';
import { SortAlertsByProjectEnum } from 'modules/alerts/enums/sort-alerts-by-project.enum';

@Injectable()
@EntityRepository(AlertEntity)
export class AlertRepository extends BaseRepository<AlertEntity> {
  /**
   * Retrieves the alert entity by alert ID and project type.
   *
   * @param {IdType} alertId - The ID of the alert to retrieve.
   * @return {Promise<AlertEntity>} The alert entity associated with the specified alert ID and project type.
   */
  async getAlertTypeByProject(alertId: IdType): Promise<AlertEntity> {
    return this.createQueryBuilder('alerts')
      .leftJoinAndSelect('alerts.trigger', 'trigger')
      .leftJoinAndSelect('trigger.type', 'type')
      .leftJoinAndSelect('alerts.views', 'views')
      .leftJoinAndSelect('views.user', 'user')
      .where('alerts.id =:alertId and type.name =:typeName', {
        alertId,
        typeName: TriggerTypeEnum.ByProject,
      })
      .getOne();
  }

  /**
   * Retrieves an alert with detailed information including keyword count and associations.
   *
   * @param {IdType} accountId - The ID of the account to which the alert belongs.
   * @param {IdType} alertId - The ID of the alert to be retrieved.
   * @return {Promise<AlertEntity & { keywordCount: number }>} A promise that resolves to the detailed alert entity with keyword count included.
   */
  async getAlert(
    accountId: IdType,
    alertId: IdType,
  ): Promise<AlertEntity & { keywordCount: number }> {
    return this.createQueryBuilder('alerts')
      .withDeleted()
      .leftJoinAndSelect('alerts.trigger', 'trigger')
      .leftJoinAndSelect('alerts.alertKeywords', 'alertKeywords')
      .leftJoinAndSelect('alertKeywords.views', 'views')
      .leftJoinAndSelect('views.user', 'user')
      .leftJoinAndSelect('trigger.project', 'project')
      .leftJoinAndSelect('trigger.rule', 'rule')
      .leftJoinAndSelect('project.account', 'account')
      .loadRelationCountAndMap('alerts.keywordCount', 'alerts.alertKeywords')
      .where('alerts.id =:alertId and account.id =:accountId', {
        alertId,
        accountId,
      })
      .getOne() as Promise<AlertEntity & { keywordCount: number }>;
  }

  /**
   * Fetches and verifies if the alert has been viewed by the specified user.
   *
   * @param {IdType} userId - The unique identifier of the user.
   * @param {IdType} alertId - The unique identifier of the alert.
   * @return {Promise<boolean>} - Returns true if the user has viewed the alert, otherwise false.
   */
  async viewInformation(userId: IdType, alertId: IdType): Promise<boolean> {
    const result = await this.query(
      `
select
CASE WHEN alerts_view.user_id = $1 THEN 1 ELSE 0 END as view
from alerts
left join alerts_view on alerts.id = alerts_view.alert_id
where alerts.id = $2
group by alerts.id, alerts_view.user_id, alerts_view.alert_id`,
      [userId, alertId],
    );
    return result[0].view ?? false;
  }

  /**
   * Paginates alerts by project based on the given account ID and options.
   *
   * @param {IdType} accountId - The ID of the account to filter the alerts.
   * @param {GetAlertsByProjectRequest} options - The options for pagination and filtering, including search query, project IDs, sorting, page, and limit.
   * @return {Promise<Pagination<AlertEntity & { alertKeywordsCount: number }>>} - A promise that resolves to a paginated list of alerts with the count of alert keywords.
   */
  async paginateAlertsByProject(
    accountId: IdType,
    options: GetAlertsByProjectRequest,
  ): Promise<Pagination<AlertEntity & { alertKeywordsCount: number }>> {
    const searchQuery = options.search
      ? 'and project.projectName ILike(:search)'
      : '';
    const queryBuilder = this.createQueryBuilder('alerts')
      .withDeleted()
      .leftJoinAndSelect('alerts.trigger', 'trigger')
      .loadRelationCountAndMap(
        'alerts.alertKeywordsCount',
        'alerts.alertKeywords',
      )
      .leftJoinAndSelect('trigger.type', 'type')
      .leftJoinAndSelect('trigger.project', 'project')
      .leftJoinAndSelect('project.account', 'account')
      .leftJoinAndSelect('trigger.rule', 'rule')
      .where(`account.id =:accountId and type.name =:typeName ${searchQuery}`, {
        accountId,
        typeName: TriggerTypeEnum.ByProject,
        search: `%${options.search}%`,
      });

    if (options.projectIds && options.projectIds.length > 0) {
      queryBuilder.andWhere('project.id in(:...projectIds)', {
        projectIds: options.projectIds,
      });
    }
    if (options.sortBy) {
      queryBuilder.orderBy(
        getKeyByValue(SortAlertsByProjectEnum, options.sortBy),
        options.sortOrder,
      );
    } else {
      queryBuilder.orderBy('alerts.createdAt', options.sortOrder);
    }

    return paginate(queryBuilder, {
      page: options.page,
      limit: options.limit,
    }) as Promise<Pagination<AlertEntity & { alertKeywordsCount: number }>>;
  }
}
