// Types
interface Prompt {
  id: number;
  name: string;
  description?: string;
  template: string;
  isDefault?: boolean;
}

// Import the Prompt model
import PromptModel from "../models/Prompt";

// Initialize default prompts if none exist
const initializeDefaultPrompts = async () => {
  const count = await PromptModel.count();
  if (count === 0) {
    await PromptModel.bulkCreate([
      {
        name: "Data Analysis Assistant",
        description: "Specialized prompt for analyzing scraped data",
        template: `You are a data analysis assistant specialized in web scraping data.

Context: {{context}}
Scraped Data: {{scraped_data}}
User Query: {{query}}

Analyze the data provided and respond to the user's query with insights, patterns, and actionable information. Include relevant statistics when possible. Format your response with clear headings and bullet points for readability.`,
        isDefault: true,
      },
      {
        name: "E-commerce Product Analyzer",
        description: "Analyze product data from e-commerce sites",
        template: `You are an e-commerce product analysis specialist.

Scraped Data: {{scraped_data}}
User Query: {{query}}

Analyze the product data and provide insights on pricing trends, competitive positioning, and product features. Include recommendations for pricing strategy and marketing focus.`,
        isDefault: false,
      },
      {
        name: "News Summarizer",
        description: "Summarize news articles with key points",
        template: `You are a news summarization assistant.

Article Content: {{scraped_data}}
User Query: {{query}}

Provide a concise summary of the news article, highlighting the key points, main entities involved, and core message. Include a brief analysis of potential implications if relevant.`,
        isDefault: false,
      },
      {
        name: "SEO Content Analyzer",
        description: "Analyze content for SEO optimization",
        template: `You are an SEO content analysis specialist.

Content: {{scraped_data}}
User Query: {{query}}

Analyze the content for SEO effectiveness. Identify keyword density, heading structure, meta information quality, and content readability. Provide specific recommendations for improving SEO performance.`,
        isDefault: false,
      },
      {
        name: "Competitive Research",
        description: "Compare data across competitor websites",
        template: `You are a competitive intelligence specialist.

Competitor Data: {{scraped_data}}
User Query: {{query}}

Analyze the competitor data and identify strengths, weaknesses, unique selling propositions, and market positioning. Compare pricing strategies, product offerings, and messaging approaches. Provide strategic recommendations based on this analysis.`,
        isDefault: false,
      },
    ]);
  }
};

// Call initialization
initializeDefaultPrompts();

/**
 * Get all prompts
 */
export const getPrompts = async (): Promise<any[]> => {
  const prompts = await PromptModel.findAll();
  return prompts.map((prompt) => prompt.toJSON());
};

/**
 * Get a prompt by ID
 */
export const getPromptById = async (id: number): Promise<any | null> => {
  const prompt = await PromptModel.findByPk(id);
  return prompt ? prompt.toJSON() : null;
};

/**
 * Create a new prompt
 */
export const createPrompt = async (
  promptData: Omit<any, "id">,
): Promise<any> => {
  // If this prompt is set as default, update all others
  if (promptData.isDefault) {
    await PromptModel.update({ isDefault: false }, { where: {} });
  }

  const newPrompt = await PromptModel.create({
    ...promptData,
    isDefault: promptData.isDefault ?? false,
  });

  return newPrompt.toJSON();
};

/**
 * Update a prompt
 */
export const updatePrompt = async (
  id: number,
  promptData: Partial<any>,
): Promise<any | null> => {
  const prompt = await PromptModel.findByPk(id);
  if (!prompt) return null;

  // If setting this prompt as default, update all others
  if (promptData.isDefault) {
    await PromptModel.update({ isDefault: false }, { where: {} });
  }

  await prompt.update(promptData);
  return prompt.toJSON();
};

/**
 * Delete a prompt
 */
export const deletePrompt = async (id: number): Promise<boolean> => {
  const prompt = await PromptModel.findByPk(id);
  if (!prompt) return false;

  await prompt.destroy();
  return true;
};
