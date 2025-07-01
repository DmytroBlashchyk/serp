export class ColumnNumericTransformer {
  /**
   * Returns the provided numeric data.
   *
   * @param {number} data - The numeric value to be returned.
   * @return {number} The same numeric value that was provided.
   */
  to(data: number): number {
    return data;
  }

  /**
   * Converts a string representation of a number to a floating-point number.
   *
   * @param {string} data - The string to be converted to a floating-point number.
   * @return {number} The converted floating-point number.
   */
  from(data: string) {
    return parseFloat(data);
  }
}
