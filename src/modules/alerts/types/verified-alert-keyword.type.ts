import { IdType } from 'modules/common/types/id-type.type';
import { DeviceTypeEntity } from 'modules/device-types/entities/device-type.entity';

export interface VerifiedAlertKeywordType {
  keywordId: IdType;
  keywordName: string;
  deviceType: DeviceTypeEntity;
  initializationKeywordPositionId: IdType;
  initializationDate: Date;
  initializationPosition: number;
  currentPosition: number;
  lastKeywordPositionId: IdType;
}
