import { HttpModule, Module } from '@nestjs/common';
import { ValueSerpService } from 'modules/additional-services/services/value-serp.service';
import { CommonModule } from 'modules/common/common.module';
import { CacheModule } from 'modules/cache/cache.module';
import { SerpRankCheckerController } from 'modules/additional-services/controllers/serp-rank-checker.controller';
import { SerperDevService } from 'modules/additional-services/services/serper-dev.service';
import { CountriesModule } from 'modules/countries/countries.module';
import { DataForSeoService } from 'modules/additional-services/services/data-for-seo.service';
import { VisitorsModule } from 'modules/visitors/visitors.module';
import { LoggingModule } from 'modules/logging/logging.module';
import { GoogleAdsService } from 'modules/additional-services/services/google-ads.service';
import { GoogleAdsController } from 'modules/additional-services/controllers/google-ads.controller';

/**
 * AdditionalServicesModule is responsible for encapsulating various services
 * and controllers related to additional services functionalities. It imports
 * several other modules, including HttpModule, CacheModule, CommonModule,
 * CountriesModule, VisitorsModule, and LoggingModule to provide required
 * dependencies. The module also provides a set of services such as
 * ValueSerpService, SerperDevService, DataForSeoService, and GoogleAdsService.
 * It exports ValueSerpService and DataForSeoService to make them available
 * for other modules. Additionally, it defines two controllers,
 * SerpRankCheckerController and GoogleAdsController, to handle incoming HTTP
 * requests and execute business logic related to their respective domains.
 */
@Module({
  imports: [
    HttpModule,
    CacheModule,
    CommonModule,
    CountriesModule,
    VisitorsModule,
    LoggingModule,
  ],
  providers: [
    ValueSerpService,
    SerperDevService,
    DataForSeoService,
    GoogleAdsService,
  ],
  exports: [ValueSerpService, DataForSeoService],
  controllers: [SerpRankCheckerController, GoogleAdsController],
})
export class AdditionalServicesModule {}
