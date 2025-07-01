import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { DataForPdfResponse } from 'modules/email-reports/responses/data-for-pdf.response';
import { Injectable } from '@nestjs/common';
import { ProjectInfoResponse } from 'modules/shared-links/responses/project-info.response';
import { DataForPdfResponseFactoryType } from 'modules/email-reports/types/data-for-pdf-response-factory.type';

@Injectable()
export class DataForPdfResponseFactory extends BaseResponseFactory<
  DataForPdfResponseFactoryType,
  DataForPdfResponse
> {
  /**
   * Generates a DataForPdfResponse based on the provided entity.
   *
   * @param {DataForPdfResponseFactoryType} entity - The data entity containing all necessary information for generating the response.
   * @return {Promise<DataForPdfResponse>} A promise that resolves to a DataForPdfResponse object constructed from the provided entity.
   */
  async createResponse(
    entity: DataForPdfResponseFactoryType,
  ): Promise<DataForPdfResponse> {
    return new DataForPdfResponse({
      projectInfo: new ProjectInfoResponse({
        ...entity.project,
        deviceType: entity.project.deviceType,
      }),
      overview: entity.overview,
      improvedVsDeclined: entity.improvedVsDeclined,
      keywordTrends: entity.keywordTrends,
      projectPerformance: entity.projectPerformance,
      brandingInfo: entity.brandingInfo,
      accountSettings: entity.accountSettings,
    });
  }
}
