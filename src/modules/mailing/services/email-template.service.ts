import { Injectable } from '@nestjs/common';
import { UserEntity } from 'modules/users/entities/user.entity';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { ConfigService } from '@nestjs/config';
import { EmailLetterTemplateType } from 'modules/mailing/types/email-letter-template.type';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { RoleEntity } from 'modules/users/entities/role.entity';
import { AccountUserEntity } from 'modules/accounts/entities/account-user.entity';
import { ProjectAlertsToEmailsType } from 'modules/mailing/types/project-alerts-to-emails.type';
import { KeywordsAlertsToEmailsType } from 'modules/mailing/types/keywords-alerts-to-emails.type';
import { KeywordAlertsToEmailsType } from 'modules/mailing/types/keyword-alerts-to-emails.type';
import { SubscriptionEntity } from 'modules/subscriptions/entities/subscription.entity';
import { EmailUserType } from 'modules/mailing/types/email-user.type';
import { definingTypeOfPositionDisplayForATemplateHelper } from 'modules/mailing/helpers/defining-type-of-position-display-for-a-template.helper';
import { KeywordsAlertsToEmailsForGoogleLocalType } from 'modules/alerts/types/keywords-alerts-to-emails-for-google-local.type';
import { ProjectAlertsToEmailsForGoogleLocalType } from 'modules/alerts/types/project-alerts-to-emails-for-google-local.type';

@Injectable()
export class EmailTemplateService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Generates a keyword alert template for local rankings.
   *
   * @param {KeywordsAlertsToEmailsForGoogleLocalType} data - The data related to the keyword alerts and email configuration for Google local.
   * @param {KeywordAlertsToEmailsType[]} keywords - An array of keyword alerts with details about the keywords.
   * @return {Object} An object containing the templateId and templateModel for the keyword alert.
   */
  async createKeywordAlertTemplateForLocal(
    data: KeywordsAlertsToEmailsForGoogleLocalType,
    keywords: KeywordAlertsToEmailsType[],
  ) {
    return {
      templateId: this.configService.get(
        ConfigEnvEnum.GOOGLE_LOCAL_RANK_CHANGE_FOR_KEYWORDS_TEMPLATE,
      ),
      templateModel: {
        product_url: 'product_url_Value',
        product_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        project_name: data.projectName,
        action_url: data.actionUrl,
        company_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        company_address: this.configService.get(ConfigEnvEnum.COMPANY_ADDRESS),
        keywords_affected: data.affected,
        affected: data.affected,
        business_name: data.businessName,
        business_url: data.businessUrl,
        location: data.location,
        rule: data.rule,
        threshold: data.threshold,
        date: data.date,
        link_to_alerts: data.linkToAlerts,
        link_to_project_alert: data.actionUrl,
        previous_date: data.previousDate,
        current_date: data.currentDate,
        number_of_remaining_keywords: data.numberOfRemainingKeywords,
        keyword_name_1: keywords.length > 0 ? keywords[0].keywordName : null,
        keyword_project_name_1:
          keywords.length > 0 ? keywords[0].projectName : null,
        previous_position_1:
          keywords.length > 0
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[0].previousPosition,
              )
            : null,
        current_position_1:
          keywords.length > 0
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[0].currentPosition,
              )
            : null,
        difference_1: keywords.length > 0 ? keywords[0].difference : null,
        device_1: keywords.length > 0 ? keywords[0].device : null,
        keyword_name_2: keywords.length > 1 ? keywords[1].keywordName : null,
        keyword_project_name_2:
          keywords.length > 1 ? keywords[1].projectName : null,
        previous_position_2:
          keywords.length > 1
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[1].previousPosition,
              )
            : null,
        current_position_2:
          keywords.length > 1
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[1].currentPosition,
              )
            : null,
        difference_2: keywords.length > 1 ? keywords[1].difference : null,
        device_2: keywords.length > 1 ? keywords[1].device : null,
        keyword_name_3: keywords.length > 2 ? keywords[2].keywordName : null,
        keyword_project_name_3:
          keywords.length > 2 ? keywords[2].projectName : null,
        previous_position_3:
          keywords.length > 2
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[2].previousPosition,
              )
            : null,
        current_position_3:
          keywords.length > 2
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[2].currentPosition,
              )
            : null,
        difference_3: keywords.length > 2 ? keywords[1].difference : null,
        device_3: keywords.length > 2 ? keywords[2].device : null,
        keyword_name_4: keywords.length > 3 ? keywords[3].keywordName : null,
        keyword_project_name_4:
          keywords.length > 3 ? keywords[3].projectName : null,
        previous_position_4:
          keywords.length > 3
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[3].previousPosition,
              )
            : null,
        current_position_4:
          keywords.length > 3
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[3].currentPosition,
              )
            : null,
        difference_4: keywords.length > 3 ? keywords[3].difference : null,
        device_4: keywords.length > 3 ? keywords[3].device : null,
        keyword_name_5: keywords.length > 4 ? keywords[4].keywordName : null,
        keyword_project_name_5:
          keywords.length > 4 ? keywords[4].projectName : null,
        previous_position_5:
          keywords.length > 4
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[4].previousPosition,
              )
            : null,
        current_position_5:
          keywords.length > 4
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[4].currentPosition,
              )
            : null,
        difference_5: keywords.length > 4 ? keywords[4].difference : null,
        device_5: keywords.length > 4 ? keywords[4].device : null,
        keyword_name_6: keywords.length > 5 ? keywords[5].keywordName : null,
        keyword_project_name_6:
          keywords.length > 5 ? keywords[5].projectName : null,
        previous_position_6:
          keywords.length > 5
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[5].previousPosition,
              )
            : null,
        current_position_6:
          keywords.length > 5
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[5].currentPosition,
              )
            : null,
        difference_6: keywords.length > 5 ? keywords[5].difference : null,
        device_6: keywords.length > 5 ? keywords[5].device : null,
        keyword_name_7: keywords.length > 6 ? keywords[6].keywordName : null,
        keyword_project_name_7:
          keywords.length > 6 ? keywords[6].projectName : null,
        previous_position_7:
          keywords.length > 6
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[6].previousPosition,
              )
            : null,
        current_position_7:
          keywords.length > 6
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[6].currentPosition,
              )
            : null,
        difference_7: keywords.length > 6 ? keywords[6].difference : null,
        device_7: keywords.length > 6 ? keywords[6].device : null,
        keyword_name_8: keywords.length > 7 ? keywords[7].keywordName : null,
        keyword_project_name_8:
          keywords.length > 7 ? keywords[7].projectName : null,
        previous_position_8:
          keywords.length > 7
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[7].previousPosition,
              )
            : null,
        current_position_8:
          keywords.length > 7
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[7].currentPosition,
              )
            : null,
        difference_8: keywords.length > 7 ? keywords[7].difference : null,
        device_8: keywords.length > 7 ? keywords[7].device : null,
        keyword_name_9: keywords.length > 8 ? keywords[8].keywordName : null,
        keyword_project_name_9:
          keywords.length > 8 ? keywords[8].projectName : null,
        previous_position_9:
          keywords.length > 8
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[8].previousPosition,
              )
            : null,
        current_position_9:
          keywords.length > 8
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[8].currentPosition,
              )
            : null,
        difference_9: keywords.length > 8 ? keywords[8].difference : null,

        device_9: keywords.length > 8 ? keywords[8].device : null,
        keyword_name_10: keywords.length > 9 ? keywords[9].keywordName : null,
        keyword_project_name_10:
          keywords.length > 9 ? keywords[9].projectName : null,
        previous_position_10:
          keywords.length > 9
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[9].previousPosition,
              )
            : null,
        current_position_10:
          keywords.length > 9
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[9].currentPosition,
              )
            : null,
        difference_10: keywords.length > 9 ? keywords[9].difference : null,
        device_10: keywords.length > 9 ? keywords[9].device : null,
      },
    };
  }
  /**
   * Creates a keyword alert template for Google Maps.
   *
   * @param {KeywordsAlertsToEmailsForGoogleLocalType} data - The data containing details required for the template.
   * @param {KeywordAlertsToEmailsType[]} keywords - The array of keywords affected which need to be included in the template.
   * @return {Promise<Object>} The created template object containing the template ID and model data.
   */
  async createKeywordAlertTemplateForGoogleMaps(
    data: KeywordsAlertsToEmailsForGoogleLocalType,
    keywords: KeywordAlertsToEmailsType[],
  ) {
    return {
      templateId: this.configService.get(
        ConfigEnvEnum.GOOGLE_MAPS_RANK_CHANGE_FOR_KEYWORDS,
      ),
      templateModel: {
        product_url: 'product_url_Value',
        product_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        project_name: data.projectName,
        action_url: data.actionUrl,
        company_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        company_address: this.configService.get(ConfigEnvEnum.COMPANY_ADDRESS),
        keywords_affected: data.affected,
        affected: data.affected,
        business_name: data.businessName,
        business_url: data.businessUrl,
        location: data.location,
        rule: data.rule,
        threshold: data.threshold,
        date: data.date,
        link_to_alerts: data.linkToAlerts,
        link_to_project_alert: data.actionUrl,
        previous_date: data.previousDate,
        current_date: data.currentDate,
        number_of_remaining_keywords: data.numberOfRemainingKeywords,
        keyword_name_1: keywords.length > 0 ? keywords[0].keywordName : null,
        keyword_project_name_1:
          keywords.length > 0 ? keywords[0].projectName : null,
        previous_position_1:
          keywords.length > 0
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[0].previousPosition,
              )
            : null,
        current_position_1:
          keywords.length > 0
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[0].currentPosition,
              )
            : null,
        difference_1: keywords.length > 0 ? keywords[0].difference : null,
        device_1: keywords.length > 0 ? keywords[0].device : null,
        keyword_name_2: keywords.length > 1 ? keywords[1].keywordName : null,
        keyword_project_name_2:
          keywords.length > 1 ? keywords[1].projectName : null,
        previous_position_2:
          keywords.length > 1
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[1].previousPosition,
              )
            : null,
        current_position_2:
          keywords.length > 1
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[1].currentPosition,
              )
            : null,
        difference_2: keywords.length > 1 ? keywords[1].difference : null,
        device_2: keywords.length > 1 ? keywords[1].device : null,
        keyword_name_3: keywords.length > 2 ? keywords[2].keywordName : null,
        keyword_project_name_3:
          keywords.length > 2 ? keywords[2].projectName : null,
        previous_position_3:
          keywords.length > 2
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[2].previousPosition,
              )
            : null,
        current_position_3:
          keywords.length > 2
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[2].currentPosition,
              )
            : null,
        difference_3: keywords.length > 2 ? keywords[1].difference : null,
        device_3: keywords.length > 2 ? keywords[2].device : null,
        keyword_name_4: keywords.length > 3 ? keywords[3].keywordName : null,
        keyword_project_name_4:
          keywords.length > 3 ? keywords[3].projectName : null,
        previous_position_4:
          keywords.length > 3
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[3].previousPosition,
              )
            : null,
        current_position_4:
          keywords.length > 3
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[3].currentPosition,
              )
            : null,
        difference_4: keywords.length > 3 ? keywords[3].difference : null,
        device_4: keywords.length > 3 ? keywords[3].device : null,
        keyword_name_5: keywords.length > 4 ? keywords[4].keywordName : null,
        keyword_project_name_5:
          keywords.length > 4 ? keywords[4].projectName : null,
        previous_position_5:
          keywords.length > 4
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[4].previousPosition,
              )
            : null,
        current_position_5:
          keywords.length > 4
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[4].currentPosition,
              )
            : null,
        difference_5: keywords.length > 4 ? keywords[4].difference : null,
        device_5: keywords.length > 4 ? keywords[4].device : null,
        keyword_name_6: keywords.length > 5 ? keywords[5].keywordName : null,
        keyword_project_name_6:
          keywords.length > 5 ? keywords[5].projectName : null,
        previous_position_6:
          keywords.length > 5
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[5].previousPosition,
              )
            : null,
        current_position_6:
          keywords.length > 5
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[5].currentPosition,
              )
            : null,
        difference_6: keywords.length > 5 ? keywords[5].difference : null,
        device_6: keywords.length > 5 ? keywords[5].device : null,
        keyword_name_7: keywords.length > 6 ? keywords[6].keywordName : null,
        keyword_project_name_7:
          keywords.length > 6 ? keywords[6].projectName : null,
        previous_position_7:
          keywords.length > 6
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[6].previousPosition,
              )
            : null,
        current_position_7:
          keywords.length > 6
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[6].currentPosition,
              )
            : null,
        difference_7: keywords.length > 6 ? keywords[6].difference : null,
        device_7: keywords.length > 6 ? keywords[6].device : null,
        keyword_name_8: keywords.length > 7 ? keywords[7].keywordName : null,
        keyword_project_name_8:
          keywords.length > 7 ? keywords[7].projectName : null,
        previous_position_8:
          keywords.length > 7
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[7].previousPosition,
              )
            : null,
        current_position_8:
          keywords.length > 7
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[7].currentPosition,
              )
            : null,
        difference_8: keywords.length > 7 ? keywords[7].difference : null,
        device_8: keywords.length > 7 ? keywords[7].device : null,
        keyword_name_9: keywords.length > 8 ? keywords[8].keywordName : null,
        keyword_project_name_9:
          keywords.length > 8 ? keywords[8].projectName : null,
        previous_position_9:
          keywords.length > 8
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[8].previousPosition,
              )
            : null,
        current_position_9:
          keywords.length > 8
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[8].currentPosition,
              )
            : null,
        difference_9: keywords.length > 8 ? keywords[8].difference : null,

        device_9: keywords.length > 8 ? keywords[8].device : null,
        keyword_name_10: keywords.length > 9 ? keywords[9].keywordName : null,
        keyword_project_name_10:
          keywords.length > 9 ? keywords[9].projectName : null,
        previous_position_10:
          keywords.length > 9
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[9].previousPosition,
              )
            : null,
        current_position_10:
          keywords.length > 9
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[9].currentPosition,
              )
            : null,
        difference_10: keywords.length > 9 ? keywords[9].difference : null,
        device_10: keywords.length > 9 ? keywords[9].device : null,
      },
    };
  }

  /**
   * Creates a keyword alert template based on provided data and keywords.
   *
   * @param {KeywordsAlertsToEmailsType} data - The data containing the details for the keyword alert.
   * @param {KeywordAlertsToEmailsType[]} keywords - An array of keywords and their related data.
   * @return {Promise<EmailLetterTemplateType>} - A promise that resolves to an email template object.
   */
  async createKeywordAlertTemplate(
    data: KeywordsAlertsToEmailsType,
    keywords: KeywordAlertsToEmailsType[],
  ): Promise<EmailLetterTemplateType> {
    return {
      templateId: this.configService.get(
        ConfigEnvEnum.ALERT_BY_KEYWORDS_TEMPLATE_ID,
      ),
      templateModel: {
        product_url: 'product_url_Value',
        product_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        project_name: data.projectName,
        action_url: data.actionUrl,
        company_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        company_address: this.configService.get(ConfigEnvEnum.COMPANY_ADDRESS),
        keywords_affected: data.affected,
        affected: data.affected,
        domain: data.domain,
        location: data.location,
        rule: data.rule,
        threshold: data.threshold,
        date: data.date,
        link_to_alerts: data.linkToAlerts,
        link_to_project_alert: data.actionUrl,
        previous_date: data.previousDate,
        current_date: data.currentDate,
        number_of_remaining_keywords: data.numberOfRemainingKeywords,
        keyword_name_1: keywords.length > 0 ? keywords[0].keywordName : null,
        keyword_project_name_1:
          keywords.length > 0 ? keywords[0].projectName : null,
        previous_position_1:
          keywords.length > 0
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[0].previousPosition,
              )
            : null,
        current_position_1:
          keywords.length > 0
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[0].currentPosition,
              )
            : null,
        difference_1: keywords.length > 0 ? keywords[0].difference : null,
        device_1: keywords.length > 0 ? keywords[0].device : null,
        keyword_name_2: keywords.length > 1 ? keywords[1].keywordName : null,
        keyword_project_name_2:
          keywords.length > 1 ? keywords[1].projectName : null,
        previous_position_2:
          keywords.length > 1
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[1].previousPosition,
              )
            : null,
        current_position_2:
          keywords.length > 1
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[1].currentPosition,
              )
            : null,
        difference_2: keywords.length > 1 ? keywords[1].difference : null,
        device_2: keywords.length > 1 ? keywords[1].device : null,
        keyword_name_3: keywords.length > 2 ? keywords[2].keywordName : null,
        keyword_project_name_3:
          keywords.length > 2 ? keywords[2].projectName : null,
        previous_position_3:
          keywords.length > 2
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[2].previousPosition,
              )
            : null,
        current_position_3:
          keywords.length > 2
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[2].currentPosition,
              )
            : null,
        difference_3: keywords.length > 2 ? keywords[1].difference : null,
        device_3: keywords.length > 2 ? keywords[2].device : null,
        keyword_name_4: keywords.length > 3 ? keywords[3].keywordName : null,
        keyword_project_name_4:
          keywords.length > 3 ? keywords[3].projectName : null,
        previous_position_4:
          keywords.length > 3
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[3].previousPosition,
              )
            : null,
        current_position_4:
          keywords.length > 3
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[3].currentPosition,
              )
            : null,
        difference_4: keywords.length > 3 ? keywords[3].difference : null,
        device_4: keywords.length > 3 ? keywords[3].device : null,
        keyword_name_5: keywords.length > 4 ? keywords[4].keywordName : null,
        keyword_project_name_5:
          keywords.length > 4 ? keywords[4].projectName : null,
        previous_position_5:
          keywords.length > 4
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[4].previousPosition,
              )
            : null,
        current_position_5:
          keywords.length > 4
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[4].currentPosition,
              )
            : null,
        difference_5: keywords.length > 4 ? keywords[4].difference : null,
        device_5: keywords.length > 4 ? keywords[4].device : null,
        keyword_name_6: keywords.length > 5 ? keywords[5].keywordName : null,
        keyword_project_name_6:
          keywords.length > 5 ? keywords[5].projectName : null,
        previous_position_6:
          keywords.length > 5
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[5].previousPosition,
              )
            : null,
        current_position_6:
          keywords.length > 5
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[5].currentPosition,
              )
            : null,
        difference_6: keywords.length > 5 ? keywords[5].difference : null,
        device_6: keywords.length > 5 ? keywords[5].device : null,
        keyword_name_7: keywords.length > 6 ? keywords[6].keywordName : null,
        keyword_project_name_7:
          keywords.length > 6 ? keywords[6].projectName : null,
        previous_position_7:
          keywords.length > 6
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[6].previousPosition,
              )
            : null,
        current_position_7:
          keywords.length > 6
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[6].currentPosition,
              )
            : null,
        difference_7: keywords.length > 6 ? keywords[6].difference : null,
        device_7: keywords.length > 6 ? keywords[6].device : null,
        keyword_name_8: keywords.length > 7 ? keywords[7].keywordName : null,
        keyword_project_name_8:
          keywords.length > 7 ? keywords[7].projectName : null,
        previous_position_8:
          keywords.length > 7
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[7].previousPosition,
              )
            : null,
        current_position_8:
          keywords.length > 7
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[7].currentPosition,
              )
            : null,
        difference_8: keywords.length > 7 ? keywords[7].difference : null,
        device_8: keywords.length > 7 ? keywords[7].device : null,
        keyword_name_9: keywords.length > 8 ? keywords[8].keywordName : null,
        keyword_project_name_9:
          keywords.length > 8 ? keywords[8].projectName : null,
        previous_position_9:
          keywords.length > 8
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[8].previousPosition,
              )
            : null,
        current_position_9:
          keywords.length > 8
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[8].currentPosition,
              )
            : null,
        difference_9: keywords.length > 8 ? keywords[8].difference : null,

        device_9: keywords.length > 8 ? keywords[8].device : null,
        keyword_name_10: keywords.length > 9 ? keywords[9].keywordName : null,
        keyword_project_name_10:
          keywords.length > 9 ? keywords[9].projectName : null,
        previous_position_10:
          keywords.length > 9
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[9].previousPosition,
              )
            : null,
        current_position_10:
          keywords.length > 9
            ? definingTypeOfPositionDisplayForATemplateHelper(
                keywords[9].currentPosition,
              )
            : null,
        difference_10: keywords.length > 9 ? keywords[9].difference : null,
        device_10: keywords.length > 9 ? keywords[9].device : null,
      },
    };
  }

  /**
   * Creates an email template for project alert specifically for Google local rank changes.
   *
   * @param {ProjectAlertsToEmailsForGoogleLocalType} data - Object containing the necessary information to populate the template.
   * @return {Promise<EmailLetterTemplateType>} - A promise that resolves to the email template object.
   */
  async createProjectAlertTemplateForLocal(
    data: ProjectAlertsToEmailsForGoogleLocalType,
  ): Promise<EmailLetterTemplateType> {
    return {
      templateId: this.configService.get(
        ConfigEnvEnum.GOOGLE_LOCAL_RANK_CHANGE_FOR_PROJECT_TEMPLATE,
      ),
      templateModel: {
        product_url: 'product_url_Value',
        product_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        action_url: data.actionUrl,
        link_to_list_of_triggered_alert: data.linkToListOfTriggeredAlert,
        company_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        company_address: this.configService.get(ConfigEnvEnum.COMPANY_ADDRESS),
        project_name: data.projectName,
        business_name: data.businessName,
        business_url: data.businessUrl,
        location: data.location,
        affected: data.affected,
        rule: data.rule,
        threshold: data.threshold,
        date: data.date,
        link_to_alert_by_product: data.linkToAlertByProduct,
        device_type: data.deviceType,
      },
    };
  }

  /**
   * Creates an alert email template for Google Maps project alerts.
   *
   * @param {ProjectAlertsToEmailsForGoogleLocalType} data - The data for the alert email template.
   * @return {Promise<EmailLetterTemplateType>} - Returns a promise that resolves to the email template.
   */
  async createProjectAlertTemplateForGoogleMaps(
    data: ProjectAlertsToEmailsForGoogleLocalType,
  ): Promise<EmailLetterTemplateType> {
    return {
      templateId: this.configService.get(
        ConfigEnvEnum.GOOGLE_MAPS_RANK_CHANGE_FOR_PROJECT,
      ),
      templateModel: {
        product_url: 'product_url_Value',
        product_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        action_url: data.actionUrl,
        link_to_list_of_triggered_alert: data.linkToListOfTriggeredAlert,
        company_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        company_address: this.configService.get(ConfigEnvEnum.COMPANY_ADDRESS),
        project_name: data.projectName,
        business_name: data.businessName,
        business_url: data.businessUrl,
        location: data.location,
        affected: data.affected,
        rule: data.rule,
        threshold: data.threshold,
        date: data.date,
        link_to_alert_by_product: data.linkToAlertByProduct,
        device_type: data.deviceType,
      },
    };
  }

  /**
   * Creates an email template for project alerts based on the provided data.
   *
   * @param {ProjectAlertsToEmailsType} data - The data required to create the email template including action URL, project name, domain, location, affected entities, rule, threshold, date, and link information.
   * @return {Promise<EmailLetterTemplateType>} A promise that resolves to the generated email letter template.
   */
  async createProjectAlertTemplate(
    data: ProjectAlertsToEmailsType,
  ): Promise<EmailLetterTemplateType> {
    return {
      templateId: this.configService.get(
        ConfigEnvEnum.ALERT__BY_PROJECT_TEMPLATE_ID,
      ),
      templateModel: {
        product_url: 'product_url_Value',
        product_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        action_url: data.actionUrl,
        link_to_list_of_triggered_alert: data.linkToListOfTriggeredAlert,
        company_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        company_address: this.configService.get(ConfigEnvEnum.COMPANY_ADDRESS),
        project_name: data.projectName,
        domain: data.domain,
        location: data.location,
        affected: data.affected,
        rule: data.rule,
        threshold: data.threshold,
        date: data.date,
        link_to_alert_by_product: data.linkToAlertByProduct,
        device_type: data.deviceType,
      },
    };
  }

  /**
   * Creates an email template for notifying the user that their trial period is over.
   *
   * @param {EmailUserType} user - The user object containing the necessary details for the template.
   * @return {Promise<EmailLetterTemplateType>} A promise that resolves to the email template object.
   */
  async createATemplateAnEmailThatTrialPeriodIsOver(
    user: EmailUserType,
  ): Promise<EmailLetterTemplateType> {
    return {
      templateId: this.configService.get(
        ConfigEnvEnum.TRIAL_PERIOD_IS_OVER_TEMPLATE_ID,
      ),
      templateModel: {
        product_url: this.configService.get(ConfigEnvEnum.APP_FRONTEND_URL),
        product_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        name: user.first_name,
        company_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        company_address: this.configService.get(ConfigEnvEnum.COMPANY_ADDRESS),
        action_url: `${this.configService.get(
          ConfigEnvEnum.APP_FRONTEND_URL,
        )}/upgrade-plan`,
      },
    };
  }

  /**
   * Creates an email template that informs the user their trial period is ending.
   *
   * @param {EmailUserType} user - The user information to personalize the email template.
   *
   * @return {Promise<EmailLetterTemplateType>} A promise that resolves to the email template for the trial period ending notification.
   */
  async createATemplateAnEmailThatTrialPeriodIsEnding(
    user: EmailUserType,
  ): Promise<EmailLetterTemplateType> {
    return {
      templateId: this.configService.get(
        ConfigEnvEnum.TRIAL_PERIOD_ENDS_ID_TEMPLATE,
      ),
      templateModel: {
        product_url: this.configService.get(ConfigEnvEnum.APP_FRONTEND_URL),
        product_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        trial_remaining_days: '2',
        name: user.first_name,
        company_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        company_address: this.configService.get(ConfigEnvEnum.COMPANY_ADDRESS),
        account_upgrade_link: `${this.configService.get(
          ConfigEnvEnum.APP_FRONTEND_URL,
        )}/upgrade-plan`,
      },
    };
  }

  /**
   * Creates an email template notifying the user about a successful email change.
   *
   * @param {string} oldEmail - The previous email address of the user.
   * @param {UserEntity} user - The user whose email has been changed.
   * @return {Promise<EmailLetterTemplateType>} A Promise that resolves to the email template type.
   */
  async createATemplateAboutASuccessfulEmailChange(
    oldEmail: string,
    user: UserEntity,
  ): Promise<EmailLetterTemplateType> {
    return {
      templateId: this.configService.get(
        ConfigEnvEnum.YOUR_SERPNEST_EMAIL_ADDRESS_HAS_BEEN_SUCCESSFULLY_CHANGED_TEMPLATE_ID,
      ),
      templateModel: {
        product_url: this.configService.get(ConfigEnvEnum.APP_FRONTEND_URL),
        product_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        name: user.firstName,
        old_email: oldEmail,
        new_email: user.email,
        company_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        company_address: this.configService.get(ConfigEnvEnum.COMPANY_ADDRESS),
      },
    };
  }

  /**
   * Generates an email template for confirming a new email address.
   *
   * @param {UserEntity} user - The user entity which contains user details needed for the template.
   * @return {Promise<EmailLetterTemplateType>} The generated email template containing the necessary templateId and templateModel.
   */
  async createATemplateForConfirmingNewEmail(
    user: UserEntity,
  ): Promise<EmailLetterTemplateType> {
    return {
      templateId: this.configService.get(
        ConfigEnvEnum.VERIFY_YOUR_NEW_EMAIL_ADDRESS_FOR_SERPNEST_TEMPLATE_ID,
      ),
      templateModel: {
        product_url: this.configService.get(ConfigEnvEnum.APP_FRONTEND_URL),
        product_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        name: user.firstName,
        Verify_New_Email_Address_Link: `${this.configService.get(
          ConfigEnvEnum.APP_FRONTEND_URL,
        )}/confirm-email/${user.emailConfirmationToken}`,
        company_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        company_address: this.configService.get(ConfigEnvEnum.COMPANY_ADDRESS),
      },
    };
  }

  /**
   * Creates an email template for changing the user's email.
   *
   * @param {UserEntity} user - The user entity containing user details.
   * @param {string} newEmail - The new email address to be confirmed.
   * @return {Promise<EmailLetterTemplateType>} A promise that resolves to an email template for confirming the email change.
   */
  async createATemplateToChangeEmail(
    user: UserEntity,
    newEmail: string,
  ): Promise<EmailLetterTemplateType> {
    return {
      templateId: this.configService.get(
        ConfigEnvEnum.CONFIRM_YOUR_SERPNEST_EMAIL_CHANGE_REQUEST_TEMPLATE_ID,
      ),
      templateModel: {
        product_url: this.configService.get(ConfigEnvEnum.APP_FRONTEND_URL),
        product_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        name: user.firstName,
        confirm_email_change_link: `${this.configService.get(
          ConfigEnvEnum.APP_FRONTEND_URL,
        )}/email-change-confirmation/${
          user.emailConfirmationToken
        }?newEmail=${newEmail}`,
        company_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        company_address: this.configService.get(ConfigEnvEnum.COMPANY_ADDRESS),
      },
    };
  }

  /**
   * Creates a template for notification that a user has been deleted.
   *
   * @param {UserEntity} user - The user entity that has been deleted.
   * @param {UserEntity} admin - The admin user entity who performed the deletion.
   * @return {Promise<EmailLetterTemplateType>} The email template for the user deletion notification.
   */
  async createUserHasBeenDeletedTemplate(
    user: UserEntity,
    admin: UserEntity,
  ): Promise<EmailLetterTemplateType> {
    return {
      templateId: this.configService.get(
        ConfigEnvEnum.USER_HAS_BEEN_DELETED_TEMPLATE_ID,
      ),
      templateModel: {
        product_url: this.configService.get(ConfigEnvEnum.APP_FRONTEND_URL),
        product_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        name: user.firstName,
        invite_sender_name: admin.firstName,
        company_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        company_address: this.configService.get(ConfigEnvEnum.COMPANY_ADDRESS),
      },
    };
  }

  /**
   * Creates an email notification template for an account permission change.
   *
   * @param {AccountUserEntity} userAccount - The user account entity whose permissions were changed.
   * @param {RoleEntity} newRole - The new role assigned to the user account.
   * @param {UserEntity} admin - The admin user who made the role change.
   * @return {Promise<EmailLetterTemplateType>} A promise that resolves to the email letter template type.
   */
  async createAccountPermissionChangeNotificationTemplate(
    userAccount: AccountUserEntity,
    newRole: RoleEntity,
    admin: UserEntity,
  ): Promise<EmailLetterTemplateType> {
    return {
      templateId: this.configService.get(
        ConfigEnvEnum.ACCOUNT_PERMISSION_CHANGE_NOTIFICATION_TEMPLATE_ID,
      ),
      templateModel: {
        product_url: this.configService.get(ConfigEnvEnum.APP_FRONTEND_URL),
        product_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        name: userAccount.user.firstName,
        invite_sender_name: admin.firstName,
        previous_role: userAccount.role.name,
        new_role: newRole.name,
        role_change_timedate: new Date().toString(),
        company_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        company_address: this.configService.get(ConfigEnvEnum.COMPANY_ADDRESS),
        user_role: 'user_role_Value',
      },
    };
  }

  /**
   * Creates an email invitation template for an existing user.
   *
   * @param {string} firstName - The first name of the user being invited.
   * @param {string} adminName - The name of the admin sending the invitation.
   * @param {RoleEnum} roleName - The role assigned to the user being invited.
   * @return {Promise<EmailLetterTemplateType>} A promise that resolves to an email letter template.
   */
  async createExistingUserInvitationTemplate(
    firstName: string,
    adminName: string,
    roleName: RoleEnum,
  ): Promise<EmailLetterTemplateType> {
    return {
      templateId: this.configService.get(
        ConfigEnvEnum.EXISTING_USER_INVITATION_TEMPLATE_ID,
      ),
      templateModel: {
        product_url: 'product_url_Value',
        product_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        name_Value: firstName,
        invite_sender_name: adminName,
        user_role: roleName,
        company_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        company_address: this.configService.get(ConfigEnvEnum.COMPANY_ADDRESS),
        name: 'name_Value',
      },
    };
  }

  /**
   * Creates an email template for user invitations.
   *
   * @param {string} adminName - The name of the admin sending the invitation.
   * @return {Promise<EmailLetterTemplateType>} A promise that resolves to the email template for user invitations.
   */
  async createUserInvitationTemplate(
    adminName: string,
  ): Promise<EmailLetterTemplateType> {
    return {
      templateId: this.configService.get(
        ConfigEnvEnum.USER_INVITATION_TEMPLATE_ID,
      ),
      templateModel: {
        product_url: 'product_url_Value',
        product_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        invite_sender_name: adminName,
        action_url: `${this.configService.get(
          ConfigEnvEnum.APP_FRONTEND_URL,
        )}/signup`,
        action_login: `${this.configService.get(
          ConfigEnvEnum.APP_FRONTEND_URL,
        )}/login`,
        help_url: 'help_url_Value',
        company_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        company_address: this.configService.get(ConfigEnvEnum.COMPANY_ADDRESS),
        name: 'name_Value',
        invite_sender_organization_name:
          'invite_sender_organization_name_Value',
      },
    };
  }
  /**
   * Creates an email template for completely deleting an account.
   *
   * @param {string} username - The first name of the account holder.
   * @return {Promise<EmailLetterTemplateType>} - A promise that resolves with the email template data.
   */
  async createCompletelyDeletingAccountTemplate(
    username: string,
  ): Promise<EmailLetterTemplateType> {
    return {
      templateId: this.configService.get(
        ConfigEnvEnum.FINAL_CONFIRMATION_ACCOUNT_DELETED_TEMPLATE_ID,
      ),
      templateModel: {
        name: username,
        product_url: 'product_url_Value',
        product_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        company_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        company_address: 'company_address_Value',
        action_url: 'action_url_Value',
        operating_system: 'operating_system_Value',
        browser_name: 'browser_name_Value',
        support_url: 'support_url_Value',
      },
    };
  }
  /**
   * Generates an email template for account deletion.
   *
   * @param {string} first_name - The first name of the account holder.
   * @return {Promise<EmailLetterTemplateType>} A promise that resolves to an object containing the template ID and template model.
   */
  async createDeletingAccountTemplate(
    username: string,
  ): Promise<EmailLetterTemplateType> {
    return {
      templateId: this.configService.get(
        ConfigEnvEnum.DELETING_ACCOUNT_TEMPLATE_ID,
      ),
      templateModel: {
        product_url: 'product_url_Value',
        product_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        name: username,
        company_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        company_address: this.configService.get(ConfigEnvEnum.COMPANY_ADDRESS),
        action_url: 'action_url_Value',
        operating_system: 'operating_system_Value',
        browser_name: 'browser_name_Value',
        support_url: 'support_url_Value',
      },
    };
  }
  /**
   * Creates an email template for deleting an account.
   *
   * @param {string} firstName - The first name of the account holder.
   * @return {Promise<EmailLetterTemplateType>} The email template for account deletion.
   */
  async createTemplateForDeletingAnAccount(
    firstName: string,
  ): Promise<EmailLetterTemplateType> {
    return {
      templateId: this.configService.get(
        ConfigEnvEnum.ACCOUNT_DELETION_REQUEST_TEMPLATE_ID,
      ),
      templateModel: {
        name: firstName,
      },
    };
  }

  /**
   * Creates a reset password email template for a given user.
   *
   * @param {UserEntity} user - The user entity containing the reset token and user details.
   * @return {Promise<EmailLetterTemplateType>} Returns a promise that resolves to an email template.
   */
  async createResetPasswordTemplate(
    user: UserEntity,
  ): Promise<EmailLetterTemplateType> {
    return {
      templateId: this.configService.get(
        ConfigEnvEnum.PASSWORD_RESET_TEMPLATE_ID,
      ),
      templateModel: {
        link: `${this.configService.get<string>(
          ConfigEnvEnum.APP_FRONTEND_URL,
        )}/reset-password/${user.passwordResetConfirmationToken}`,
        name: user.firstName,
      },
    };
  }

  /**
   * Formats a given Date object into a string with the format "MMM DD, YYYY".
   *
   * @param {Date} date - The Date object to format.
   * @return {string} The formatted date string.
   */
  formatDate(date: Date): string {
    const options: any = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  }

  /**
   * Creates a welcome email template populated with the user's information and billing details.
   *
   * @param {UserEntity} user - The user entity containing user details.
   * @param {SubscriptionEntity} billingInfo - The subscription entity containing billing information.
   * @return {Promise<EmailLetterTemplateType>} A promise that resolves to the generated email template.
   */
  async createWelcomeTemplate(
    user: UserEntity,
    billingInfo: SubscriptionEntity,
  ): Promise<EmailLetterTemplateType> {
    return {
      templateId: this.configService.get(ConfigEnvEnum.WELCOME_TEMPLATE_ID),
      templateModel: {
        name: user.firstName,
        login_url: `${this.configService.get(
          ConfigEnvEnum.APP_FRONTEND_URL,
        )}/login`,
        action_url: `${this.configService.get(
          ConfigEnvEnum.APP_FRONTEND_URL,
        )}/login`,
        username: user.firstName,
        trial_start_date: this.formatDate(billingInfo.activationDate),
        trial_end_date: this.formatDate(billingInfo.statusUpdateDate),
        product_url: 'product_url_Value',
        product_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        trial_length: '14',
        support_email: 'support_email_Value',
        live_chat_url: 'live_chat_url_Value',
        sender_name: 'sender_name_Value',
        help_url: 'help_url_Value',
        company_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        company_address: this.configService.get(ConfigEnvEnum.COMPANY_ADDRESS),
      },
    };
  }

  /**
   * Creates a registration confirmation email template for a given user.
   *
   * @param {UserEntity} user - The user entity containing information such as the email confirmation token and first name.
   * @return {Promise<EmailLetterTemplateType>} A promise that resolves to an email template object containing the template ID and model.
   */
  async createRegistrationConfirmationTemplate(
    user: UserEntity,
  ): Promise<EmailLetterTemplateType> {
    return {
      templateId: this.configService.get(
        ConfigEnvEnum.REGISTRATION_CONFIRMATION_TEMPLATE_ID,
      ),
      templateModel: {
        link: `${this.configService.get(
          ConfigEnvEnum.APP_FRONTEND_URL,
        )}/confirm-email/${user.emailConfirmationToken}`,
        name: user.firstName,
        product_url: 'product_url_Value',
        product_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        operating_system: 'operating_system_Value',
        browser_name: 'browser_name_Value',
        support_url: 'support_url_Value',
        company_name: this.configService.get(ConfigEnvEnum.COMPANY_NAME),
        company_address: this.configService.get(ConfigEnvEnum.COMPANY_ADDRESS),
      },
    };
  }
}
