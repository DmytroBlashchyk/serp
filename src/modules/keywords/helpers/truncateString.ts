export function truncateFileName(fileName: string): string {
  return fileName.length > 200 ? fileName.slice(0, 200) : fileName;
}
