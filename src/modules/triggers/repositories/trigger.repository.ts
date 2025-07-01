import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { TriggerEntity } from 'modules/triggers/entities/trigger.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { TriggerTypeEnum } from 'modules/triggers/enums/trigger-type.enum';
import { IdType } from 'modules/common/types/id-type.type';
import { GeTriggersByProjectRequest } from 'modules/triggers/requests/ge-triggers-by-project.request';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { getKeyByValue } from 'modules/common/utils/get-enum-value-by-key';
import { SortTriggersByProjectEnum } from 'modules/triggers/enums/sort-triggers-by-project.enum';
import { TriggerRuleEnum } from 'modules/triggers/enums/trigger-rule.enum';

@Injectable()
@EntityRepository(TriggerEntity)
export class TriggerRepository extends BaseRepository<TriggerEntity> {
  /**
   * Retrieves a unique trigger entity associated with a specific project,
   * based on the provided type, rule, and threshold.
   *
   * @param {IdType} projectId - The unique identifier for the project.
   * @param {TriggerTypeEnum} typeName - The type name of the trigger.
   * @param {TriggerRuleEnum} ruleName - The rule name of the trigger.
   * @param {number} threshold - The threshold value for the trigger.
   * @return {Promise<TriggerEntity>} A promise that resolves to the unique trigger entity.
   */
  async getAUniqueTriggerByProject(
    projectId: IdType,
    typeName: TriggerTypeEnum,
    ruleName: TriggerRuleEnum,
    threshold: number,
  ): Promise<TriggerEntity> {
    return this.createQueryBuilder('triggers')
      .leftJoin('triggers.rule', 'rule')
      .leftJoin('triggers.project', 'project')
      .leftJoin('triggers.type', 'type')
      .where(
        'project.id = :projectId and type.name = :typeName and rule.name =:ruleName and triggers.threshold =:threshold',
        { projectId, typeName, ruleName, threshold },
      )
      .getOne();
  }

  /**
   * Retrieves the triggers associated with a specific project.
   *
   * @param {IdType} projectId - The unique identifier of the project.
   * @return {Promise<TriggerEntity[]>} A promise that resolves to an array of trigger entities.
   */
  async getProjectTriggers(projectId: IdType): Promise<TriggerEntity[]> {
    return this.createQueryBuilder('triggers')
      .select('triggers.id')
      .leftJoin('triggers.project', 'project')
      .where('project.id =:projectId', { projectId })
      .getMany();
  }

  /**
   * Retrieves a trigger entity along with its related entities based on the given trigger ID.
   * The method fetches the associated type, rule, recipients, and various project details.
   *
   * @param {IdType} id - The unique identifier of the trigger.
   * @return {Promise<TriggerEntity>} A promise that resolves to the trigger entity with its relations.
   */
  async getTriggersWithRelations(id: IdType): Promise<TriggerEntity> {
    return this.createQueryBuilder('triggers')
      .withDeleted()
      .leftJoinAndSelect('triggers.type', 'type')
      .leftJoinAndSelect('triggers.rule', 'rule')
      .leftJoinAndSelect('triggers.recipients', 'recipients')
      .leftJoinAndSelect('triggers.project', 'project')
      .leftJoinAndSelect('project.searchEngine', 'searchEngine')
      .leftJoinAndSelect('project.account', 'account')
      .leftJoinAndSelect('project.language', 'language')
      .leftJoinAndSelect('project.region', 'region')
      .leftJoinAndSelect('project.location', 'location')
      .where('triggers.id =:id', { id })
      .getOne();
  }

  /**
   * Retrieves a trigger entity by its ID and associated account ID.
   *
   * @param {IdType} id - The ID of the trigger to retrieve.
   * @param {IdType} accountId - The ID of the account associated with the trigger.
   * @param {IdType} userId - The ID of the user associated with the account.
   * @return {Promise<TriggerEntity>} A promise that resolves to the trigger entity with the specified ID and account ID.
   */
  async getTriggerByIdAndAccountId(
    id: IdType,
    accountId: IdType,
    userId: IdType,
  ): Promise<TriggerEntity> {
    return this.createQueryBuilder('triggers')
      .withDeleted()
      .leftJoinAndSelect('triggers.type', 'type')
      .leftJoinAndSelect('triggers.recipients', 'recipients')
      .leftJoinAndSelect('triggers.rule', 'rule')
      .leftJoinAndSelect('triggers.project', 'project')
      .leftJoin('project.users', 'users')
      .leftJoinAndSelect('project.account', 'account')
      .leftJoinAndSelect('triggers.triggerKeywords', 'triggerKeywords')
      .leftJoinAndSelect('triggerKeywords.keyword', 'keyword')
      .leftJoinAndSelect('keyword.deviceType', 'deviceType')
      .where(
        'account.id =:accountId and triggers.id =:id and users.id =:userId',
        { accountId, id, userId },
      )
      .getOne();
  }

  /**
   * Retrieves a list of trigger entities filtered by type and IDs associated with a particular account.
   *
   * @param {TriggerTypeEnum} type - The type of trigger to filter by.
   * @param {IdType[]} ids - The list of IDs to filter the triggers.
   * @param {IdType} accountId - The ID of the account to which the triggers belong.
   * @return {Promise<TriggerEntity[]>} A promise that resolves to an array of TriggerEntity objects.
   */
  async getTriggersByTypeAndIds(
    type: TriggerTypeEnum,
    ids: IdType[],
    accountId: IdType,
  ): Promise<TriggerEntity[]> {
    return this.createQueryBuilder('triggers')
      .withDeleted()
      .leftJoinAndSelect('triggers.type', 'type')
      .leftJoinAndSelect('triggers.triggerKeywords', 'triggerKeywords')
      .leftJoinAndSelect('triggers.project', 'project')
      .leftJoinAndSelect('project.account', 'account')
      .where(
        'account.id =:accountId and triggers.id in(:...ids) and type.name =:typeName',
        { accountId, ids, typeName: type },
      )
      .getMany();
  }

  /**
   * Retrieves a paginated list of triggers based on the specified parameters.
   *
   * @param {TriggerTypeEnum} type - The type of triggers to filter by.
   * @param {IdType} accountId - The ID of the account to filter triggers by.
   * @param {IdType} userId - The ID of the user to filter triggers by.
   * @param {GeTriggersByProjectRequest} options - Additional options for pagination and sorting.
   *
   * @return {Promise<Pagination<TriggerEntity & { keywordCount: number }>>} A promise that resolves to a paginated list of triggers along with their keyword count.
   */
  async paginatedTriggers(
    type: TriggerTypeEnum,
    accountId: IdType,
    userId: IdType,
    options: GeTriggersByProjectRequest,
  ): Promise<Pagination<TriggerEntity & { keywordCount: number }>> {
    const queryBuilder = this.createQueryBuilder('triggers')
      .withDeleted()
      .leftJoinAndSelect('triggers.type', 'type')
      .leftJoinAndSelect('triggers.project', 'project')
      .leftJoin('project.users', 'users')
      .leftJoinAndSelect('triggers.rule', 'rule')
      .leftJoinAndSelect('project.account', 'account')
      .where(
        'account.id =:accountId and type.name =:typeName and users.id =:userId',
        {
          accountId,
          userId,
          typeName: type,
        },
      );

    if (options.sortBy) {
      queryBuilder.orderBy(
        getKeyByValue(SortTriggersByProjectEnum, options.sortBy),
      );
    } else {
      queryBuilder.orderBy('project.project_name', options.sortOrder);
    }
    return paginate(queryBuilder, {
      page: options.page,
      limit: options.limit,
    }) as Promise<Pagination<TriggerEntity & { keywordCount: number }>>;
  }
}
