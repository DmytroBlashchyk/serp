import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { UserEntity } from 'modules/users/entities/user.entity';
import { CurrentUserResponse } from 'modules/users/responses/current-user.response';
import { Injectable } from '@nestjs/common';
import { TimezoneResponse } from 'modules/timezones/responses/timezone.response';
import { UserStatusResponse } from 'modules/users/responses/user-status.response';
import { CryptoUtilsService } from 'modules/common/services/crypto-utils.service';

@Injectable()
export class UserFactory extends BaseResponseFactory<
  UserEntity,
  CurrentUserResponse
> {
  constructor(private readonly cryptoUtilsService: CryptoUtilsService) {
    super();
  }
  /**
   * Creates a `CurrentUserResponse` object from a `UserEntity`.
   *
   * @param {UserEntity} entity - The user entity object to be transformed into a response.
   * @return {Promise<CurrentUserResponse>} - A promise that resolves to the `CurrentUserResponse` object.
   */
  async createResponse(entity: UserEntity): Promise<CurrentUserResponse> {
    return new CurrentUserResponse({
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      username: entity.username,
      email: entity.email,
      timezone: new TimezoneResponse({ ...entity.account?.timezone }),
      status: new UserStatusResponse({ ...entity.status }),
      passwordExists: !!entity.password,
      helpScoutSignature: await this.cryptoUtilsService.getHelpScoutSignature(
        entity,
      ),
    });
  }
}
