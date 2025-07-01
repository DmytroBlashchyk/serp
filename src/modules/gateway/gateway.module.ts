import { Module } from '@nestjs/common';
import { GatewayService } from 'modules/gateway/services/gateway.service';
import { LoggingModule } from 'modules/logging/logging.module';

/**
 * GatewayModule is responsible for handling the initialization and
 * configuration of the gateway which interacts with other services.
 * This module imports the LoggingModule to ensure that all logs
 * are properly recorded throughout the gateway operations.
 *
 * Key responsibilities:
 * - Importing necessary modules and dependencies.
 * - Providing the GatewayService to manage gateway operations.
 * - Exporting the GatewayService to be used by other modules.
 *
 * Decorators:
 * - @Module: Defines the imports, providers, controllers, and exports for the module.
 */
@Module({
  imports: [LoggingModule],
  providers: [GatewayService],
  controllers: [],
  exports: [GatewayService],
})
export class GatewayModule {}
