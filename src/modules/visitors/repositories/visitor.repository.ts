import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { VisitorsEntity } from 'modules/visitors/entities/visitors.entity';

/**
 * Repository for managing visitor entities.
 */
@Injectable()
@EntityRepository(VisitorsEntity)
export class VisitorRepository extends BaseRepository<VisitorsEntity> {
  /**
   * Retrieves the visitor information for the given IP address within the last 24 hours.
   *
   * @param {string} ipAddress - The IP address of the visitor.
   * @return {Promise<VisitorsEntity>} A promise that resolves to the visitor entity, or null if no visitor is found within the specified time frame.
   */
  async getLast24HVisitorByIpAddress(
    ipAddress: string,
  ): Promise<VisitorsEntity> {
    return await this.createQueryBuilder('visitor')
      .where(
        `visitor.created_at >= NOW() - INTERVAL '24 hours' and visitor.ipAddress =:ipAddress`,
        { ipAddress },
      )
      .orderBy('visitor.createdAt', 'DESC')
      .getOne();
  }

  /**
   * Creates a daily request entry for a visitor with the specified IP address and keyword count.
   *
   * @param {string} ipAddress - The IP address of the visitor.
   * @param {number} keywordCount - The number of daily requests made by the visitor.
   * @return {Promise<VisitorsEntity>} - A promise that resolves to the created VisitorsEntity object.
   */
  async createVisitorDailyRequests(
    ipAddress: string,
    keywordCount: number,
  ): Promise<VisitorsEntity> {
    const visitor = new VisitorsEntity();
    visitor.ipAddress = ipAddress;
    visitor.numberOfDailyRequests = keywordCount;
    return await this.save({ ...visitor });
  }

  /**
   * Updates the number of daily requests for a given visitor by adding the specified keyword count.
   *
   * @param {VisitorsEntity} visitor - The visitor entity whose daily request count needs to be updated.
   * @param {number} keywordCount - The number of keywords to be added to the visitor's daily request count.
   * @return {Promise<VisitorsEntity>} The updated visitor entity with the new daily request count.
   */
  async updateVisitorDailyRequests(
    visitor: VisitorsEntity,
    keywordCount: number,
  ): Promise<VisitorsEntity> {
    visitor.numberOfDailyRequests =
      Number(visitor.numberOfDailyRequests) + keywordCount;
    return await this.save({ ...visitor });
  }
}
