import { Injectable } from '@nestjs/common';
import { ProjectAlertsToEmailsType } from 'modules/mailing/types/project-alerts-to-emails.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { TriggerEntity } from 'modules/triggers/entities/trigger.entity';
import { DataOfProjectKeywordsHitByTriggerRuleType } from 'modules/alerts/types/data-of-project-keywords-hit-by-trigger-rule.type';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { CryptoUtilsService } from 'modules/common/services/crypto-utils.service';
import { TriggerTypeEnum } from 'modules/triggers/enums/trigger-type.enum';
import { AlertEntity } from 'modules/alerts/entities/alert.entity';

@Injectable()
export class ProjectAlertsToEmailsTransformer {
  constructor(
    private readonly configService: ConfigService,
    private readonly cryptoUtilsService: CryptoUtilsService,
  ) {}
  /**
   * Transforms the provided trigger, keywords, and alert into a ProjectAlertsToEmailsType object.
   *
   * @param {TriggerEntity} trigger - The trigger entity containing project information and rule details.
   * @param {DataOfProjectKeywordsHitByTriggerRuleType[]} keywords - An array of keywords hit by the trigger rule.
   * @param {AlertEntity} alert - The alert entity associated with the trigger.
   * @return {Promise<ProjectAlertsToEmailsType>} - A promise that resolves to a ProjectAlertsToEmailsType object.
   */
  async transform(
    trigger: TriggerEntity,
    keywords: DataOfProjectKeywordsHitByTriggerRuleType[],
    alert: AlertEntity,
  ): Promise<ProjectAlertsToEmailsType> {
    let deviceType = '';
    for (const keyword of keywords) {
      if (deviceType !== '' && deviceType !== keyword.device_type_name) {
        deviceType = DeviceTypesEnum.DesktopAndMobile;
      } else {
        deviceType = keyword.device_type_name;
      }
    }
    return {
      projectName: trigger.project.projectName,
      domain: trigger.project.url,
      location: `${
        trigger.project.region
          ? trigger.project.region.countryName
          : trigger.project.location.locationName
      } (${trigger.project.searchEngine.name}) - ${
        trigger.project.language.name
      }`,
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
      deviceType: deviceType as DeviceTypesEnum,
      actionUrl: `${this.configService.get(
        ConfigEnvEnum.APP_FRONTEND_URL,
      )}/projects/${this.cryptoUtilsService.encryptData(
        trigger.project.id.toString(),
      )}`,
    };
  }
}
