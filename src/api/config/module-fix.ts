/**
 * This file provides helper functions to handle ESM/CommonJS compatibility issues
 */

/**
 * Helper function to handle both ESM and CommonJS default exports
 * @param module The imported module
 * @returns The actual module content
 */
export function getModuleDefault(module: any) {
  return module.default || module;
}

/**
 * Helper function to handle dynamic imports in ESM
 * @param modulePath The path to the module
 * @returns A promise that resolves to the imported module
 */
export async function importModule(modulePath: string) {
  const module = await import(modulePath);
  return getModuleDefault(module);
}
