/**
 * Proxy Service
 * Manages a pool of proxies and provides rotation functionality
 */

// Types
export interface Proxy {
  url: string;
  protocol: "http" | "https" | "socks4" | "socks5";
  username?: string;
  password?: string;
  lastUsed?: Date;
  successCount: number;
  failureCount: number;
  responseTime?: number; // in ms
  country?: string;
  city?: string;
  provider?: string;
  isActive: boolean;
}

// Default proxy list
const defaultProxies: Proxy[] = [
  {
    url: "proxy1.example.com:8080",
    protocol: "http",
    successCount: 0,
    failureCount: 0,
    isActive: true,
  },
  {
    url: "proxy2.example.com:8080",
    protocol: "http",
    successCount: 0,
    failureCount: 0,
    isActive: true,
  },
  {
    url: "proxy3.example.com:8080",
    protocol: "https",
    successCount: 0,
    failureCount: 0,
    isActive: true,
  },
];

// State
let proxyList: Proxy[] = [...defaultProxies];
let currentProxyIndex = 0;

/**
 * Initialize the proxy service with a list of proxies
 */
export const initProxyService = (proxies?: Proxy[]) => {
  if (proxies && proxies.length > 0) {
    proxyList = proxies;
  }
  currentProxyIndex = 0;
};

/**
 * Get the next proxy in the rotation
 */
export const getNextProxy = (): Proxy => {
  // Filter active proxies
  const activeProxies = proxyList.filter((proxy) => proxy.isActive);

  if (activeProxies.length === 0) {
    // If no active proxies, reset all proxies to active
    proxyList.forEach((proxy) => (proxy.isActive = true));
    currentProxyIndex = 0;
    return proxyList[0];
  }

  // Get next proxy
  const proxy = activeProxies[currentProxyIndex % activeProxies.length];
  currentProxyIndex = (currentProxyIndex + 1) % activeProxies.length;

  // Update last used timestamp
  proxy.lastUsed = new Date();

  return proxy;
};

/**
 * Add a new proxy to the list
 */
export const addProxy = (proxy: Proxy): void => {
  proxyList.push(proxy);
};

/**
 * Remove a proxy from the list
 */
export const removeProxy = (proxyUrl: string): void => {
  proxyList = proxyList.filter((proxy) => proxy.url !== proxyUrl);
};

/**
 * Mark a proxy as successful
 */
export const markProxySuccess = (
  proxyUrl: string,
  responseTime?: number,
): void => {
  const proxy = proxyList.find((p) => p.url === proxyUrl);
  if (proxy) {
    proxy.successCount++;
    if (responseTime) {
      proxy.responseTime = responseTime;
    }
  }
};

/**
 * Mark a proxy as failed
 */
export const markProxyFailure = (proxyUrl: string): void => {
  const proxy = proxyList.find((p) => p.url === proxyUrl);
  if (proxy) {
    proxy.failureCount++;

    // Disable proxy if it has failed too many times
    if (
      proxy.failureCount > 5 &&
      proxy.successCount / proxy.failureCount < 0.5
    ) {
      proxy.isActive = false;
    }
  }
};

/**
 * Get all proxies
 */
export const getAllProxies = (): Proxy[] => {
  return [...proxyList];
};

/**
 * Reset proxy statistics
 */
export const resetProxyStats = (): void => {
  proxyList.forEach((proxy) => {
    proxy.successCount = 0;
    proxy.failureCount = 0;
    proxy.isActive = true;
  });
};

/**
 * Format proxy for use with axios
 */
export const formatProxyForAxios = (proxy: Proxy): string => {
  if (proxy.username && proxy.password) {
    return `${proxy.protocol}://${proxy.username}:${proxy.password}@${proxy.url}`;
  }
  return `${proxy.protocol}://${proxy.url}`;
};
