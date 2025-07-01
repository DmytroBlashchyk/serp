import { RequestInfoType } from 'modules/additional-services/types/request-info.type';
import { ResultSetType } from 'modules/additional-services/types/result-set.type';
import { BatchType } from 'modules/additional-services/types/batch.type';
import { IsObject } from 'class-validator';

export class ValueSerpRequest {
  @IsObject()
  request_info: RequestInfoType;
  @IsObject()
  result_set: ResultSetType;
  @IsObject()
  batch: BatchType;
}
