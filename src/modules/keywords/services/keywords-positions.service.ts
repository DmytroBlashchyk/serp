import { Injectable } from '@nestjs/common';
import { KeywordPositionRepository } from 'modules/keywords/repositories/keyword-position.repository';
import { IdType } from 'modules/common/types/id-type.type';
import { KeywordPositionsInfoType } from 'modules/keywords/types/keyword-positions-info.type';
import { KeywordPositionsInfoRequest } from 'modules/keywords/requests/keyword-positions-info.request';
import { PaginatedKeywordPositionsInfoResponse } from 'modules/keywords/responses/paginated-keyword-positions-info.response';
import { SortOrderEnum } from 'modules/common/enums/sort-order.enum';
import { CsvService } from 'modules/email-reports/services/csv.service';
import { KeywordPositionsForDayRepository } from 'modules/keywords/repositories/keyword-positions-for-day.repository';
import { dateHelper } from 'modules/common/utils/dateHelper';
import { formatGoogleStyleDate } from 'modules/common/utils/formatGoogleStyleDate';
import { KeywordPositionInfoResponseFactory } from 'modules/keywords/factories/keyword-position-info-response.factory';

@Injectable()
export class KeywordsPositionsService {
  constructor(
    private readonly keywordPositionRepository: KeywordPositionRepository,
    private readonly csvService: CsvService,
    private readonly keywordPositionsForDayRepository: KeywordPositionsForDayRepository,
    private readonly keywordPositionInfoResponseFactory: KeywordPositionInfoResponseFactory,
  ) {}

  /**
   * Exports keyword positions information to a CSV file.
   *
   * @param {KeywordPositionsInfoType} payload - The payload containing information about account and keyword IDs.
   * @return {Promise<any[]>} A promise that resolves to an array containing the CSV file data.
   */
  async keywordPositionsInfoExportToCsv(
    payload: KeywordPositionsInfoType,
  ): Promise<{ csvData: any[]; keywordName: string }> {
    const { items } =
      await this.keywordPositionsForDayRepository.getPaginatedKeywordPositions(
        payload.accountId,
        payload.keywordId,
        {
          page: 1,
          limit: 100,
          sortOrder: SortOrderEnum.desc,
          sortBy: undefined,
        },
      );
    const data = await this.keywordPositionInfoResponseFactory.createResponse(
      items,
    );
    const csvData = await this.csvService.generateCsv(data);
    return { csvData, keywordName: items[0].keyword.name };
  }

  /**
   * Retrieves paginated keyword position information for a specific day.
   *
   * @param {KeywordPositionsInfoType} payload - An object containing the account ID and keyword ID.
   * @param {KeywordPositionsInfoRequest} options - Request options for pagination and filtering.
   * @return {Promise<PaginatedKeywordPositionsInfoResponse>} Returns a promise that resolves to a paginated response object containing keyword position information.
   */
  async keywordPositionsInfo(
    payload: KeywordPositionsInfoType,
    options: KeywordPositionsInfoRequest,
  ): Promise<PaginatedKeywordPositionsInfoResponse> {
    const { items, meta } =
      await this.keywordPositionsForDayRepository.getPaginatedKeywordPositions(
        payload.accountId,
        payload.keywordId,
        options,
      );

    return new PaginatedKeywordPositionsInfoResponse({
      items: items.map((item) => {
        return {
          ...item,
          position: +item.position,
          date: dateHelper(item.updatedAt),
          dateFullFormat: formatGoogleStyleDate(item.updatedAt),
          foundUrl: item.url,
        };
      }),
      meta,
    });
  }

  /**
   * Deletes keyword positions based on the provided keyword IDs.
   *
   * @param {IdType[]} ids - The array of keyword IDs whose positions are to be deleted.
   * @return {Promise<void>} A promise that resolves when the delete operation is completed.
   */
  async deleteKeywordPositionsByKeywordIds(ids: IdType[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }
    await this.keywordPositionRepository.deleteKeywordPositionsByKeywordIds(
      ids,
    );
  }
}
