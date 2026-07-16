/**
 * Split `array` into consecutive chunks of at most `size` items. Used by bank statement
 * templates to paginate transaction rows across printed A4 pages; `size` may arrive as a
 * float (derived from header height) so it is floored to a minimum of 1.
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunkSize = Math.max(1, Math.floor(size));
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}
