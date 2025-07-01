import { BaseQueue } from 'modules/queue/queues/base.queue';
import { Process, Processor } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { DataForSeoService } from 'modules/additional-services/services/data-for-seo.service';
import { LocationRepository } from 'modules/countries/repositories/location.repository';
import { LocationEntity } from 'modules/countries/entities/location.entity';
import { Job } from 'bull';

@Processor(Queues.Locations)
export class LocationsQueue extends BaseQueue {
  constructor(
    protected readonly cliLoggingService: CliLoggingService,
    private readonly dataForSeoService: DataForSeoService,
    private readonly locationRepository: LocationRepository,
  ) {
    super(cliLoggingService);
  }

  @Process({
    name: QueueEventEnum.AddNewKeywordDataLocationsForBing,
    concurrency: 5,
  })
  async addNewKeywordDataLocationsForBing(job: Job): Promise<void> {
    this.cliLoggingService.log('Start: AddNewKeywordDataLocationsForBing');
    try {
      const locations =
        await this.dataForSeoService.keywordDataLocationsForBing();
      const allLocations = await this.locationRepository.find();
      const batchSize = 1000;

      for (let i = 0; i < locations.length; i += batchSize) {
        const batch = locations.slice(i, i + batchSize);
        const filteredBatch = batch.filter(
          (secondObj) =>
            !allLocations.some(
              (firstObj) => firstObj.locationCode == secondObj.location_code,
            ),
        );

        const transformedBatch = filteredBatch.map((item) => {
          return {
            locationName: item.location_name,
            locationCode: item.location_code,
            locationCodeParent: item.location_code_parent,
            countryIsoCode: item.country_iso_code,
            locationType: item.location_type,
            keywordDataBing: true,
          };
        });
        await job.progress((i / locations.length) * 100);
        if (transformedBatch.length) {
          await this.locationRepository.save(transformedBatch);
        }
        this.cliLoggingService.log((i / locations.length) * 100);
      }
      this.cliLoggingService.log('Finish: AddNewKeywordDataLocationsForBing');
    } catch (error) {
      this.cliLoggingService.error(
        `Error: AddNewKeywordDataLocationsForBing`,
        error,
      );
    }
  }

  @Process({
    name: QueueEventEnum.AddNewKeywordDataLocationsForGoogle,
    concurrency: 5,
  })
  async addNewKeywordDataLocationsForGoogle(job: Job): Promise<void> {
    this.cliLoggingService.log('Start: AddNewKeywordDataLocationsForGoogle');
    try {
      const locations =
        await this.dataForSeoService.keywordDataLocationsForGoogle();
      const allLocations = await this.locationRepository.find();
      const batchSize = 1000;

      for (let i = 0; i < locations.length; i += batchSize) {
        const batch = locations.slice(i, i + batchSize);
        const filteredBatch = batch.filter(
          (secondObj) =>
            !allLocations.some(
              (firstObj) => firstObj.locationCode == secondObj.location_code,
            ),
        );
        const transformedBatch = filteredBatch.map((item) => {
          return {
            locationName: item.location_name,
            locationCode: item.location_code,
            locationCodeParent: item.location_code_parent,
            countryIsoCode: item.country_iso_code,
            locationType: item.location_type,
            keywordData: true,
          };
        });
        await job.progress((i / locations.length) * 100);
        if (transformedBatch.length) {
          await this.locationRepository.save(transformedBatch);
        }
        this.cliLoggingService.log((i / locations.length) * 100);
      }
      this.cliLoggingService.log('Finish: AddNewKeywordDataLocationsForGoogle');
    } catch (error) {
      this.cliLoggingService.error(
        `Error: AddNewKeywordDataLocationsForGoogle`,
        error,
      );
    }
  }

  @Process({
    name: QueueEventEnum.AddNewLocationsForBingSERP,
    concurrency: 5,
  })
  async addNewLocationsForBingSERP(job: Job): Promise<void> {
    this.cliLoggingService.log('Start: AddNewLocationsForBingSERP');
    try {
      const locations = await this.dataForSeoService.locationsForBing();
      const allLocations = await this.locationRepository.find();
      const batchSize = 1000;

      for (let i = 0; i < locations.length; i += batchSize) {
        const batch = locations.slice(i, i + batchSize);
        const filteredBatch = batch.filter(
          (secondObj) =>
            !allLocations.some(
              (firstObj) => firstObj.locationCode == secondObj.location_code,
            ),
        );
        const transformedBatch = filteredBatch.map((item) => {
          return {
            locationName: item.location_name,
            locationCode: item.location_code,
            locationCodeParent: item.location_code_parent,
            countryIsoCode: item.country_iso_code,
            locationType: item.location_type,
            serpBing: true,
          };
        });
        await job.progress((i / locations.length) * 100);
        if (transformedBatch.length) {
          await this.locationRepository.save(transformedBatch);
        }
        this.cliLoggingService.log((i / locations.length) * 100);
      }
      this.cliLoggingService.log('Finish: AddNewLocationsForBingSERP');
    } catch (error) {
      this.cliLoggingService.error(`Error: AddNewLocationsForBingSERP`, error);
    }
  }

  @Process({
    name: QueueEventEnum.AddNewLocationsForYahooSERP,
    concurrency: 5,
  })
  async addNewLocationsForYahooSERP(job: Job): Promise<void> {
    this.cliLoggingService.log('Start: AddNewLocationsForYahooSERP');
    try {
      const locations = await this.dataForSeoService.locationsForYahoo();
      const allLocations = await this.locationRepository.find();
      const batchSize = 1000;

      for (let i = 0; i < locations.length; i += batchSize) {
        const batch = locations.slice(i, i + batchSize);
        const filteredBatch = batch.filter(
          (secondObj) =>
            !allLocations.some(
              (firstObj) => firstObj.locationCode == secondObj.location_code,
            ),
        );
        const transformedBatch = filteredBatch.map((item) => {
          return {
            locationName: item.location_name,
            locationCode: item.location_code,
            locationCodeParent: item.location_code_parent,
            countryIsoCode: item.country_iso_code,
            locationType: item.location_type,
            serpYahoo: true,
          };
        });
        await job.progress((i / locations.length) * 100);
        if (transformedBatch.length) {
          await this.locationRepository.save(transformedBatch);
        }
        this.cliLoggingService.log((i / locations.length) * 100);
      }
      this.cliLoggingService.log('Finish: AddNewLocationsForYahooSERP');
    } catch (error) {
      this.cliLoggingService.error(`Error: AddNewLocationsForYahooSERP`, error);
    }
  }

  @Process({
    name: QueueEventEnum.AddNewLocationsForBaiduSERP,
    concurrency: 5,
  })
  async addNewLocationsForBaiduSERP(job: Job): Promise<void> {
    this.cliLoggingService.log('Start: AddNewLocationsForBaiduSERP');
    try {
      const locations = await this.dataForSeoService.locationsForBaidu();

      const allLocations = await this.locationRepository.find();
      const batchSize = 1000;

      for (let i = 0; i < locations.length; i += batchSize) {
        const batch = locations.slice(i, i + batchSize);
        const filteredBatch = batch.filter(
          (secondObj) =>
            !allLocations.some(
              (firstObj) => firstObj.locationCode == secondObj.location_code,
            ),
        );
        const transformedBatch = filteredBatch.map((item) => {
          return {
            locationName: item.location_name,
            locationCode: item.location_code,
            locationCodeParent: item.location_code_parent,
            countryIsoCode: item.country_iso_code,
            locationType: item.location_type,
            serpBaidu: true,
          };
        });

        await job.progress((i / locations.length) * 100);
        if (transformedBatch.length) {
          await this.locationRepository.save(transformedBatch);
        }
        this.cliLoggingService.log((i / locations.length) * 100);
      }
      this.cliLoggingService.log('Finish: AddNewLocationsForBaiduSERP');
    } catch (error) {
      this.cliLoggingService.error(`Error: AddNewLocationsForBaiduSERP`, error);
    }
  }

  @Process({
    name: QueueEventEnum.AddNewLocationsForYoutubeSERP,
    concurrency: 5,
  })
  async addNewLocationsForYoutubeSERP(job: Job): Promise<void> {
    this.cliLoggingService.log('Start: AddNewLocationsForYoutubeSERP');
    try {
      const locations = await this.dataForSeoService.locationsForYoutube();
      const allLocations = await this.locationRepository.find();
      const batchSize = 1000;

      for (let i = 0; i < locations.length; i += batchSize) {
        const batch = locations.slice(i, i + batchSize);
        const filteredBatch = batch.filter(
          (secondObj) =>
            !allLocations.some(
              (firstObj) => firstObj.locationCode == secondObj.location_code,
            ),
        );
        const transformedBatch = filteredBatch.map((item) => {
          return {
            locationName: item.location_name,
            locationCode: item.location_code,
            locationCodeParent: item.location_code_parent,
            countryIsoCode: item.country_iso_code,
            locationType: item.location_type,
            serpYouTube: true,
          };
        });

        await job.progress((i / locations.length) * 100);
        if (transformedBatch.length) {
          await this.locationRepository.save(transformedBatch);
        }
        this.cliLoggingService.log((i / locations.length) * 100);
      }
      this.cliLoggingService.log('Finish: AddNewLocationsForYoutubeSERP');
    } catch (error) {
      this.cliLoggingService.error(
        `Error: AddNewLocationsForYoutubeSERP`,
        error,
      );
    }
  }

  @Process({
    name: QueueEventEnum.AddNewLocationsForGoogleSERP,
    concurrency: 5,
  })
  async addNewLocationsForGoogleSERP(job: Job): Promise<void> {
    this.cliLoggingService.log('Start: AddNewLocationsForGoogleSERP');
    try {
      const locations = await this.dataForSeoService.locationsForGoogle();
      const allLocations = await this.locationRepository.find();
      const batchSize = 1000;

      for (let i = 0; i < locations.length; i += batchSize) {
        const batch = locations.slice(i, i + batchSize);
        const filteredBatch = batch.filter(
          (secondObj) =>
            !allLocations.some(
              (firstObj) => firstObj.locationCode == secondObj.location_code,
            ),
        );
        const transformedBatch = filteredBatch.map((item) => {
          return {
            locationName: item.location_name,
            locationCode: item.location_code,
            locationCodeParent: item.location_code_parent,
            countryIsoCode: item.country_iso_code,
            locationType: item.location_type,
            serp: true,
          };
        });
        await job.progress((i / locations.length) * 100);
        if (transformedBatch.length) {
          await this.locationRepository.save(transformedBatch);
        }
        this.cliLoggingService.log((i / locations.length) * 100);
      }
      this.cliLoggingService.log('Finish: AddNewLocationsForGoogleSERP');
    } catch (error) {
      this.cliLoggingService.error(
        `Error: AddNewLocationsForGoogleSERP`,
        error,
      );
    }
  }

  @Process({
    name: QueueEventEnum.UpdateKeywordDataLocationsForBing,
    concurrency: 5,
  })
  async updateLocationsForBingKeywordData(job: Job): Promise<void> {
    this.cliLoggingService.log('Start: UpdateKeywordDataLocationsForBing');

    try {
      const locations =
        await this.dataForSeoService.keywordDataLocationsForBing();
      const allLocations = await this.locationRepository.find();
      const batchSize = 1000;

      for (let i = 0; i < locations.length; i += batchSize) {
        const batch = locations.slice(i, i + batchSize);
        const serpForGoogle = this.filterBatchLocations(batch, allLocations);
        const progressPercentage = (i / locations.length) * 100;

        await job.progress(progressPercentage);
        if (serpForGoogle.length) {
          await this.updateKeywordDataLocationsForBing(serpForGoogle);
        }
        this.cliLoggingService.log(progressPercentage);
      }
      this.cliLoggingService.log('Finish: UpdateKeywordDataLocationsForGoogle');
    } catch (error) {
      this.cliLoggingService.error(
        `Error: UpdateKeywordDataLocationsForGoogle`,
        error,
      );
    }
  }

  @Process({
    name: QueueEventEnum.UpdateKeywordDataLocationsForGoogle,
    concurrency: 5,
  })
  async updateLocationsForGoogleKeywordData(job: Job): Promise<void> {
    this.cliLoggingService.log('Start: UpdateKeywordDataLocationsForGoogle');

    try {
      const locations =
        await this.dataForSeoService.keywordDataLocationsForGoogle();
      const allLocations = await this.locationRepository.find();
      const batchSize = 1000;

      for (let i = 0; i < locations.length; i += batchSize) {
        const batch = locations.slice(i, i + batchSize);
        const serpForGoogle = this.filterBatchLocations(batch, allLocations);
        const progressPercentage = (i / locations.length) * 100;

        await job.progress(progressPercentage);
        if (serpForGoogle.length) {
          await this.updateKeywordDataLocationsForGoogle(serpForGoogle);
        }
        this.cliLoggingService.log(progressPercentage);
      }
      this.cliLoggingService.log('Finish: UpdateKeywordDataLocationsForGoogle');
    } catch (error) {
      this.cliLoggingService.error(
        `Error: UpdateKeywordDataLocationsForGoogle`,
        error,
      );
    }
  }

  @Process({
    name: QueueEventEnum.UpdateLocationsForYahooSERP,
    concurrency: 5,
  })
  async updateLocationsForYahooSERP(job: Job): Promise<void> {
    this.cliLoggingService.log('Start: UpdateLocationsForYahooSERP');

    try {
      const locations = await this.dataForSeoService.locationsForYahoo();
      const allLocations = await this.locationRepository.find();
      const batchSize = 1000;

      for (let i = 0; i < locations.length; i += batchSize) {
        const batch = locations.slice(i, i + batchSize);
        const serpForGoogle = this.filterBatchLocations(batch, allLocations);
        const progressPercentage = (i / locations.length) * 100;

        await job.progress(progressPercentage);
        if (serpForGoogle.length) {
          await this.updateSERPYahooLocations(serpForGoogle);
        }
        this.cliLoggingService.log(progressPercentage);
      }
      this.cliLoggingService.log('Finish: UpdateLanguagesForYahoo');
    } catch (error) {
      this.cliLoggingService.error(`Error: UpdateLanguagesForYahoo`, error);
    }
  }

  @Process({
    name: QueueEventEnum.UpdateLocationsForYoutubeSERP,
    concurrency: 5,
  })
  async updateLocationsForYoutubeSERP(job: Job): Promise<void> {
    this.cliLoggingService.log('Start: UpdateLocationsForYoutubeSERP');

    try {
      const locations = await this.dataForSeoService.locationsForYoutube();
      const allLocations = await this.locationRepository.find();
      const batchSize = 1000;

      for (let i = 0; i < locations.length; i += batchSize) {
        const batch = locations.slice(i, i + batchSize);
        const serpForGoogle = this.filterBatchLocations(batch, allLocations);
        const progressPercentage = (i / locations.length) * 100;

        await job.progress(progressPercentage);
        if (serpForGoogle.length) {
          await this.updateSERPYoutubeLocations(serpForGoogle);
        }
        this.cliLoggingService.log(progressPercentage);
      }
      this.cliLoggingService.log('Finish: UpdateLanguagesForYoutube');
    } catch (error) {
      this.cliLoggingService.error(`Error: UpdateLanguagesForYoutube`, error);
    }
  }

  @Process({
    name: QueueEventEnum.UpdateLocationsForBingSERP,
    concurrency: 5,
  })
  async updateLocationsForBingSERP(job: Job): Promise<void> {
    this.cliLoggingService.log('Start: UpdateLocationsForBingSERP');

    try {
      const locations = await this.dataForSeoService.locationsForBing();
      const allLocations = await this.locationRepository.find();
      const batchSize = 1000;

      for (let i = 0; i < locations.length; i += batchSize) {
        const batch = locations.slice(i, i + batchSize);
        const serpForGoogle = this.filterBatchLocations(batch, allLocations);
        const progressPercentage = (i / locations.length) * 100;

        await job.progress(progressPercentage);
        if (serpForGoogle.length) {
          await this.updateSERPBingLocations(serpForGoogle);
        }
        this.cliLoggingService.log(progressPercentage);
      }
      this.cliLoggingService.log('Finish: UpdateLanguagesForBing');
    } catch (error) {
      this.cliLoggingService.error(`Error: UpdateLanguagesForBing`, error);
    }
  }

  @Process({
    name: QueueEventEnum.UpdateLocationsForBaiduSERP,
    concurrency: 5,
  })
  async updateLocationsForBaiduSERP(job: Job): Promise<void> {
    this.cliLoggingService.log('Start: UpdateLocationsForBaiduSERP');

    try {
      const locations = await this.dataForSeoService.locationsForBaidu();
      const allLocations = await this.locationRepository.find();
      const batchSize = 1000;

      for (let i = 0; i < locations.length; i += batchSize) {
        const batch = locations.slice(i, i + batchSize);
        const serpForGoogle = this.filterBatchLocations(batch, allLocations);
        const progressPercentage = (i / locations.length) * 100;

        await job.progress(progressPercentage);
        if (serpForGoogle.length) {
          await this.updateSERPBaiduLocations(serpForGoogle);
        }
        this.cliLoggingService.log(progressPercentage);
      }
      this.cliLoggingService.log('Finish: UpdateLanguagesForBaidu');
    } catch (error) {
      this.cliLoggingService.error(`Error: UpdateLanguagesForBaidu`, error);
    }
  }

  @Process({
    name: QueueEventEnum.UpdateLocationsForGoogleSERP,
    concurrency: 5,
  })
  async updateLocationsForGoogleSERP(job: Job): Promise<void> {
    this.cliLoggingService.log('Start: UpdateLocationsForGoogleSERP');

    try {
      const locations = await this.dataForSeoService.locationsForGoogle();
      const allLocations = await this.locationRepository.find();
      const batchSize = 1000;

      for (let i = 0; i < locations.length; i += batchSize) {
        const batch = locations.slice(i, i + batchSize);
        const serpForGoogle = this.filterBatchLocations(batch, allLocations);
        const progressPercentage = (i / locations.length) * 100;

        await job.progress(progressPercentage);
        if (serpForGoogle.length) {
          await this.updateSERPGoogleLocations(serpForGoogle);
        }
        this.cliLoggingService.log(progressPercentage);
      }
      this.cliLoggingService.log('Finish: UpdateLanguagesForGoogle');
    } catch (error) {
      this.cliLoggingService.error(`Error: UpdateLanguagesForGoogle`, error);
    }
  }

  private filterBatchLocations(
    batch: {
      location_code: number;
      location_name: string;
      location_code_parent?: number;
      country_iso_code: string;
      location_type: string;
    }[],
    allLocations: LocationEntity[],
  ) {
    const serpForGoogle = [];

    for (const location of batch) {
      const findLanguage = allLocations.find(
        (item) => item.locationCode == location.location_code,
      );
      if (findLanguage) {
        serpForGoogle.push(findLanguage.id);
      }
    }

    return serpForGoogle;
  }

  private async updateKeywordDataLocationsForBing(
    serpForGoogle: number[],
  ): Promise<void> {
    const idsString = serpForGoogle.join(',');
    await this.locationRepository.query(
      `UPDATE locations SET keyword_data_bing = true WHERE id IN (${idsString})`,
    );
  }

  private async updateKeywordDataLocationsForGoogle(serpForGoogle: number[]) {
    const idsString = serpForGoogle.join(',');
    await this.locationRepository.query(
      `UPDATE locations SET keyword_data = true WHERE id IN (${idsString})`,
    );
  }

  private async updateSERPYahooLocations(serpForGoogle: number[]) {
    const idsString = serpForGoogle.join(',');
    await this.locationRepository.query(
      `UPDATE locations SET serp_yahoo = true WHERE id IN (${idsString})`,
    );
  }

  private async updateSERPYoutubeLocations(serpForGoogle: number[]) {
    const idsString = serpForGoogle.join(',');
    await this.locationRepository.query(
      `UPDATE locations SET serp_you_tube = true WHERE id IN (${idsString})`,
    );
  }

  private async updateSERPBingLocations(serpForGoogle: number[]) {
    const idsString = serpForGoogle.join(',');
    await this.locationRepository.query(
      `UPDATE locations SET serp_bing = true WHERE id IN (${idsString})`,
    );
  }

  private async updateSERPGoogleLocations(serpForGoogle: number[]) {
    const idsString = serpForGoogle.join(',');
    await this.locationRepository.query(
      `UPDATE locations SET serp = true WHERE id IN (${idsString})`,
    );
  }

  private async updateSERPBaiduLocations(serpForGoogle: number[]) {
    const idsString = serpForGoogle.join(',');
    await this.locationRepository.query(
      `UPDATE locations SET serp_baidu = true WHERE id IN (${idsString})`,
    );
  }
}
