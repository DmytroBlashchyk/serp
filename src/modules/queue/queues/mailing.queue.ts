import { BaseQueue } from 'modules/queue/queues/base.queue';
import { Process, Processor } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { LoggingService } from 'modules/logging/services/logging.service';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { MailingService } from 'modules/mailing/services/mailing.service';
import { Job } from 'bull';
import { UserRepository } from 'modules/users/repositories/user.repository';
import { AccountUserRepository } from 'modules/accounts/repositories/account-user.repository';
import { RoleRepository } from 'modules/auth/repositories/role.repository';
import { AccountRepository } from 'modules/accounts/repositories/account.repository';

@Processor(Queues.Mailing)
export class MailingQueue extends BaseQueue {
  constructor(
    protected readonly loggingService: LoggingService,
    private readonly mailingService: MailingService,
    private readonly userRepository: UserRepository,
    private readonly accountUserRepository: AccountUserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly accountRepository: AccountRepository,
  ) {
    super(loggingService);
  }
  /**
   * Sends an email notification about a successful email change.
   *
   * @param {Job} job - The job containing data such as userId and oldEmail.
   * @return {Promise<void>} - A promise that resolves when the email has been sent.
   */
  @Process({
    name: QueueEventEnum.SendAnEmailAboutSuccessfulEmailChange,
    concurrency: 1,
  })
  async sendAnEmailAboutSuccessfulEmailChange(job: Job): Promise<void> {
    const user = await this.userRepository.getUser(job.data.userId);
    await this.mailingService.sendAnEmailAboutSuccessfulEmailChange(
      job.data.oldEmail,
      user,
    );
  }

  /**
   * Sends a confirmation email for a new email address.
   *
   * @param {Job} job - The job containing user data, specifically the user ID.
   * @return {Promise<void>} A promise that resolves when the email has been sent.
   */
  @Process({
    name: QueueEventEnum.SendAnEmailToConfirmNewEmail,
    concurrency: 2,
  })
  async sendAnEmailToConfirmNewEmail(job: Job): Promise<void> {
    const user = await this.userRepository.getUser(job.data.userId);
    await this.mailingService.sendAnEmailToConfirmNewEmail(user);
  }

  /**
   * Sends an email to change the user's email address.
   *
   * @param {Job} job - The job object containing user information and the new email address.
   * @return {Promise<void>} A promise that resolves when the email has been sent.
   */
  @Process({
    name: QueueEventEnum.SendALetterToChangeEmail,
    concurrency: 1,
  })
  async sendALetterToChangeEmail(job: Job): Promise<void> {
    const user = await this.userRepository.getUser(job.data.userId);
    await this.mailingService.sendALetterToChangeEmail(user, job.data.newEmail);
  }

  /**
   * Sends an email notification when a user's account has been deleted.
   *
   * @param {Job} job - The job object containing user and admin details.
   * @return {Promise<void>} - A promise that resolves when the email has been sent.
   */
  @Process({
    name: QueueEventEnum.SendEmailUserHasBeenDeleted,
    concurrency: 1,
  })
  async sendEmailUserHasBeenDeleted(job: Job): Promise<void> {
    const user = await this.userRepository.getUser(job.data.userId);
    const admin = await this.userRepository.getUser(job.data.adminId);
    await this.mailingService.sendEmailUserHasBeenDeleted(user, admin);
  }

  /**
   * Sends notification letters to users informing them about their account deletion.
   *
   * @param {Job} job - The job containing accountId, userIds, and adminId needed to send notifications.
   * @return {Promise<void>} - A promise that resolves when the notification letters have been sent.
   */
  @Process({
    name: QueueEventEnum.SendLettersToUsersAboutDeletingThemFromTheirAccount,
    concurrency: 1,
  })
  async sendLettersToUsersAboutDeletingThemFromTheirAccount(
    job: Job,
  ): Promise<void> {
    const accountUsers =
      await this.accountUserRepository.getAccountUsersWithUserByAccountIdAndUserIds(
        job.data.accountId,
        job.data.userIds,
      );
    const admin = await this.userRepository.getUser(job.data.adminId);
    await this.mailingService.sendLettersToUsersAboutDeletingThemFromTheirAccount(
      accountUsers.map((accountUser) => accountUser.user),
      admin,
    );
  }

  /**
   * Sends a notification about a change in account permissions.
   *
   * @param {Job} job - The job object containing account, user, and role information.
   * @return {Promise<void>} A promise that resolves when the notification has been sent.
   */
  @Process({
    name: QueueEventEnum.SendAccountPermissionChangeNotification,
    concurrency: 1,
  })
  async sendAccountPermissionChangeNotification(job: Job): Promise<void> {
    const userAccount =
      await this.accountUserRepository.getAccountUserWithUserByAccountIdAndUserId(
        job.data.accountId,
        job.data.userId,
      );
    const role = await this.roleRepository.getRoleByName(job.data.roleName);
    const admin = await this.userRepository.getUserById(job.data.adminId);
    await this.mailingService.sendAccountPermissionChangeNotification(
      userAccount,
      role,
      admin,
    );
  }

  /**
   * Sends an invitation email to an existing user.
   *
   * @param {Job} job - The job object containing email details.
   * @param {string} job.data.email - The email address of the user.
   * @param {string} job.data.adminName - The name of the admin sending the invitation.
   * @param {string} job.data.roleName - The role name being assigned to the user.
   * @param {string} job.data.firstName - The first name of the user.
   * @return {Promise<void>} A promise that resolves when the email has been sent.
   */
  @Process({
    name: QueueEventEnum.SendExistingUserInvitationEmail,
    concurrency: 1,
  })
  async sendExistingUserInvitationEmail(job: Job): Promise<void> {
    await this.mailingService.sendExistingUserInvitationEmail(
      job.data.email,
      job.data.adminName,
      job.data.roleName,
      job.data.firstName,
    );
  }

  /**
   * Sends a user invitation email.
   *
   * @param {Job} job - The job containing the invitation details, including email and admin name.
   * @return {Promise<void>} A promise that resolves when the email is sent.
   */
  @Process({
    name: QueueEventEnum.SendUserInvitationEmail,
    concurrency: 1,
  })
  async sendUserInvitationEmail(job: Job): Promise<void> {
    await this.mailingService.sendUserInvitationEmail(
      job.data.email,
      job.data.adminName,
    );
  }

  /**
   * Sends a reset password email to the user identified by the userId in the job data.
   * Utilizes the mailingService to perform the actual sending of the email.
   *
   * @param {Job} job - The job object containing data related to the user, specifically the userId.
   * @return {Promise<void>} A promise that resolves when the email has been sent successfully.
   */
  @Process({
    name: QueueEventEnum.SendResetPasswordEmail,
    concurrency: 1,
  })
  async sendResetPasswordEmail(job: Job): Promise<void> {
    const user = await this.userRepository.getUser(job.data.userId);
    await this.mailingService.sendResetPasswordEmail(user);
  }

  /**
   * Method to send a welcome letter email to a user.
   *
   * @param {Job} job - The job object containing information necessary to send the welcome letter.
   * @return {Promise<void>} A promise that resolves when the welcome letter has been sent.
   */
  @Process({
    name: QueueEventEnum.SendWelcomeLetter,
    concurrency: 1,
  })
  async sendWelcomeLetter(job: Job): Promise<void> {
    const user = await this.userRepository.getUser(job.data.userId);
    const account = await this.accountUserRepository.getAnAccountByOwnerId(
      job.data.userId,
    );
    const accountWithSubscription =
      await this.accountRepository.getAccountWithSubscription(
        account.account.id,
      );
    await this.mailingService.sendWelcomeLetter(
      user,
      accountWithSubscription.subscription,
    );
  }

  /**
   * Sends a registration confirmation email to a user.
   *
   * @param {Job} job - The job containing the user information.
   * @return {Promise<void>} A promise that resolves when the email has been sent.
   */
  @Process({
    name: QueueEventEnum.SendRegistrationConfirmationEmail,
    concurrency: 1,
  })
  async sendRegistrationConfirmationEmail(job: Job): Promise<void> {
    const user = await this.userRepository.getUser(job.data.userId);
    await this.mailingService.sendRegistrationConfirmationEmail(user);
  }

  /**
   * Sends an email notifying the user about their account deletion.
   *
   * @param {Job} job - The job data containing the user ID needed to retrieve user information.
   * @return {Promise<void>} - A promise that resolves when the email has been sent successfully.
   */
  @Process({
    name: QueueEventEnum.SendAnEmailAboutDeletingAccount,
    concurrency: 1,
  })
  async sendAnEmailAboutDeletingAccount(job: Job): Promise<void> {
    const user = await this.userRepository.getUser(job.data.userId);
    await this.mailingService.sendAnEmailAboutDeletingAccount(user);
  }
}
