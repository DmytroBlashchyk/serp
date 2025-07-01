import { MigrationInterface, QueryRunner } from 'typeorm';
import { GoogleDomainEntity } from 'modules/google-domains/entities/google-domain.entity';
import { CountryEntity } from 'modules/countries/entities/country.entity';

export class DeletingUnsupportedCountries1721290803438
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const repository = queryRunner.manager.getRepository(GoogleDomainEntity);
    await repository
      .createQueryBuilder('google_domains')
      .delete()
      .where('google_domains.country_name in(:...countris)', {
        countris: ['Belarus', 'Russia'],
      })
      .execute();
    const repository2 = queryRunner.manager.getRepository(CountryEntity);
    await repository2
      .createQueryBuilder('countries')
      .delete()
      .where('countries.name in(:...countris)', {
        countris: ['Belarus', 'Russia'],
      })
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
