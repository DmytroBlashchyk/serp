import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { TimezonesResponse } from 'modules/timezones/responses/timezones.response';
import { TimezoneEntity } from 'modules/timezones/entities/timezone.entity';

import { Injectable } from '@nestjs/common';
import { TimezoneRepository } from 'modules/timezones/repositories/timezone.repository';
const moment = require('moment-timezone');

@Injectable()
export class TimezonesResponseFactory extends BaseResponseFactory<
  TimezoneEntity[],
  TimezonesResponse
> {
  constructor(private readonly timezoneRepository: TimezoneRepository) {
    super();
  }
  async createResponse(entity: TimezoneEntity[]): Promise<TimezonesResponse> {
    const timezones = [];
    const data = [];
    for (const item of entity) {
      const now = moment.tz(item.tzCode);
      const utc = now.format('Z');
      if (utc !== item.utc) {
        const inputString = item.name;
        const resultName = inputString.replace(
          `(GMT${item.utc})`,
          `(GMT${utc})`,
        );
        data.push({ ...item, name: resultName, utc });
      }
      timezones.push({ ...item, utc });
    }
    if (data.length > 0) {
      await this.timezoneRepository.save(data);
    }
    return new TimezonesResponse({
      items: timezones,
    });
  }
}
