// Configuration object for social platforms
const SOCIAL_PLATFORMS = {
  twitter: { baseUrl: 'https://x.com/', cleanPrefix: '@' },
  instagram: { baseUrl: 'https://instagram.com/', cleanPrefix: '@', cleanSuffix: 'instagram.com/' },
  discord: { baseUrl: 'https://discord.gg/', cleanSuffix: ['discord.gg/', 'discord.com/invite/'] },
  threads: { baseUrl: 'https://threads.net/', cleanPrefix: '@', cleanSuffix: 'threads.net/' },
  facebook: { baseUrl: 'https://facebook.com/', cleanPrefix: '@', cleanSuffix: 'facebook.com/' },
  telegram: { baseUrl: 'https://t.me/', cleanPrefix: '@', cleanSuffix: 't.me/' },
} as const;

/**
 * Generic function to clean handles by removing prefixes and suffixes
 */
const cleanHandle = (
  handle: string,
  prefixes: ReadonlyArray<string> = [],
  suffixes: ReadonlyArray<string> = []
): string => {
  let cleaned = handle;

  // Remove prefixes
  for (const prefix of prefixes) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.substring(prefix.length);
      break;
    }
  }

  // Remove suffixes
  for (const suffix of suffixes) {
    if (cleaned.includes(suffix)) {
      cleaned = cleaned.replace(suffix, '');
      break;
    }
  }

  return cleaned;
};

/**
 * Generic social URL formatter
 */
const createSocialFormatter = (config: {
  baseUrl: string;
  cleanPrefix?: string;
  cleanSuffix?: string | ReadonlyArray<string>;
}) => {
  return (handle: string | undefined): string | undefined => {
    if (!handle) return undefined;

    const prefixes = config.cleanPrefix ? [config.cleanPrefix] : [];
    const suffixes = config.cleanSuffix
      ? Array.isArray(config.cleanSuffix)
        ? config.cleanSuffix
        : [config.cleanSuffix]
      : [];

    const cleaned = cleanHandle(handle, prefixes, suffixes);
    return `${config.baseUrl}${cleaned}`;
  };
};

/**
 * Formats a URL by adding https:// prefix if not present
 */
export const formatUrl = (url: string | undefined, defaultPrefix: string = 'https://'): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${defaultPrefix}${url}`;
};

// Generate formatters for each platform
export const formatTwitterUrl = createSocialFormatter(SOCIAL_PLATFORMS.twitter);
export const formatInstagramUrl = createSocialFormatter(SOCIAL_PLATFORMS.instagram);
export const formatDiscordUrl = createSocialFormatter({
  ...SOCIAL_PLATFORMS.discord,
  cleanSuffix: [...SOCIAL_PLATFORMS.discord.cleanSuffix],
});
export const formatThreadsUrl = createSocialFormatter(SOCIAL_PLATFORMS.threads);
export const formatFacebookUrl = createSocialFormatter(SOCIAL_PLATFORMS.facebook);
export const formatTelegramUrl = createSocialFormatter(SOCIAL_PLATFORMS.telegram);

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
  telegram: formatTelegramUrl,
};

// ---------------- Validation Helpers ----------------

const normalizeUrlForValidation = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const isValidHttpUrlWithDomain = (candidate: string): boolean => {
  try {
    const normalized = normalizeUrlForValidation(candidate);
    const hasCanParse = typeof (URL as any).canParse === 'function';
    const parsed = hasCanParse ? ((URL as any).canParse(normalized) ? new URL(normalized) : null) : new URL(normalized);
    if (!parsed) return false;
    if (!(parsed.protocol === 'http:' || parsed.protocol === 'https:')) return false;
    const hostname = parsed.hostname.toLowerCase();
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(hostname)) return false;
    if (hostname.startsWith('.') || hostname.endsWith('.') || hostname.includes('..')) return false;
    return true;
  } catch {
    return false;
  }
};

// Validation configuration
const VALIDATION_CONFIG = {
  website: {
    validator: isValidHttpUrlWithDomain,
    errorMessage: 'Enter a valid website with a domain (e.g. example.com)',
  },
  twitter: {
    validator: (value: string) => {
      const handle = value.trim().replace(/^@+/, '');
      return /^[A-Za-z0-9_]{1,15}$/.test(handle);
    },
    errorMessage: 'Invalid Twitter handle (1-15 letters, numbers, or _)',
  },
  discord: {
    requiredPrefix: 'discord.gg',
    errorMessage: 'Discord link must start with discord.gg/',
  },
  telegram: {
    requiredPrefix: 't.me',
    errorMessage: 'Telegram link must start with t.me/',
  },
  facebook: {
    requiredPrefix: 'facebook.com',
    errorMessage: 'Facebook link must start with facebook.com/',
  },
  threads: {
    requiredPrefix: 'threads.net',
    errorMessage: 'Threads link must start with threads.net/',
  },
} as const;

const hasRequiredDomainPrefix = (value: string, requiredHost: string): boolean => {
  const trimmed = value.trim().replace(/^https?:\/\//i, '');
  return trimmed.toLowerCase().startsWith(requiredHost.toLowerCase() + '/');
};

/**
 * Generic validator creator
 */
const createValidator = (config: {
  validator?: (value: string) => boolean;
  requiredPrefix?: string;
  errorMessage: string;
}) => {
  return (value: string): string => {
    if (!value) return '';

    if (config.validator) {
      return config.validator(value) ? '' : config.errorMessage;
    }

    if (config.requiredPrefix) {
      return hasRequiredDomainPrefix(value, config.requiredPrefix) ? '' : config.errorMessage;
    }

    return '';
  };
};

/**
 * Validators return an error message string, or empty string when valid.
 */
export const validateSocial = Object.fromEntries(
  Object.entries(VALIDATION_CONFIG).map(([key, config]) => [key, createValidator(config)])
) as Record<keyof typeof VALIDATION_CONFIG, (value: string) => string>;
