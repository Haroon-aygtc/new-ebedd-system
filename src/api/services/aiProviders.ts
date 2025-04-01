import axios from "axios";

/**
 * Call OpenAI API with the given prompt and model configuration
 */
export const callOpenAI = async (
  prompt: string,
  model: any,
): Promise<string> => {
  try {
    const apiKey = model.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key not found");
    }

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: model.version || "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: model.parameters?.temperature || 0.7,
        max_tokens: model.parameters?.max_tokens || 2048,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
};

/**
 * Call Anthropic API with the given prompt and model configuration
 */
export const callAnthropic = async (
  prompt: string,
  model: any,
): Promise<string> => {
  try {
    const apiKey = model.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("Anthropic API key not found");
    }

    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: model.version || "claude-3-opus-20240229",
        messages: [{ role: "user", content: prompt }],
        max_tokens: model.parameters?.max_tokens || 2048,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
      },
    );

    return response.data.content[0].text;
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    throw error;
  }
};

/**
 * Call Google AI API with the given prompt and model configuration
 */
export const callGoogleAI = async (
  prompt: string,
  model: any,
): Promise<string> => {
  try {
    const apiKey = model.apiKey || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Google AI API key not found");
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model.version || "gemini-pro"}:generateContent`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          key: apiKey,
        },
      },
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error calling Google AI API:", error);
    throw error;
  }
};
