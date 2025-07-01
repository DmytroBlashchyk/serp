import { Duplex } from 'stream';
/**
 * Converts a Buffer into a stream.
 *
 * @param {Buffer} buffer - The buffer to convert to a stream.
 * @returns {Duplex} A stream that represents the provided buffer.
 */
export const bufferToStream = (buffer: Buffer) => {
  const stream = new Duplex();
  stream.push(buffer);
  stream.push(null);
  return stream;
};
