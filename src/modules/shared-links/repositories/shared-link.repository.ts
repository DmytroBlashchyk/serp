import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { SharedLinkEntity } from 'modules/shared-links/entities/shared-link.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';
import { GetAllSharedLinksRequest } from 'modules/shared-links/requests/get-all-shared-links.request';
import { getKeyByValue } from 'modules/common/utils/get-enum-value-by-key';
import { SortSharedLinksEnum } from 'modules/shared-links/enums/sort-shared-links.enum';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
@EntityRepository(SharedLinkEntity)
export class SharedLinkRepository extends BaseRepository<SharedLinkEntity> {
  /**
   * Retrieves shared links along with their associated projects.
   *
   * @param {IdType[]} sharedLinkIds - An array of shared link IDs to retrieve the associated projects for.
   * @return {Promise<SharedLinkEntity[]>} A promise that resolves to an array of SharedLinkEntity objects, each including their associated projects.
   */
  async getSharedLinksWithProjects(
    sharedLinkIds: IdType[],
  ): Promise<SharedLinkEntity[]> {
    return this.createQueryBuilder('shared_links')
      .leftJoinAndSelect('shared_links.projects', 'projects')
      .where('shared_links.id in(:...sharedLinkIds)', { sharedLinkIds })
      .getMany();
  }

  /**
   * Fetches a shared link by its ID and associated account ID.
   *
   * @param {IdType} linkId - The unique identifier of the shared link.
   * @param {IdType} accountId - The unique identifier of the account.
   * @return {Promise<Object>} - A promise that resolves to the shared link object.
   */
  async sharedLinkByLinkAndAccountId(linkId: IdType, accountId: IdType) {
    return this.createQueryBuilder('shared_links')
      .leftJoinAndSelect('shared_links.type', 'type')
      .leftJoinAndSelect('shared_links.projects', 'projects')
      .leftJoinAndSelect('shared_links.settings', 'settings')
      .where(
        'shared_links.id =:linkId and shared_links.account_id =:accountId',
        { linkId, accountId },
      )
      .getOne();
  }
  /**
   * Retrieves a shared link entity by link and includes associated account and settings.
   *
   * @param {string} link - The unique identifier of the shared link.
   * @return {Promise<SharedLinkEntity>} A promise that resolves to the shared link entity with related account and settings included.
   */
  async sharedLinkByLinkWithAccount(link: string): Promise<SharedLinkEntity> {
    return this.createQueryBuilder('shared_links')
      .withDeleted()
      .leftJoinAndSelect('shared_links.settings', 'settings')
      .leftJoinAndSelect('shared_links.account', 'account')
      .leftJoinAndSelect('account.companyLogo', 'companyLogo')
      .where('shared_links.link =:link', { link })
      .getOne();
  }

  /**
   * Fetches a shared link entity by its link.
   *
   * @param {string} link - The unique link associated with the shared link entity.
   * @return {Promise<SharedLinkEntity>} The shared link entity matching the provided link.
   */
  async sharedLinkByLink(link: string): Promise<SharedLinkEntity> {
    return this.createQueryBuilder('shared_links')
      .withDeleted()
      .leftJoinAndSelect('shared_links.account', 'account')
      .leftJoinAndSelect('account.owner', 'owner')
      .leftJoinAndSelect('shared_links.settings', 'settings')
      .where('shared_links.link =:link', { link })
      .getOne();
  }

  /**
   * Retrieves shared link entities by their IDs and associated account ID.
   *
   * @param {IdType[]} sharedLinkIds - An array of shared link IDs to retrieve.
   * @param {IdType} accountId - The ID of the account associated with the shared links.
   * @return {Promise<SharedLinkEntity[]>} - A promise that resolves to an array of shared link entities.
   */
  async getSharedLinksByIdsAndAccountId(
    sharedLinkIds: IdType[],
    accountId: IdType,
  ): Promise<SharedLinkEntity[]> {
    return this.createQueryBuilder('shared_links')
      .leftJoinAndSelect('shared_links.settings', 'settings')
      .where(
        'shared_links.id in(:...sharedLinkIds) and shared_links.account_id =:accountId',
        { sharedLinkIds, accountId },
      )
      .getMany();
  }

  /**
   * Retrieves a shared link entity by its ID and account ID.
   *
   * @param {IdType} linkId - The ID of the shared link.
   * @param {IdType} accountId - The ID of the account associated with the shared link.
   * @return {Promise<SharedLinkEntity>} A promise that resolves to the shared link entity.
   */
  async getSharedLinkByIdAndAccountId(
    linkId: IdType,
    accountId: IdType,
  ): Promise<SharedLinkEntity> {
    return this.createQueryBuilder('shared_links')
      .leftJoinAndSelect('shared_links.settings', 'settings')
      .leftJoinAndSelect('shared_links.projects', 'projects')
      .leftJoinAndSelect('shared_links.type', 'type')
      .where(
        'shared_links.id =:linkId and shared_links.account_id =:accountId',
        { linkId, accountId },
      )
      .getOne();
  }
  /**
   * Retrieves a paginated list of shared links associated with a given account based on specified options.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {GetAllSharedLinksRequest} options - The options for retrieving shared links.
   * @param {string} [options.search] - The search term to filter shared links by project name.
   * @param {string} [options.sortBy] - The criterion to sort the shared links by.
   * @param {string} [options.sortOrder] - The order to sort the shared links in (e.g., 'ASC', 'DESC').
   * @param {number} options.page - The page number for pagination.
   * @param {number} options.limit - The number of items per page for pagination.
   * @return {Promise<Pagination<SharedLinkEntity>>} A promise resolving to a paginated list of shared links.
   */
  async paginatedSharedLinks(
    accountId: IdType,
    options: GetAllSharedLinksRequest,
  ): Promise<Pagination<SharedLinkEntity>> {
    const querySearch = options.search
      ? ` AND projects.projectName ILike(:search)`
      : '';
    const queryBuilder = this.createQueryBuilder('shared_links')
      .leftJoinAndSelect('shared_links.type', 'type')
      .leftJoin('shared_links.projects', 'projects')
      .where(`shared_links.account_id =:accountId ${querySearch}`, {
        accountId,
        search: options.search ? `%${options.search}%` : '%%',
      });
    if (options.sortBy) {
      queryBuilder.orderBy(
        getKeyByValue(SortSharedLinksEnum, options.sortBy),
        options.sortOrder,
      );
    } else {
      queryBuilder.orderBy('shared_links.id', 'ASC');
    }
    queryBuilder.groupBy('shared_links.id, type.id');
    return paginate(queryBuilder, { page: options.page, limit: options.limit });
  }
}
