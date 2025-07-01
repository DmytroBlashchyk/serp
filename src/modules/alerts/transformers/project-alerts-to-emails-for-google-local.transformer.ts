import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CryptoUtilsService } from 'modules/common/services/crypto-utils.service';
import { TriggerEntity } from 'modules/triggers/entities/trigger.entity';
import { DataOfProjectKeywordsHitByTriggerRuleType } from 'modules/alerts/types/data-of-project-keywords-hit-by-trigger-rule.type';
import { AlertEntity } from 'modules/alerts/entities/alert.entity';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { TriggerTypeEnum } from 'modules/triggers/enums/trigger-type.enum';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { ProjectAlertsToEmailsForGoogleLocalType } from 'modules/alerts/types/project-alerts-to-emails-for-google-local.type';

@Injectable()
export class ProjectAlertsToEmailsForGoogleLocalTransformer {
  constructor(
    private readonly configService: ConfigService,
    private readonly cryptoUtilsService: CryptoUtilsService,
  ) {}

  /**
   * Transforms trigger, keywords, and alert information into a structured email alert type.
   *
   * @param {TriggerEntity} trigger - The trigger entity containing project and rule information.
   * @param {DataOfProjectKeywordsHitByTriggerRuleType[]} keywords - Array of keyword data affected by the trigger rule.
   * @param {AlertEntity} alert - The alert entity containing alert-specific details.
   * @return {Promise<ProjectAlertsToEmailsForGoogleLocalType>} The structured project alert email data.
   */
  async transform(
    trigger: TriggerEntity,
    keywords: DataOfProjectKeywordsHitByTriggerRuleType[],
    alert: AlertEntity,
  ): Promise<ProjectAlertsToEmailsForGoogleLocalType> {
    return {
      projectName: trigger.project.projectName,
      businessName: trigger.project.businessName,
      businessUrl: trigger.project.url,
      location: `${trigger.project.location.locationName} (${trigger.project.searchEngine.name}) - ${trigger.project.language.name}`,
      affected: keywords.length.toString(),
      rule: trigger.rule.name,
      threshold: trigger.threshold.toString(),
      date: new Date().toLocaleDateString('en', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      linkToAlertByProduct: `${this.configService.get(
        ConfigEnvEnum.APP_FRONTEND_URL,
      )}/alerts?type=${TriggerTypeEnum.ByProject}&projectIds=${
        trigger.project.id
      }`,
      linkToListOfTriggeredAlert: `${this.configService.get(
        ConfigEnvEnum.APP_FRONTEND_URL,
      )}/alerts?type=${
        TriggerTypeEnum.ByProject
      }&alertId=${alert.id.toString()}`,
      deviceType: DeviceTypesEnum.Desktop,
      actionUrl: `${this.configService.get(
        ConfigEnvEnum.APP_FRONTEND_URL,
      )}/projects/${this.cryptoUtilsService.encryptData(
        trigger.project.id.toString(),
      )}`,
    };
  }
}
