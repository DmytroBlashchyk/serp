import { TriggerEntity } from 'modules/triggers/entities/trigger.entity';
import { DataOfProjectKeywordsHitByTriggerRuleType } from 'modules/alerts/types/data-of-project-keywords-hit-by-trigger-rule.type';
import { AlertEntity } from 'modules/alerts/entities/alert.entity';
import { Injectable } from '@nestjs/common';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { TriggerTypeEnum } from 'modules/triggers/enums/trigger-type.enum';
import { ConfigService } from '@nestjs/config';
import { CryptoUtilsService } from 'modules/common/services/crypto-utils.service';
import { KeywordAlertsToEmailsType } from 'modules/mailing/types/keyword-alerts-to-emails.type';
import { KeywordsAlertsToEmailsForGoogleLocalType } from 'modules/alerts/types/keywords-alerts-to-emails-for-google-local.type';

@Injectable()
export class KeywordsAlertsToEmailsForGoogleLocalTransformer {
  constructor(
    private readonly configService: ConfigService,
    private readonly cryptoUtilsService: CryptoUtilsService,
  ) {}
  /**
   * Transforms the provided trigger, keywords, and alert data into a structured format
   * containing keywords alerts information and metadata for email notifications.
   *
   * @param {TriggerEntity} trigger - The trigger entity that initiated the keyword alert.
   * @param {DataOfProjectKeywordsHitByTriggerRuleType[]} keywords - Array of keyword data affected by the trigger rule.
   * @param {AlertEntity} alert - The alert entity associated with this trigger.
   *
   * @return {Promise<{data: KeywordsAlertsToEmailsForGoogleLocalType, keywords: KeywordAlertsToEmailsType[]}>}
   * Returns a promise that resolves with an object containing the formatted data for email alerts
   * and the list of keywords with their respective alert details.
   */
  async transform(
    trigger: TriggerEntity,
    keywords: DataOfProjectKeywordsHitByTriggerRuleType[],
    alert: AlertEntity,
  ): Promise<{
    data: KeywordsAlertsToEmailsForGoogleLocalType;
    keywords: KeywordAlertsToEmailsType[];
  }> {
    {
      const dataKeyword = [];
      let item = 0;
      for (const keyword of keywords) {
        item += 1;
        if (item === 10) {
          break;
        }
        const difference =
          Number(keyword.previous_position) < 101
            ? Math.abs(
                Number(keyword.current_position) -
                  Number(keyword.previous_position),
              )
            : 100 - Number(keyword.current_position);
        dataKeyword.push({
          keywordName: keyword.keyword_name,
          projectId: trigger.project.id,
          projectName: trigger.project.projectName,
          previousPosition: keyword.previous_position,
          currentPosition: keyword.current_position,
          device: keyword.device_type_name,
          difference: `${
            keyword.current_position < keyword.previous_position
              ? '<img alt="up arrow" class="up_arrow" src="https://dim.mcusercontent.com/cs/29a8cb63a4a8e25e001381121/images/101ed96b-8fab-ebe1-09e0-1dadc711a149.png?w=34&dpr=2">'
              : '<img alt="down arrow" class="down_arrow" src="https://dim.mcusercontent.com/cs/29a8cb63a4a8e25e001381121/images/4975743e-6a9f-ae5d-8f94-ee4c5e14679a.png?w=34&dpr=2">'
          }${difference.toString()}`,
        });
      }
      const numberOfRemainingKeywords =
        dataKeyword.length > 10
          ? `<a href='${this.configService.get(
              ConfigEnvEnum.APP_FRONTEND_URL,
            )}/alerts?type=${
              TriggerTypeEnum.ByKeywords
            }&projectIds=${trigger.project.id.toString()}'>+${(
              dataKeyword.length - 10
            ).toString()} more (view all)</a>`
          : null;
      return {
        data: {
          affected: keywords.length.toString(),
          businessName: trigger.project.businessName,
          businessUrl: trigger.project.url,
          actionUrl: `${this.configService.get(
            ConfigEnvEnum.APP_FRONTEND_URL,
          )}/projects/${this.cryptoUtilsService.encryptData(
            trigger.project.id.toString(),
          )}`,
          alertKeywordsLink: `${this.configService.get(
            ConfigEnvEnum.APP_FRONTEND_URL,
          )}/alerts?type=${
            TriggerTypeEnum.ByKeywords
          }&projectIds=${trigger.project.id.toString()}`,
          linkToAlerts: `${this.configService.get(
            ConfigEnvEnum.APP_FRONTEND_URL,
          )}/alerts?type=${TriggerTypeEnum.ByKeywords}&projectIds=${
            trigger.project.id
          }`,
          projectName: trigger.project.projectName,
          location: `${trigger.project.location.locationName} (${trigger.project.searchEngine.name}) - ${trigger.project.language.name}`,
          rule: trigger.rule.name,
          alertId: alert.id,
          threshold: trigger.threshold.toString(),
          date: new Date(trigger.createdAt).toLocaleDateString('en', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          }),
          previousDate: new Date(trigger.createdAt).toLocaleDateString('en', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          currentDate: new Date(alert.createdAt).toLocaleDateString('en', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          numberOfRemainingKeywords,
        },
        keywords: dataKeyword,
      };
    }
  }
}
