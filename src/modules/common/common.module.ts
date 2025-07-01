import { Module } from '@nestjs/common';
import { CryptoUtilsService } from 'modules/common/services/crypto-utils.service';
import { RateLimiterWrapperFactoryService } from 'modules/common/services/rate-limiter-factory.service';

/**
 * The CommonModule defines a module that provides and exports services
 * for cryptographic utilities and rate limiting functionality.
 *
 * @module CommonModule
 *
 * @description
 * The CommonModule is configured to include the following services:
 *  - CryptoUtilsService: A service providing cryptographic utility functions.
 *  - RateLimiterWrapperFactoryService: A service providing rate limiter functionality.
 *
 * These services are both provided and exported by this module, making them
 * available for injection into other parts of the application.
 */
@Module({
  providers: [CryptoUtilsService, RateLimiterWrapperFactoryService],
  exports: [CryptoUtilsService, RateLimiterWrapperFactoryService],
})
export class CommonModule {}
