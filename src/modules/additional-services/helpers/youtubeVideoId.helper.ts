export function youtubeVideoId(url: string): string {
  return extractVideoId(url);
}

/**
 * Extracts the YouTube video ID from a given URL.
 *
 * @param {string} url - The URL of the YouTube video.
 * @return {string|null} The video ID if found, otherwise null.
 */
function extractVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|\S*?[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}
