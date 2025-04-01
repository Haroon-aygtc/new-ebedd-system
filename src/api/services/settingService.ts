import Setting from "../models/Setting";

/**
 * Get all settings
 */
export const getSettings = async (): Promise<any[]> => {
  const settings = await Setting.findAll();
  return settings.map((setting) => setting.toJSON());
};

/**
 * Get settings by category
 */
export const getSettingsByCategory = async (
  category: string,
): Promise<any[]> => {
  const settings = await Setting.findAll({
    where: { category },
  });
  return settings.map((setting) => setting.toJSON());
};

/**
 * Get a setting by key
 */
export const getSettingByKey = async (key: string): Promise<any | null> => {
  const setting = await Setting.findOne({
    where: { key },
  });
  return setting ? setting.toJSON() : null;
};

/**
 * Create or update a setting
 */
export const upsertSetting = async (
  category: string,
  key: string,
  value: string,
  description?: string,
): Promise<any> => {
  const [setting, created] = await Setting.findOrCreate({
    where: { key },
    defaults: {
      category,
      key,
      value,
      description,
    },
  });

  if (!created) {
    await setting.update({
      category,
      value,
      description: description || setting.description,
    });
  }

  return setting.toJSON();
};

/**
 * Delete a setting
 */
export const deleteSetting = async (key: string): Promise<boolean> => {
  const result = await Setting.destroy({
    where: { key },
  });
  return result > 0;
};

/**
 * Initialize default settings if they don't exist
 */
export const initializeDefaultSettings = async () => {
  const defaultSettings = [
    {
      category: "general",
      key: "site_name",
      value: "Intelligent Scraping Studio",
      description: "The name of the site",
    },
    {
      category: "general",
      key: "site_description",
      value:
        "A comprehensive platform combining intelligent web scraping with an AI chat interface, featuring real-time data visualization and customizable AI responses.",
      description: "The description of the site",
    },
    {
      category: "general",
      key: "admin_email",
      value: "admin@example.com",
      description: "The admin email address",
    },
    {
      category: "general",
      key: "date_format",
      value: "yyyy-mm-dd",
      description: "The date format",
    },
    {
      category: "general",
      key: "time_format",
      value: "24h",
      description: "The time format",
    },
    {
      category: "scraping",
      key: "default_timeout",
      value: "30000",
      description: "Default request timeout in milliseconds",
    },
    {
      category: "scraping",
      key: "default_delay",
      value: "2000",
      description: "Default request delay in milliseconds",
    },
    {
      category: "scraping",
      key: "default_user_agent",
      value:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      description: "Default user agent",
    },
    {
      category: "ai",
      key: "default_model",
      value: "gpt-4",
      description: "Default AI model",
    },
    {
      category: "ai",
      key: "default_temperature",
      value: "0.7",
      description: "Default temperature",
    },
    {
      category: "ai",
      key: "default_max_tokens",
      value: "2048",
      description: "Default max tokens",
    },
    {
      category: "security",
      key: "auth_method",
      value: "jwt",
      description: "Authentication method",
    },
    {
      category: "security",
      key: "token_expiration",
      value: "24",
      description: "Token expiration in hours",
    },
  ];

  for (const setting of defaultSettings) {
    await upsertSetting(
      setting.category,
      setting.key,
      setting.value,
      setting.description,
    );
  }
};

// Initialize default settings
initializeDefaultSettings();
