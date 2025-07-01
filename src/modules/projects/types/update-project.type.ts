import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { CompetitorBusinessRequest } from 'modules/projects/requests/competitor-business.request';

export interface UpdateProjectType {
  projectId: IdType;
  accountId: IdType;
  user: UserPayload;
  projectName?: string;
  url?: string;
  checkFrequency?: CheckFrequencyEnum;
  competitors?: string[];
  businessCompetitors?: CompetitorBusinessRequest[];
  competitorIds: IdType[];
  tags?: string[];
  tagIds?: IdType[];
  note?: string;
  keywords?: string[];
  deviceType?: DeviceTypesEnum;
}
