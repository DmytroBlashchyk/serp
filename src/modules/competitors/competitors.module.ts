import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetitorRepository } from 'modules/competitors/repositories/competitor.repository';
import { CompetitorsService } from 'modules/competitors/services/competitors.service';
import { CompetitorKeywordPositionRepository } from 'modules/competitors/repositories/competitor-keyword-position.repository';
import { SearchResultRepository } from 'modules/keywords/repositories/search-result.repository';
import { CacheModule } from 'modules/cache/cache.module';
import { AccountsModule } from 'modules/accounts/accounts.module';

/**
 * The CompetitorsModule class configures and sets up the dependencies needed
 * for competitor-related functionality within the application.
 *
 * It imports several repositories:
 * - CompetitorRepository
 * - CompetitorKeywordPositionRepository
 * - SearchResultRepository
 *
 * Additionally, it imports the CacheModule and AccountsModule.
 *
 * It provides the CompetitorsService for handling business logic related to competitors,
 * and exports the CompetitorsService and CompetitorRepository for use in other modules.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompetitorRepository,
      CompetitorKeywordPositionRepository,
      SearchResultRepository,
    ]),
    CacheModule,
    AccountsModule,
  ],
  providers: [CompetitorsService],
  exports: [
    CompetitorsService,
    TypeOrmModule.forFeature([CompetitorRepository]),
  ],
})
export class CompetitorsModule {}
