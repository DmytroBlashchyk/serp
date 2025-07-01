import { DeepPartial } from 'typeorm';

export abstract class BaseResponse<T = unknown> {
  constructor(object: DeepPartial<T>) {
    Object.assign(this, object);
  }
}
