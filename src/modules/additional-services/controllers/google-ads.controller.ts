import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GoogleAdsService } from 'modules/additional-services/services/google-ads.service';
import { services } from 'google-ads-api/build/src/protos';
import { TestRequest } from 'modules/additional-services/requests/test.request';

@Controller('google-ads')
export class GoogleAdsController {
  constructor(private readonly googleAdsService: GoogleAdsService) {}

  // @Get()
  // test(
  //   @Query() body: TestRequest,
  // ): Promise<services.GenerateKeywordHistoricalMetricsResponse> {
  //   return this.googleAdsService.testRequest(body.search);
  // }
}
