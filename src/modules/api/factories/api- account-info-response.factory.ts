import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { ApiAccountInfoType } from 'modules/api/types/api-account-info.type';
import { ApiAccountInfoResponse } from 'modules/api/response/api-account-info.response';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiAccountInfoResponseFactory extends BaseResponseFactory<
  ApiAccountInfoType,
  ApiAccountInfoResponse
> {
  /**
   * Creates a response object containing the account information.
   *
   * @param {ApiAccountInfoType} entity - An object representing the account information.
   * @param {Record<string, unknown>} [options] - Optional settings to customize the response.
   * @return {Promise<ApiAccountInfoResponse>|ApiAccountInfoResponse} A response object containing the formatted account information.
   */
  createResponse(
    entity: ApiAccountInfoType,
    options?: Record<string, unknown>,
  ): Promise<ApiAccountInfoResponse> | ApiAccountInfoResponse {
    return new ApiAccountInfoResponse({
      id: entity.id,
      companyName: entity.company_name,
      companyUrl: entity.company_url,
      tagline: entity.tagline,
      facebookLink: entity.facebook_link,
      linkedinLink: entity.linkedin_link,
      sharedLinksCount: entity.shared_links_count,
      emailReportsCount: entity.email_reports_count,
      keywordCount: entity.keyword_count,
      twitterLink: entity.twitter_link,
      projectNumber: entity.project_number,
      numberOfAvailableKeywordUpdates: 0,
    });
  }
}
