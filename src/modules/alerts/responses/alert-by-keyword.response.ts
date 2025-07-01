import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { TriggerRuleResponse } from 'modules/triggers/responses/trigger-rule.response';
import { BaseResponse } from 'modules/common/responses/base.response';
import { QuantityProperty } from 'modules/common/decorators/quantity-property.decorator';
import { DeviceTypeResponse } from 'modules/device-types/responses/device-type.response';

export class AlertByKeywordResponse extends BaseResponse<AlertByKeywordResponse> {
  @ResponseProperty()
  date: string;

  @ResponseProperty()
  dateFullFormat: string;

  @IdProperty()
  id: IdType;

  @IdProperty()
  keywordId: IdType;

  @ResponseProperty()
  keywordName: string;

  @IdProperty()
  projectId: IdType;

  @ResponseProperty()
  projectName: string;

  @ResponseProperty({ nullable: true })
  favicon?: string;

  @QuantityProperty()
  previousRank: number;

  @ResponseProperty()
  previousDate: string;

  @QuantityProperty()
  newRank: number;

  @ResponseProperty()
  newDate: string;

  @QuantityProperty()
  difference: number;

  @ResponseProperty({ cls: TriggerRuleResponse })
  rule: TriggerRuleResponse;

  @QuantityProperty()
  threshold: number;

  @ResponseProperty({ cls: DeviceTypeResponse })
  deviceType: DeviceTypeResponse;

  @ResponseProperty()
  viewed: boolean;

  @ResponseProperty()
  positiveChanges: boolean;
}
