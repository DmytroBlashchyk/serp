import { BadRequestException, Injectable } from '@nestjs/common';

// import { GoogleAdsApi } from 'google-ads-api';
// import { services } from 'google-ads-api/build/src/protos';
// import { ConfigService } from '@nestjs/config';
// import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';

@Injectable()
export class GoogleAdsService {
  // private readonly client: GoogleAdsApi;
  // constructor(private readonly configService: ConfigService) {
  //   this.client = new GoogleAdsApi({
  //     client_id: configService.get(ConfigEnvEnum.GOOGLE_CLIENT_ID),
  //     client_secret: configService.get(ConfigEnvEnum.GOOGLE_SECRET),
  //     developer_token: configService.get(ConfigEnvEnum.GOOGLE_DEVELOPER_TOKEN),
  //   });
  // }
  // async testRequest(
  //   search: string,
  // ): Promise<services.GenerateKeywordHistoricalMetricsResponse> {
  //   let customer;
  //   try {
  //     customer = this.client.Customer({
  //       customer_id: this.configService.get(ConfigEnvEnum.GOOGLE_CUSTOMER_ID),
  //       refresh_token: this.configService.get(
  //         ConfigEnvEnum.GOOGLE_REFFRESH_TOKEN,
  //       ),
  //     });
  //   } catch (e) {
  //     return;
  //   }
  //   if (customer) {
  //     try {
  //       const result =
  //         await customer.keywordPlanIdeas.generateKeywordHistoricalMetrics(
  //           new services.GenerateKeywordHistoricalMetricsRequest({
  //             customer_id: this.configService.get(
  //               ConfigEnvEnum.GOOGLE_CUSTOMER_ID,
  //             ),
  //             keywords: [search],
  //           }),
  //         );
  //       return result;
  //     } catch (error) {
  //       throw new BadRequestException(error);
  //     }
  //   }
  // }
}
