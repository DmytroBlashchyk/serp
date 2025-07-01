import { In, MigrationInterface, QueryRunner } from 'typeorm';
import { CountryEntity } from 'modules/countries/entities/country.entity';

export class ClearCountryTable1728273026127 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.getRepository(CountryEntity).delete({
      name: In([
        'United Nations',
        'Antarctica',
        'Ascension Island',
        'American Samoa',
        'Åland Islands',
        'St. Barthélemy',
        'Bermuda',
        'Caribbean Netherlands',
        'Bouvet Island',
        'Cocos (Keeling) Islands',
        'Clipperton Island',
        'Christmas Island',
        'Diego Garcia',
        'Ceuta & Melilla',
        'Western Sahara',
        'European Union',
        'South Georgia & South Sandwich Islands',
        'Hong Kong SAR China',
        'Heard & McDonald Islands',
        'Canary Islands',
        'British Indian Ocean Territory',
        'Isle of Man',
        'Cayman Islands',
        'St. Martin',
        'Macao SAR China',
        'Northern Mariana Islands',
        'Martinique',
        'New Caledonia',
        'Norfolk Island',
        'French Polynesia',
        'St. Pierre & Miquelon',
        'Pitcairn Islands',
        'Puerto Rico',
        'Palestinian Territories',
        'Réunion',
        'St. Helena',
        'Svalbard & Jan Mayen',
      ]),
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
