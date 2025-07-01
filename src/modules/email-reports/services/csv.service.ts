import { Injectable } from '@nestjs/common';
const converter = require('json-2-csv');

@Injectable()
export class CsvService {
  /**
   * Converts an array of objects to a CSV string.
   *
   * @param {any[]} data - The array of objects to be converted to CSV format.
   * @return {Promise<string>} A promise that resolves to a CSV formatted string.
   */
  async generateCsv(data: any[]) {
    const csv = await converter.json2csvAsync(data, {
      delimiter: {
        wrap: '"',
        field: ',',
        eol: '\n',
      },
      prependHeader: true,
      sortHeader: false,
      trimHeaderValues: true,
      trimFieldValues: true,
      useLocaleFormat: true,
    });
    return csv.replace(/\\\./g, '.');
  }
}
