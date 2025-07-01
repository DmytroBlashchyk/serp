import { NestFactory } from '@nestjs/core';
import { CliModule } from 'modules/cli/cli.module';
import { CommandModule, CommandService } from 'nestjs-command';

/**
 * Initializes the application context and executes the command service.
 *
 * This function creates an application context using the `CliModule`,
 * selects the `CommandModule`, retrieves the `CommandService` to execute a command,
 * and then closes the application context.
 * In case of an error during the execution of the command service,
 * it logs the error, closes the application context, and exits the process.
 *
 * @return {Promise<void>} A promise that resolves when the application
 *                          context has been closed after executing the command.
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CliModule, {
    logger: true,
  });
  try {
    await app.select(CommandModule).get(CommandService).exec();
    await app.close();
  } catch (error) {
    console.log(error);
    await app.close();
    process.exit();
  }
}

bootstrap();
