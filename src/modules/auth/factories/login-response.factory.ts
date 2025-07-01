import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { UserEntity } from 'modules/users/entities/user.entity';
import { LoginResponse } from 'modules/auth/responses/login.response';
import { Injectable } from '@nestjs/common';
import { LoginResponseFactoryOptionsType } from 'modules/auth/types/login-response-factory-options.type';
import { UserFactory } from 'modules/users/factories/user.factory';

@Injectable()
export class LoginResponseFactory extends BaseResponseFactory<
  UserEntity,
  LoginResponse
> {
  constructor(private readonly userFactory: UserFactory) {
    super();
  }
  /**
   * Creates a response for a user login operation.
   *
   * @param {UserEntity} entity - The user entity for which the response is to be created.
   * @param {LoginResponseFactoryOptionsType} options - Options containing tokens and other relevant data for the response.
   * @return {Promise<LoginResponse>} - A promise that resolves to the login response.
   */
  async createResponse(
    entity: UserEntity,
    options: LoginResponseFactoryOptionsType,
  ): Promise<LoginResponse> {
    return new LoginResponse({
      user: await this.userFactory.createResponse(entity),
      ...options.tokens,
    });
  }
}
