import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { ReportDeliveryTimeEntity } from 'modules/email-reports/entities/report-delivery-time.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';

@Injectable()
@EntityRepository(ReportDeliveryTimeEntity)
export class ReportDeliveryTimeRepository extends BaseRepository<ReportDeliveryTimeEntity> {
  /**
   * Retrieves the delivery time for a specific report based on the provided ID.
   *
   * @param {IdType} id - The unique identifier of the report.
   *
   * @return {Promise<ReportDeliveryTimeEntity>} - A promise that resolves to a ReportDeliveryTimeEntity
   * representing the delivery time of the specified report.
   */
  async getReportDeliveryTime(id: IdType): Promise<ReportDeliveryTimeEntity> {
    return this.findOne({ where: { id } });
  }
}
