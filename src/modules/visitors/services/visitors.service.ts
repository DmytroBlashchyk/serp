import { ForbiddenException, Injectable } from '@nestjs/common';
import { VisitorRepository } from 'modules/visitors/repositories/visitor.repository';
import { VisitorsEntity } from 'modules/visitors/entities/visitors.entity';
import { VisitorRequestsLimitResponse } from 'modules/visitors/responses/visitor-requests-limit.response';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VisitorsService {
  constructor(
    private readonly visitorRepository: VisitorRepository,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Retrieves the visitor data from the last 24 hours based on the provided IP address.
   *
   * @param {string} ipAddress - The IP address of the visitor to retrieve.
   * @return {Promise<VisitorsEntity>} A promise that resolves to the visitor entity corresponding to the given IP address.
   */
  async getVisitorByIpAddress(ipAddress: string): Promise<VisitorsEntity> {
    return await this.visitorRepository.getLast24HVisitorByIpAddress(ipAddress);
  }

  /**
   * Retrieves the request limit details for a specific IP address within a 24-hour period.
   *
   * @param {string} ipAddress - The IP address of the visitor.
   * @return {Promise<VisitorRequestsLimitResponse>} A promise that resolves to an object containing the remaining request limit.
   */
  async getVisitorRequestsLimitByIpAddress(
    ipAddress: string,
  ): Promise<VisitorRequestsLimitResponse> {
    const visitor = await this.visitorRepository.getLast24HVisitorByIpAddress(
      ipAddress,
    );

    let numberOfLeftRequests = null;
    if (visitor) {
      numberOfLeftRequests =
        this.configService.get(
          ConfigEnvEnum.FREE_REQUESTS_LIMIT_FOR_SERP_RANK_CHECKER,
        ) - Number(visitor.numberOfDailyRequests);
    }

    return new VisitorRequestsLimitResponse({
      freeRequestsLimit: numberOfLeftRequests,
    });
  }

  /**
   * Checks if the visitor has reached the daily request limit.
   *
   * @param {VisitorsEntity} visitor - The visitor entity containing request data.
   * @return {Promise<void>} A promise that resolves if the check passes, or throws an exception if the limit is reached.
   */
  async checkVisitorDailyRequests(visitor: VisitorsEntity): Promise<void> {
    if (
      Number(visitor.numberOfDailyRequests) ===
      this.configService.get(
        ConfigEnvEnum.FREE_REQUESTS_LIMIT_FOR_SERP_RANK_CHECKER,
      )
    ) {
      throw new ForbiddenException(
        'The search limit has been reached for today',
      );
    }
  }

  /**
   * Updates the daily requests count for a visitor. If the visitor is undefined, it creates a new visitor
   * record with the provided IP address and keyword count. If the visitor's daily request count is below
   * the configured limit, it updates the existing visitor record.
   *
   * @param {VisitorsEntity | undefined} visitor - The visitor entity to update or undefined to create a new visitor record.
   * @param {string} ipAddress - The IP address of the visitor.
   * @param {number} keywordCount - The count of keywords for the visitor's request.
   * @return {Promise<VisitorsEntity>} - A promise that resolves to the updated or newly created visitor entity.
   */
  async updateVisitorDailyRequests(
    visitor: VisitorsEntity | undefined,
    ipAddress: string,
    keywordCount: number,
  ): Promise<VisitorsEntity> {
    if (!visitor) {
      return await this.visitorRepository.createVisitorDailyRequests(
        ipAddress,
        keywordCount,
      );
    } else if (
      visitor.numberOfDailyRequests <
      this.configService.get(
        ConfigEnvEnum.FREE_REQUESTS_LIMIT_FOR_SERP_RANK_CHECKER,
      )
    ) {
      return await this.visitorRepository.updateVisitorDailyRequests(
        visitor,
        keywordCount,
      );
    }
  }
}
