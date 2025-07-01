import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from 'modules/users/entities/user.entity';
import { EmailTemplateService } from 'modules/mailing/services/email-template.service';
import { PostmarkMailingService } from 'modules/mailing/services/postmark-mailing.service';
import { RemoteAccountUserType } from 'modules/accounts/types/remote-account-user.type';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { RoleEntity } from 'modules/users/entities/role.entity';
import { AccountUserEntity } from 'modules/accounts/entities/account-user.entity';
import { KeywordsAlertsToEmailsType } from 'modules/mailing/types/keywords-alerts-to-emails.type';
import { ProjectAlertsToEmailsType } from 'modules/mailing/types/project-alerts-to-emails.type';
import { KeywordAlertsToEmailsType } from 'modules/mailing/types/keyword-alerts-to-emails.type';
import { SubscriptionEntity } from 'modules/subscriptions/entities/subscription.entity';
import { EmailUserType } from 'modules/mailing/types/email-user.type';
import { KeywordsAlertsToEmailsForGoogleLocalType } from 'modules/alerts/types/keywords-alerts-to-emails-for-google-local.type';
import { ProjectAlertsToEmailsForGoogleLocalType } from 'modules/alerts/types/project-alerts-to-emails-for-google-local.type';

@Injectable()
export class MailingService {
  constructor(
    private readonly configService: ConfigService,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly postmarkMailingService: PostmarkMailingService,
  ) {}

  /**
   * Sends an email notification to a list of users indicating that their trial period is over.
   *
   * @param {EmailUserType[]} users - The array of user objects to send the email to.
   * @return {Promise<void>} A promise that resolves when the emails have been successfully sent.
   */
  async sendAnEmailThatTrialPeriodIsOver(
    users: EmailUserType[],
  ): Promise<void> {
    const messages = [];
    for (const user of users) {
      const letterTemplate =
        await this.emailTemplateService.createATemplateAnEmailThatTrialPeriodIsOver(
          user,
        );
      messages.push({
        TemplateId: letterTemplate.templateId,
        To: user.email,
        From: this.configService.get(ConfigEnvEnum.POSTMARK_SUPPORT_EMAIL),
        TemplateModel: letterTemplate.templateModel,
      });
    }
    await this.postmarkMailingService.sendManyPersonalizedLetters(messages);
  }

  /**
   * Sends an email notification to users whose trial period is ending.
   *
   * @param {EmailUserType[]} users - The list of users to notify.
   * @return {Promise<void>} - A promise that resolves when the emails are sent.
   */
  async sendAnEmailThatTrialPeriodIsEnding(
    users: EmailUserType[],
  ): Promise<void> {
    const messages = [];
    for (const user of users) {
      const letterTemplate =
        await this.emailTemplateService.createATemplateAnEmailThatTrialPeriodIsEnding(
          user,
        );
      messages.push({
        TemplateId: letterTemplate.templateId,
        To: user.email,
        From: this.configService.get(ConfigEnvEnum.POSTMARK_SUPPORT_EMAIL),
        TemplateModel: letterTemplate.templateModel,
      });
    }
    await this.postmarkMailingService.sendManyPersonalizedLetters(messages);
  }

  /**
   * Sends an email to notify the user about the successful change of their email address.
   *
   * @param {string} oldEmail - The user's previous email address.
   * @param {UserEntity} user - The user entity containing the user's new email address and other related information.
   * @return {Promise<void>} A promise that resolves when the email has been sent successfully.
   */
  async sendAnEmailAboutSuccessfulEmailChange(
    oldEmail: string,
    user: UserEntity,
  ): Promise<void> {
    const letterTemplate =
      await this.emailTemplateService.createATemplateAboutASuccessfulEmailChange(
        oldEmail,
        user,
      );
    await this.postmarkMailingService.sendEmail(oldEmail, letterTemplate);
  }

  /**
   * Sends an email to the user to confirm their new email address.
   *
   * @param {UserEntity} user - The user entity containing details such as the user's new email address.
   * @return {Promise<void>} - A promise that resolves once the email has been sent successfully.
   */
  async sendAnEmailToConfirmNewEmail(user: UserEntity): Promise<void> {
    const letterTemplate =
      await this.emailTemplateService.createATemplateForConfirmingNewEmail(
        user,
      );
    await this.postmarkMailingService.sendEmail(user.email, letterTemplate);
  }

  /**
   * Sends a letter to the user's current email address to facilitate changing their email.
   *
   * @param {UserEntity} user - The user entity containing current user details.
   * @param {string} newEmail - The new email address to which the user wants to switch.
   * @return {Promise<void>} A promise that resolves when the email has been sent.
   */
  async sendALetterToChangeEmail(
    user: UserEntity,
    newEmail: string,
  ): Promise<void> {
    const letterTemplate =
      await this.emailTemplateService.createATemplateToChangeEmail(
        user,
        newEmail,
      );
    await this.postmarkMailingService.sendEmail(user.email, letterTemplate);
  }
  /**
   * Sends an email notification to a user that their account has been deleted.
   *
   * @param {UserEntity} user - The user who has been deleted.
   * @param {UserEntity} admin - The administrator who performed the deletion.
   * @return {Promise<void>} - A promise that resolves when the email has been sent successfully.
   */
  async sendEmailUserHasBeenDeleted(
    user: UserEntity,
    admin: UserEntity,
  ): Promise<void> {
    const letterTemplate =
      await this.emailTemplateService.createUserHasBeenDeletedTemplate(
        user,
        admin,
      );
    await this.postmarkMailingService.sendEmail(user.email, letterTemplate);
  }

  /**
   * Sends letters to users about deleting them from their account.
   *
   * @param {UserEntity[]} users - Array of user entities to notify about deletion.
   * @param {UserEntity} admin - The admin user who is initiating the deletion.
   * @return {Promise<void>} A promise that resolves when all letters are sent.
   */
  async sendLettersToUsersAboutDeletingThemFromTheirAccount(
    users: UserEntity[],
    admin: UserEntity,
  ): Promise<void> {
    const messages = [];
    for (const user of users) {
      const letterTemplate =
        await this.emailTemplateService.createUserHasBeenDeletedTemplate(
          user,
          admin,
        );
      messages.push({
        TemplateId: letterTemplate.templateId,
        To: user.email,
        From: this.configService.get(ConfigEnvEnum.POSTMARK_SUPPORT_EMAIL),
        TemplateModel: letterTemplate.templateModel,
      });
    }
    await this.postmarkMailingService.sendManyPersonalizedLetters(messages);
  }

  /**
   * Sends project alert notifications to a list of emails using personalized templates for Google Maps.
   *
   * @param {string[]} emails - An array of email addresses to send the alerts to.
   * @param {ProjectAlertsToEmailsForGoogleLocalType} data - The data needed to generate the alert email templates.
   * @return {Promise<void>} A promise that resolves when all the alert emails have been sent.
   */
  async sendProjectAlertsToEmailsForGoogleMaps(
    emails: string[],
    data: ProjectAlertsToEmailsForGoogleLocalType,
  ) {
    const messages = [];
    const letterTemplate =
      await this.emailTemplateService.createProjectAlertTemplateForGoogleMaps(
        data,
      );
    for (const email of emails) {
      messages.push({
        TemplateId: letterTemplate.templateId,
        To: email,
        From: this.configService.get(ConfigEnvEnum.POSTMARK_SUPPORT_EMAIL),
        TemplateModel: letterTemplate.templateModel,
      });
    }
    await this.postmarkMailingService.sendManyPersonalizedLetters(messages);
  }

  /**
   * Sends project alert emails using a local template to a list of email addresses.
   *
   * @param {string[]} emails - Array of email addresses to send the alert emails to.
   * @param {ProjectAlertsToEmailsForGoogleLocalType} data - Data required to create the alert email template.
   * @return {Promise<void>} Resolves with no value when the emails have been sent successfully.
   */
  async sendProjectAlertsToEmailsForLocal(
    emails: string[],
    data: ProjectAlertsToEmailsForGoogleLocalType,
  ) {
    const messages = [];
    const letterTemplate =
      await this.emailTemplateService.createProjectAlertTemplateForLocal(data);
    for (const email of emails) {
      messages.push({
        TemplateId: letterTemplate.templateId,
        To: email,
        From: this.configService.get(ConfigEnvEnum.POSTMARK_SUPPORT_EMAIL),
        TemplateModel: letterTemplate.templateModel,
      });
    }
    await this.postmarkMailingService.sendManyPersonalizedLetters(messages);
  }

  /**
   * Sends project alert emails to a list of email addresses.
   *
   * @param {string[]} emails - The list of email addresses to send alerts to.
   * @param {ProjectAlertsToEmailsType} data - The information required to populate the email template with alert details.
   * @return {Promise<void>} A promise that resolves when the emails have been successfully sent.
   */
  async sendProjectAlertsToEmails(
    emails: string[],
    data: ProjectAlertsToEmailsType,
  ): Promise<void> {
    const messages = [];
    const letterTemplate =
      await this.emailTemplateService.createProjectAlertTemplate(data);
    for (const email of emails) {
      messages.push({
        TemplateId: letterTemplate.templateId,
        To: email,
        From: this.configService.get(ConfigEnvEnum.POSTMARK_SUPPORT_EMAIL),
        TemplateModel: letterTemplate.templateModel,
      });
    }
    await this.postmarkMailingService.sendManyPersonalizedLetters(messages);
  }

  /**
   * Sends keyword alerts to a list of email addresses for Google Maps.
   *
   * @param {string[]} emails - An array of email addresses to send the alerts to.
   * @param {Object} payload - The payload containing data and keywords for the alerts.
   * @param {KeywordsAlertsToEmailsForGoogleLocalType} payload.data - The data needed for the alert template.
   * @param {KeywordAlertsToEmailsType[]} payload.keywords - An array of keywords to be included in the alerts.
   * @return {Promise<void>} - A promise that resolves when the alerts have been sent.
   */
  async sendKeywordsAlertsToEmailsForGoogleMaps(
    emails: string[],
    payload: {
      data: KeywordsAlertsToEmailsForGoogleLocalType;
      keywords: KeywordAlertsToEmailsType[];
    },
  ) {
    const messages = [];
    const letterTemplate =
      await this.emailTemplateService.createKeywordAlertTemplateForGoogleMaps(
        payload.data,
        payload.keywords,
      );
    for (const email of emails) {
      messages.push({
        TemplateId: letterTemplate.templateId,
        To: email,
        From: this.configService.get(ConfigEnvEnum.POSTMARK_SUPPORT_EMAIL),
        TemplateModel: letterTemplate.templateModel,
      });
    }
    await this.postmarkMailingService.sendManyPersonalizedLetters(messages);
  }

  /**
   * Sends keyword alerts via email for a local service.
   *
   * @param {string[]} emails - Array of email addresses to send alerts to.
   * @param {Object} payload - The payload containing data for generating alerts and keywords.
   * @param {KeywordsAlertsToEmailsForGoogleLocalType} payload.data - The alert data specific to Google Local.
   * @param {KeywordAlertsToEmailsType[]} payload.keywords - The list of keywords to be included in the alerts.
   * @return {Promise<void>} A promise that resolves when all emails have been sent.
   */
  async sendKeywordsAlertsToEmailsForLocal(
    emails: string[],
    payload: {
      data: KeywordsAlertsToEmailsForGoogleLocalType;
      keywords: KeywordAlertsToEmailsType[];
    },
  ) {
    const messages = [];
    const letterTemplate =
      await this.emailTemplateService.createKeywordAlertTemplateForLocal(
        payload.data,
        payload.keywords,
      );
    for (const email of emails) {
      messages.push({
        TemplateId: letterTemplate.templateId,
        To: email,
        From: this.configService.get(ConfigEnvEnum.POSTMARK_SUPPORT_EMAIL),
        TemplateModel: letterTemplate.templateModel,
      });
    }
    await this.postmarkMailingService.sendManyPersonalizedLetters(messages);
  }

  /**
   * Sends keyword alerts to a list of emails.
   *
   * @param {string[]} emails - List of email addresses to send alerts to.
   * @param {Object} payload - Contains the data and keywords needed for the email alert.
   * @param {KeywordsAlertsToEmailsType} payload.data - The data for the email alert.
   * @param {KeywordAlertsToEmailsType[]} payload.keywords - The keywords to include in the alert.
   * @return {Promise<void>} A promise that resolves when all keyword alerts have been sent.
   */
  async sendKeywordsAlertsToEmails(
    emails: string[],
    payload: {
      data: KeywordsAlertsToEmailsType;
      keywords: KeywordAlertsToEmailsType[];
    },
  ): Promise<void> {
    const messages = [];
    const letterTemplate =
      await this.emailTemplateService.createKeywordAlertTemplate(
        payload.data,
        payload.keywords,
      );
    for (const email of emails) {
      messages.push({
        TemplateId: letterTemplate.templateId,
        To: email,
        From: this.configService.get(ConfigEnvEnum.POSTMARK_SUPPORT_EMAIL),
        TemplateModel: letterTemplate.templateModel,
      });
    }
    await this.postmarkMailingService.sendManyPersonalizedLetters(messages);
  }

  /**
   * Sends a notification email to a user when their account permissions change.
   *
   * @param {AccountUserEntity} userAccount - The user account entity whose permissions have changed.
   * @param {RoleEntity} newRole - The new role assigned to the user account.
   * @param {UserEntity} admin - The admin user responsible for the change.
   * @return {Promise<void>} A promise that resolves once the notification email has been sent.
   */
  async sendAccountPermissionChangeNotification(
    userAccount: AccountUserEntity,
    newRole: RoleEntity,
    admin: UserEntity,
  ): Promise<void> {
    const letterTemplate =
      await this.emailTemplateService.createAccountPermissionChangeNotificationTemplate(
        userAccount,
        newRole,
        admin,
      );
    await this.postmarkMailingService.sendEmail(
      userAccount.user.email,
      letterTemplate,
    );
  }
  /**
   * Sends an invitation email to an existing user.
   *
   * @param {string} email - The email address of the user.
   * @param {string} adminName - The name of the admin sending the invitation.
   * @param {RoleEnum} roleName - The role assigned to the user.
   * @param {string} firstName - The first name of the user.
   * @return {Promise<void>} A promise that resolves once the email is sent.
   */
  async sendExistingUserInvitationEmail(
    email: string,
    adminName: string,
    roleName: RoleEnum,
    firstName: string,
  ): Promise<void> {
    const letterTemplate =
      await this.emailTemplateService.createExistingUserInvitationTemplate(
        firstName,
        adminName,
        roleName,
      );

    await this.postmarkMailingService.sendEmail(email, letterTemplate);
  }

  /**
   * Sends an invitation email to a user.
   *
   * @param {string} email - The email address of the user to send the invitation to.
   * @param {string} adminName - The name of the admin sending the invitation.
   * @return {Promise<void>} - A promise that resolves when the email has been sent successfully.
   */
  async sendUserInvitationEmail(
    email: string,
    adminName: string,
  ): Promise<void> {
    const letterTemplate =
      await this.emailTemplateService.createUserInvitationTemplate(adminName);
    await this.postmarkMailingService.sendEmail(email, letterTemplate);
  }

  /**
   * Sends emails to multiple accounts about completely deleting their accounts.
   *
   * @param {RemoteAccountUserType[]} accounts - An array of account objects containing user details.
   * @return {Promise<void>} A promise that resolves when the emails have been sent.
   */
  async sendManyEmailsAboutCompletelyDeletingAccount(
    accounts: RemoteAccountUserType[],
  ): Promise<void> {
    const messages = [];
    for (const item of accounts) {
      const letterTemplate =
        await this.emailTemplateService.createCompletelyDeletingAccountTemplate(
          item.username,
        );
      messages.push({
        TemplateId: letterTemplate.templateId,
        To: item.email,
        From: this.configService.get(ConfigEnvEnum.POSTMARK_SUPPORT_EMAIL),
        TemplateModel: letterTemplate.templateModel,
      });
    }
    await this.postmarkMailingService.sendManyPersonalizedLetters(messages);
  }

  /**
   * Sends email notifications to multiple accounts about account deletion.
   *
   * @param {RemoteAccountUserType[]} accounts - Array of account objects to send emails to.
   * @return {Promise<void>} - A promise that resolves when emails have been sent.
   */
  async sendManyEmailsAboutDeletingAccount(
    accounts: RemoteAccountUserType[],
  ): Promise<void> {
    const messages = [];
    for (const item of accounts) {
      const letterTemplate =
        await this.emailTemplateService.createDeletingAccountTemplate(
          item.username,
        );
      messages.push({
        TemplateId: letterTemplate.templateId,
        To: item.email,
        From: this.configService.get(ConfigEnvEnum.POSTMARK_SUPPORT_EMAIL),
        TemplateModel: letterTemplate.templateModel,
      });
    }
    await this.postmarkMailingService.sendManyPersonalizedLetters(messages);
  }

  /**
   * Sends a reset password email to the specified user.
   *
   * @param {UserEntity} user - The user entity containing user details.
   * @return {Promise<void>} A promise that resolves when the email has been sent.
   */
  async sendResetPasswordEmail(user: UserEntity): Promise<void> {
    const letterTemplate =
      await this.emailTemplateService.createResetPasswordTemplate(user);
    return this.postmarkMailingService.sendEmail(user.email, letterTemplate);
  }

  /**
   * Sends a welcome letter to the user with provided billing information.
   *
   * @param {UserEntity} user - The user entity containing user details.
   * @param {SubscriptionEntity} billingInfo - The subscription entity containing billing information.
   * @return {Promise<void>} A promise that resolves when the email has been sent.
   */
  async sendWelcomeLetter(
    user: UserEntity,
    billingInfo: SubscriptionEntity,
  ): Promise<void> {
    const letterTemplate =
      await this.emailTemplateService.createWelcomeTemplate(user, billingInfo);
    return this.postmarkMailingService.sendEmail(user.email, letterTemplate);
  }

  /**
   * Sends a registration confirmation email to the specified user.
   *
   * @param {UserEntity} user - The user entity containing user information.
   * @return {Promise<void>} A promise that resolves when the email is successfully sent.
   */
  async sendRegistrationConfirmationEmail(user: UserEntity): Promise<void> {
    const letterTemplate =
      await this.emailTemplateService.createRegistrationConfirmationTemplate(
        user,
      );
    return this.postmarkMailingService.sendEmail(user.email, letterTemplate);
  }

  /**
   * Sends an email to the user regarding the deletion of their account.
   *
   * @param {UserEntity} user - The user entity containing information about the user to whom the email will be sent.
   * @return {Promise<void>} - A promise that resolves when the email is successfully sent.
   */
  async sendAnEmailAboutDeletingAccount(user: UserEntity): Promise<void> {
    const letterTemplate =
      await this.emailTemplateService.createTemplateForDeletingAnAccount(
        user.firstName,
      );
    return this.postmarkMailingService.sendEmail(user.email, letterTemplate);
  }
}
