import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { ReportTypeEntity } from 'modules/email-reports/entities/report-type.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ReportTypeEnum } from 'modules/email-reports/enums/report-type.enum';

@Injectable()
@EntityRepository(ReportTypeEntity)
export class RetortTypeRepository extends BaseRepository<ReportTypeEntity> {
  /**
   * Retrieves a report type entity based on the provided name.
   *
   * @param {ReportTypeEnum} name - The name of the report type to look for.
   * @return {Promise<ReportTypeEntity>} A promise that resolves to the report type entity, if found.
   */
  async getReportTypeByName(name: ReportTypeEnum): Promise<ReportTypeEntity> {
    return this.findOne({ where: { name } });
  }
}
