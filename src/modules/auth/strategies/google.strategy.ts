import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { joinUrl } from 'modules/common/utils/joinUrl';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  /**
   * Constructs an instance of the class using specified configuration service.
   *
   * @param {ConfigService} configService - The configuration service to retrieve necessary configuration values.
   * @return {void}
   */
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get(ConfigEnvEnum.GOOGLE_CLIENT_ID),
      clientSecret: configService.get(ConfigEnvEnum.GOOGLE_SECRET),
      callbackURL: joinUrl(
        configService.get(ConfigEnvEnum.APP_BACKEND_URL),
        configService.get(ConfigEnvEnum.GOOGLE_CALLBACK),
      ),
      scope: ['email', 'profile'],
      prompt: 'select_account',
      auth_type: 'reauthenticate',
      include_granted_scopes: true,
    });
  }

  /**
   * Validates a user's profile information and returns user data.
   *
   * @param {string} accessToken - The access token provided by the authentication service.
   * @param {string} refreshToken - The refresh token provided by the authentication service.
   * @param {any} profile - The user's profile information returned by the authentication service.
   * @param {VerifyCallback} done - Callback function to indicate completion with user data or an error.
   * @return {Promise<any>} A promise that resolves to user data.
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, displayName, id } = profile;
    const user = {
      googleId: id,
      email: emails[0].value,
      username: displayName,
      firstName: name.givenName,
      lastName: name.familyName,
    };
    done(null, user);
  }
}
