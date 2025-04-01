/**
 * User Agent Service
 * Manages a pool of user agents and provides rotation functionality
 */

// Types
export interface UserAgent {
  value: string;
  browser: "chrome" | "firefox" | "safari" | "edge" | "opera" | "other";
  os: "windows" | "macos" | "linux" | "ios" | "android" | "other";
  mobile: boolean;
  version?: string;
  weight?: number; // For weighted random selection
}

// Default user agents
const defaultUserAgents: UserAgent[] = [
  {
    value:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    browser: "chrome",
    os: "windows",
    mobile: false,
    version: "91.0.4472.124",
    weight: 10,
  },
  {
    value:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    browser: "safari",
    os: "macos",
    mobile: false,
    version: "14.1.1",
    weight: 8,
  },
  {
    value:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    browser: "firefox",
    os: "windows",
    mobile: false,
    version: "89.0",
    weight: 7,
  },
  {
    value:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36",
    browser: "chrome",
    os: "linux",
    mobile: false,
    version: "92.0.4515.107",
    weight: 5,
  },
  {
    value:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    browser: "safari",
    os: "ios",
    mobile: true,
    version: "14.0",
    weight: 6,
  },
  {
    value:
      "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
    browser: "chrome",
    os: "android",
    mobile: true,
    version: "91.0.4472.120",
    weight: 6,
  },
  {
    value:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59",
    browser: "edge",
    os: "windows",
    mobile: false,
    version: "91.0.864.59",
    weight: 4,
  },
  {
    value:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36 OPR/77.0.4054.172",
    browser: "opera",
    os: "linux",
    mobile: false,
    version: "77.0.4054.172",
    weight: 3,
  },
];

// State
let userAgents: UserAgent[] = [...defaultUserAgents];
let lastUsedIndex = -1;

/**
 * Initialize the user agent service with a list of user agents
 */
export const initUserAgentService = (agents?: UserAgent[]) => {
  if (agents && agents.length > 0) {
    userAgents = agents;
  }
  lastUsedIndex = -1;
};

/**
 * Get a random user agent
 */
export const getRandomUserAgent = (): UserAgent => {
  const totalWeight = userAgents.reduce(
    (sum, agent) => sum + (agent.weight || 1),
    0,
  );
  let random = Math.random() * totalWeight;

  for (const agent of userAgents) {
    random -= agent.weight || 1;
    if (random <= 0) {
      return agent;
    }
  }

  // Fallback to first agent if something goes wrong
  return userAgents[0];
};

/**
 * Get the next user agent in sequence
 */
export const getNextUserAgent = (): UserAgent => {
  lastUsedIndex = (lastUsedIndex + 1) % userAgents.length;
  return userAgents[lastUsedIndex];
};

/**
 * Get a user agent by browser type
 */
export const getUserAgentByBrowser = (
  browser: UserAgent["browser"],
): UserAgent => {
  const filtered = userAgents.filter((agent) => agent.browser === browser);
  if (filtered.length === 0) {
    return getRandomUserAgent();
  }
  return filtered[Math.floor(Math.random() * filtered.length)];
};

/**
 * Get a user agent by OS
 */
export const getUserAgentByOS = (os: UserAgent["os"]): UserAgent => {
  const filtered = userAgents.filter((agent) => agent.os === os);
  if (filtered.length === 0) {
    return getRandomUserAgent();
  }
  return filtered[Math.floor(Math.random() * filtered.length)];
};

/**
 * Get a mobile or desktop user agent
 */
export const getUserAgentByDevice = (mobile: boolean): UserAgent => {
  const filtered = userAgents.filter((agent) => agent.mobile === mobile);
  if (filtered.length === 0) {
    return getRandomUserAgent();
  }
  return filtered[Math.floor(Math.random() * filtered.length)];
};

/**
 * Add a new user agent to the list
 */
export const addUserAgent = (agent: UserAgent): void => {
  userAgents.push(agent);
};

/**
 * Get all user agents
 */
export const getAllUserAgents = (): UserAgent[] => {
  return [...userAgents];
};
