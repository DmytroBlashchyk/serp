import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { RefreshTokenResponse } from 'modules/auth/responses/refresh-token.response';
import { LoginAccountResponse } from 'modules/auth/responses/login-account.response';
import { Injectable } from '@nestjs/common';
import { AccountUserEntity } from 'modules/accounts/entities/account-user.entity';
import { AccountResponse } from 'modules/accounts/responses/account.response';
import { InvitationRepository } from 'modules/invitations/repositories/invitation.repository';
import { InvitedResponse } from 'modules/invitations/responses/invited.response';
import { RoleResponse } from 'modules/auth/responses/role.response';
import { OwnerResponse } from 'modules/accounts/responses/owner.response';
import { UserFactory } from 'modules/users/factories/user.factory';
import { LoginAccountResponseFactoryOptionsType } from 'modules/auth/types/login-account-response-factory-options.type';
import { IdType } from 'modules/common/types/id-type.type';

@Injectable()
export class LoginAccountResponseFactory extends BaseResponseFactory<
  RefreshTokenResponse,
  LoginAccountResponse
> {
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly userFactory: UserFactory,
  ) {
    super();
  }
  /**
   * Creates a response for the login account with the provided entity and options.
   *
   * @param {RefreshTokenResponse} entity - The refresh token response entity.
   * @param {LoginAccountResponseFactoryOptionsType} options - The options needed to create the login account response, including user information and user accounts.
   * @return {Promise<LoginAccountResponse>} The Promise that resolves to a LoginAccountResponse object containing user and account details.
   */
  async createResponse(
    entity: RefreshTokenResponse,
    options: LoginAccountResponseFactoryOptionsType,
  ): Promise<LoginAccountResponse> {
    const invitations =
      await this.invitationRepository.getInvitationsByInvitationUser(
        options.userEmail as string,
      );
    const currentAccount = (options.userAccounts as AccountUserEntity[]).find(
      (item) => item.byDefault === true,
    );
    if (!!currentAccount) {
      const availableAccounts = (
        options.userAccounts as AccountUserEntity[]
      ).filter((item) => !item.byDefault);
      return new LoginAccountResponse({
        ...entity,
        user: await this.userFactory.createResponse(options.user),
        currentAccount: new AccountResponse({
          accountId: currentAccount.account.id,
          isMyAccount: currentAccount.account.owner.id === options.userId,
          byDefault: currentAccount.byDefault,
          role: new RoleResponse({ ...currentAccount.role }),
          owner: new OwnerResponse({
            id: currentAccount.account.owner.id,
            ownerUserLastName: currentAccount.account.owner.lastName,
            ownerUserFirstName: currentAccount.account.owner.firstName,
            ownerEmail: currentAccount.account.owner.email,
          }),
          invited: new InvitedResponse({
            id:
              currentAccount.account.owner.id === options.userId
                ? currentAccount.account.owner.id
                : invitations.find(
                    (invitation) =>
                      invitation.account.id === currentAccount.account.id,
                  )?.user.id,
            invitedEmail:
              currentAccount.account.owner.id === options.userId
                ? currentAccount.account.owner.email
                : invitations.find(
                    (invitation) =>
                      invitation.account.id === currentAccount.account.id,
                  )?.user.email,
            invitedUserFirstName:
              currentAccount.account.owner.id === options.userId
                ? currentAccount.account.owner.firstName
                : invitations.find(
                    (invitation) =>
                      invitation.account.id === currentAccount.account.id,
                  )?.user.firstName,
            invitedUserLastName:
              currentAccount.account.owner.id === options.userId
                ? currentAccount.account.owner.lastName
                : invitations.find(
                    (invitation) =>
                      invitation.account.id === currentAccount.account.id,
                  )?.user.lastName,
          }),
        }),
        availableAccounts: await Promise.all(
          availableAccounts.map(async (item) => {
            return new AccountResponse({
              accountId: item.account.id,
              byDefault: item.byDefault,
              role: new RoleResponse({ ...item.role }),
              isMyAccount: item.account.owner.id === options.userId,
              owner: new OwnerResponse({
                id: item.account.owner.id,
                ownerEmail: item.account.owner.email,
                ownerUserFirstName: item.account.owner.firstName,
                ownerUserLastName: item.account.owner.lastName,
              }),
              invited: new InvitedResponse({
                id:
                  item.account.owner.id === options.userId
                    ? item.account.owner.id
                    : invitations.find(
                        (invitation) =>
                          invitation.account.id === item.account.id,
                      )?.user.id ?? item.account.owner.id,
                invitedEmail:
                  item.account.owner.id === options.userId
                    ? item.account.owner.email
                    : invitations.find(
                        (invitation) =>
                          invitation.account.id === item.account.id,
                      )?.user.email ?? item.account.owner.email,
                invitedUserFirstName:
                  item.account.owner.id === options.userId
                    ? item.account.owner.firstName
                    : invitations.find(
                        (invitation) =>
                          invitation.account.id === item.account.id,
                      )?.user.firstName ?? item.account.owner.firstName,
                invitedUserLastName:
                  item.account.owner.id === options.userId
                    ? item.account.owner.lastName
                    : invitations.find(
                        (invitation) =>
                          invitation.account.id === item.account.id,
                      )?.user.lastName ?? item.account.owner.lastName,
              }),
            });
          }),
        ),
      });
    } else {
      const currentAccount = (options.userAccounts as AccountUserEntity[]).find(
        (item) => item.account.owner.id === (options.userId as IdType),
      );
      const availableAccounts = (
        options.userAccounts as AccountUserEntity[]
      ).filter((item) => !item.byDefault);

      return new LoginAccountResponse({
        ...entity,
        user: await this.userFactory.createResponse(options.user),
        currentAccount: new AccountResponse({
          accountId: currentAccount.account.id,
          isMyAccount: currentAccount.account.owner.id === options.userId,
          byDefault: true,
          role: new RoleResponse({ ...currentAccount.role }),
          owner: new OwnerResponse({
            id: currentAccount.account.owner.id,
            ownerUserLastName: currentAccount.account.owner.lastName,
            ownerUserFirstName: currentAccount.account.owner.firstName,
            ownerEmail: currentAccount.account.owner.email,
          }),
          invited: new InvitedResponse({
            id:
              currentAccount.account.owner.id === options.userId
                ? currentAccount.account.owner.id
                : invitations.find(
                    (invitation) =>
                      invitation.account.id === currentAccount.account.id,
                  )?.user.id,
            invitedEmail:
              currentAccount.account.owner.id === options.userId
                ? currentAccount.account.owner.email
                : invitations.find(
                    (invitation) =>
                      invitation.account.id === currentAccount.account.id,
                  )?.user.email,
            invitedUserFirstName:
              currentAccount.account.owner.id === options.userId
                ? currentAccount.account.owner.firstName
                : invitations.find(
                    (invitation) =>
                      invitation.account.id === currentAccount.account.id,
                  )?.user.firstName,
            invitedUserLastName:
              currentAccount.account.owner.id === options.userId
                ? currentAccount.account.owner.lastName
                : invitations.find(
                    (invitation) =>
                      invitation.account.id === currentAccount.account.id,
                  )?.user.lastName,
          }),
        }),
        availableAccounts: await Promise.all(
          availableAccounts.map(async (item) => {
            return new AccountResponse({
              accountId: item.account.id,
              byDefault:
                item.account.owner.id === (options.userId as IdType)
                  ? true
                  : false,
              role: new RoleResponse({ ...item.role }),
              isMyAccount: item.account.owner.id === options.userId,
              owner: new OwnerResponse({
                id: item.account.owner.id,
                ownerEmail: item.account.owner.email,
                ownerUserFirstName: item.account.owner.firstName,
                ownerUserLastName: item.account.owner.lastName,
              }),
              invited: new InvitedResponse({
                id:
                  item.account.owner.id === options.userId
                    ? item.account.owner.id
                    : invitations.find(
                        (invitation) =>
                          invitation.account.id === item.account.id,
                      )?.user.id ?? item.account.owner.id,
                invitedEmail:
                  item.account.owner.id === options.userId
                    ? item.account.owner.email
                    : invitations.find(
                        (invitation) =>
                          invitation.account.id === item.account.id,
                      )?.user.email ?? item.account.owner.email,
                invitedUserFirstName:
                  item.account.owner.id === options.userId
                    ? item.account.owner.firstName
                    : invitations.find(
                        (invitation) =>
                          invitation.account.id === item.account.id,
                      )?.user.firstName ?? item.account.owner.firstName,
                invitedUserLastName:
                  item.account.owner.id === options.userId
                    ? item.account.owner.lastName
                    : invitations.find(
                        (invitation) =>
                          invitation.account.id === item.account.id,
                      )?.user.lastName ?? item.account.owner.lastName,
              }),
            });
          }),
        ),
      });
    }
  }
}
