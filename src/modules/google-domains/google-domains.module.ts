import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleDomainRepository } from 'modules/google-domains/repositories/google-domain.repository';
import { GoogleDomainsService } from 'modules/google-domains/services/google-domains.service';
import { GoogleDomainsController } from 'modules/google-domains/controllers/google-domains.controller';

/**
 * The GoogleDomainsModule is a NestJS module that encapsulates the functionality related to Google Domains.
 * It imports necessary modules like HttpModule and TypeOrmModule.
 *
 * Imports:
 * - HttpModule: Used for making HTTP requests.
 * - TypeOrmModule for GoogleDomainRepository: Integrates TypeORM with the GoogleDomainRepository entity.
 *
 * Providers:
 * - GoogleDomainsService: The service that contains the business logic for managing Google Domains.
 *
 * Controllers:
 * - GoogleDomainsController: The controller that handles incoming requests related to Google Domains and returns responses.
 *
 * Exports:
 * - GoogleDomainsService: The service is exported to make it available for other modules.
 */
@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([GoogleDomainRepository])],
  providers: [GoogleDomainsService],
  controllers: [GoogleDomainsController],
  exports: [GoogleDomainsService],
})
export class GoogleDomainsModule {}
