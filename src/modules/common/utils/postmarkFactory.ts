import { PostmarkOptions } from 'nestjs-postmark/src/lib/interfaces/postmark-options.interface';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';

/**
 * Creates and returns the Postmark options using the provided configuration service.
 *
 * @param {ConfigService} config - The configuration service used to retrieve the Postmark server token.
 * @return {PostmarkOptions | Promise<PostmarkOptions>} The Postmark options including the server token.
 */
export function postmarkFactory(
  config: ConfigService,
): PostmarkOptions | Promise<PostmarkOptions> {
  return {
    serverToken: config.get(ConfigEnvEnum.POSTMARK_API_KEY),
  };
}
