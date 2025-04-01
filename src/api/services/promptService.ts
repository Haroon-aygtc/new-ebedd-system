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
  try {
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
        {
          name: "Structured Response Template",
          description: "Format responses with clear headings and sections",
          template: `You are a professional data analyst and communication expert.

Context: {{context}}
Data: {{scraped_data}}
Query: {{query}}

Provide a comprehensive response with the following structure:

# Summary
[Provide a brief 2-3 sentence overview of the key findings]

## Key Insights
- [First major insight with supporting data]
- [Second major insight with supporting data]
- [Third major insight with supporting data]

## Detailed Analysis
[Provide deeper analysis with specific data points and patterns]

## Recommendations
1. [First actionable recommendation]
2. [Second actionable recommendation]
3. [Third actionable recommendation]

## Follow-up Suggestions
- [Suggest a related question the user might want to ask]
- [Suggest another angle to explore]`,
          isDefault: false,
        },
        {
          name: "Technical Documentation",
          description:
            "Generate technical documentation from code or specifications",
          template: `You are a technical documentation specialist.

Code/Specifications: {{scraped_data}}
Query: {{query}}

Generate clear, precise technical documentation that explains the functionality, parameters, return values, and provides usage examples. Use proper formatting for code blocks, parameters, and technical terms.`,
          isDefault: false,
        },
      ]);
      console.log("Default prompts created successfully");
    }
  } catch (error) {
    console.error("Error initializing default prompts:", error);
    throw error;
  }
};

// Call initialization when the module is loaded
(async () => {
  try {
    await initializeDefaultPrompts();
    console.log("Default prompts initialized successfully");
  } catch (error) {
    console.error("Error initializing default prompts:", error);
  }
})();

/**
 * Get all prompts
 */
export const getPrompts = async (): Promise<Prompt[]> => {
  try {
    const prompts = await PromptModel.findAll({
      order: [
        ["isDefault", "DESC"],
        ["name", "ASC"],
      ],
    });
    return prompts.map((prompt) => prompt.toJSON() as Prompt);
  } catch (error) {
    console.error("Error fetching prompts:", error);
    throw error;
  }
};

/**
 * Get a prompt by ID
 */
export const getPromptById = async (id: number): Promise<Prompt | null> => {
  try {
    const prompt = await PromptModel.findByPk(id);
    if (!prompt) {
      // If prompt not found, try to get the default prompt
      const defaultPrompt = await PromptModel.findOne({
        where: { isDefault: true },
      });

      if (defaultPrompt) {
        return defaultPrompt.toJSON() as Prompt;
      }
      return null;
    }
    return prompt.toJSON() as Prompt;
  } catch (error) {
    console.error(`Error fetching prompt with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get the default prompt
 */
export const getDefaultPrompt = async (): Promise<Prompt | null> => {
  try {
    const defaultPrompt = await PromptModel.findOne({
      where: { isDefault: true },
    });

    if (!defaultPrompt) {
      // If no default prompt is set, get the first prompt
      const firstPrompt = await PromptModel.findOne();
      return firstPrompt ? (firstPrompt.toJSON() as Prompt) : null;
    }

    return defaultPrompt.toJSON() as Prompt;
  } catch (error) {
    console.error("Error fetching default prompt:", error);
    throw error;
  }
};

/**
 * Create a new prompt
 */
export const createPrompt = async (
  promptData: Omit<Prompt, "id">,
): Promise<Prompt> => {
  try {
    // If this prompt is set as default, update all others
    if (promptData.isDefault) {
      await PromptModel.update({ isDefault: false }, { where: {} });
    }

    const newPrompt = await PromptModel.create({
      ...promptData,
      isDefault: promptData.isDefault ?? false,
    });

    return newPrompt.toJSON() as Prompt;
  } catch (error) {
    console.error("Error creating prompt:", error);
    throw error;
  }
};

/**
 * Update a prompt
 */
export const updatePrompt = async (
  id: number,
  promptData: Partial<Prompt>,
): Promise<Prompt | null> => {
  try {
    const prompt = await PromptModel.findByPk(id);
    if (!prompt) return null;

    // If setting this prompt as default, update all others
    if (promptData.isDefault) {
      await PromptModel.update({ isDefault: false }, { where: {} });
    }

    await prompt.update(promptData);
    return prompt.toJSON() as Prompt;
  } catch (error) {
    console.error(`Error updating prompt with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a prompt
 */
export const deletePrompt = async (id: number): Promise<boolean> => {
  try {
    const prompt = await PromptModel.findByPk(id);
    if (!prompt) return false;

    // Check if this is the default prompt
    const isDefault = prompt.get("isDefault") as boolean;

    await prompt.destroy();

    // If we deleted the default prompt, set a new default
    if (isDefault) {
      const firstPrompt = await PromptModel.findOne();
      if (firstPrompt) {
        await firstPrompt.update({ isDefault: true });
      }
    }

    return true;
  } catch (error) {
    console.error(`Error deleting prompt with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Process a prompt template with variables
 */
export const processPromptTemplate = (
  template: string,
  variables: Record<string, string>,
): string => {
  let processedTemplate = template;

  // Replace each variable in the template
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    processedTemplate = processedTemplate.replace(
      new RegExp(placeholder, "g"),
      value || `[No ${key} provided]`,
    );
  });

  return processedTemplate;
};
