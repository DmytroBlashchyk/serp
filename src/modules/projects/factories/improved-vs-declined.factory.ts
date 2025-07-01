import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { ImprovedVsDeclinedResponse } from 'modules/projects/responses/improved-vs-declined.response';
import { Injectable } from '@nestjs/common';
import { ImprovedVsDeclinedArrayResponse } from 'modules/projects/responses/improved-vs-declined-array.response';
import { GetStatisticsType } from 'modules/projects/types/get-statistics.type';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';

@Injectable()
export class ImprovedVsDeclinedFactory extends BaseResponseFactory<
  GetStatisticsType[],
  ImprovedVsDeclinedArrayResponse
> {
  /**
   * Generates an improved versus declined response array from the given statistics entity.
   *
   * @param {GetStatisticsType[]} entity - The statistics data to be processed.
   * @param {Record<string, unknown>} [options] - Optional filters and parameters for response generation.
   * @param {BooleanEnum} [options.improvedFilter] - Filter flag for including improved data.
   * @param {BooleanEnum} [options.declinedFilter] - Filter flag for including declined data.
   * @param {BooleanEnum} [options.lostFilter] - Filter flag for including lost data.
   * @param {BooleanEnum} [options.noChange] - Filter flag for including no change data.
   * @return {Promise<ImprovedVsDeclinedArrayResponse>} - The processed response containing the improved versus declined data.
   */
  async createResponse(
    entity: GetStatisticsType[],
    options?: Record<string, unknown>,
  ): Promise<ImprovedVsDeclinedArrayResponse> {
    const improvedFilter = options.improvedFilter;
    const declinedFilter = options.declinedFilter;
    const lostFilter = options.lostFilter;
    const noChange = options.noChange;
    return new ImprovedVsDeclinedArrayResponse({
      items: entity.map(
        (item) =>
          new ImprovedVsDeclinedResponse({
            date: item.date,
            improved:
              improvedFilter === BooleanEnum.TRUE ? item.improved : undefined,
            declined:
              declinedFilter === BooleanEnum.TRUE ? item.declined : undefined,
            lost: lostFilter === BooleanEnum.TRUE ? item.lost : undefined,
            noChange:
              noChange === BooleanEnum.TRUE ? item.no_change : undefined,
          }),
      ),
    });
  }
}
