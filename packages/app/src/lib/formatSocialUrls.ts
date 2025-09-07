/**
 * Utility functions for formatting social media URLs
 */

/**
 * Formats a URL by adding https:// prefix if not present
 */
export const formatUrl = (url: string | undefined, defaultPrefix: string = 'https://'): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${defaultPrefix}${url}`;
};

/**
 * Formats a Twitter handle to X.com URL
 * @param handle - Twitter handle (e.g., "@SilviProtocol" or "SilviProtocol")
 * @returns Formatted X.com URL (e.g., "https://x.com/SilviProtocol")
 */
export const formatTwitterUrl = (handle: string | undefined): string | undefined => {
  if (!handle) return undefined;
  const cleanHandle = handle.replace('@', '');
  return `https://x.com/${cleanHandle}`;
};

/**
 * Formats an Instagram handle to Instagram URL
 * @param handle - Instagram handle (e.g., "@username" or "instagram.com/username")
 * @returns Formatted Instagram URL (e.g., "https://instagram.com/username")
 */
export const formatInstagramUrl = (handle: string | undefined): string | undefined => {
  if (!handle) return undefined;
  const cleanHandle = handle.replace('@', '').replace('instagram.com/', '');
  return `https://instagram.com/${cleanHandle}`;
};

/**
 * Formats a Discord invite to Discord URL
 * @param handle - Discord invite (e.g., "discord.gg/invite" or "discord.com/invite/invite")
 * @returns Formatted Discord URL (e.g., "https://discord.gg/invite")
 */
export const formatDiscordUrl = (handle: string | undefined): string | undefined => {
  if (!handle) return undefined;
  const cleanHandle = handle.replace('discord.gg/', '').replace('discord.com/invite/', '');
  return `https://discord.gg/${cleanHandle}`;
};

/**
 * Formats a Threads handle to Threads URL
 * @param handle - Threads handle (e.g., "@username" or "threads.net/username")
 * @returns Formatted Threads URL (e.g., "https://threads.net/username")
 */
export const formatThreadsUrl = (handle: string | undefined): string | undefined => {
  if (!handle) return undefined;
  const cleanHandle = handle.replace('@', '').replace('threads.net/', '');
  return `https://threads.net/${cleanHandle}`;
};

/**
 * Formats a Facebook handle to Facebook URL
 * @param handle - Facebook handle (e.g., "@username" or "facebook.com/username")
 * @returns Formatted Facebook URL (e.g., "https://facebook.com/username")
 */
export const formatFacebookUrl = (handle: string | undefined): string | undefined => {
  if (!handle) return undefined;
  const cleanHandle = handle.replace('facebook.com/', '').replace('@', '');
  return `https://facebook.com/${cleanHandle}`;
};

/**
 * Formats all social URLs for a collective
 */
export const formatSocialUrls = {
  website: formatUrl,
  twitter: formatTwitterUrl,
  instagram: formatInstagramUrl,
  discord: formatDiscordUrl,
  threads: formatThreadsUrl,
  facebook: formatFacebookUrl,
};
