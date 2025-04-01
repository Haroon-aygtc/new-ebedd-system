/**
 * AI Selector Service
 * Uses AI to analyze HTML and suggest selectors for scraping
 */

import axios from "axios";
import { analyzeHtmlForSelectors } from "./scrapeService";

/**
 * Analyze HTML content and suggest elements to scrape
 */
export const callAiForSelectors = async (
  htmlContent: string,
): Promise<any[]> => {
  try {
    // In a real implementation with an API key, this would call an AI service like OpenAI
    // For now, we'll use our pattern matching function from scrapeService
    return analyzeHtmlForSelectors(htmlContent);

    // Example of how this would be implemented with a real AI service:
    /*
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in web scraping. Analyze the HTML content and suggest CSS selectors for important elements to scrape.'
        },
        {
          role: 'user',
          content: `Analyze this HTML and suggest CSS selectors for important elements like product titles, prices, images, etc. Return the result as a JSON array of objects with selector, type, and name properties:\n\n${htmlContent.substring(0, 5000)}...`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Parse the AI response
    const aiSuggestions = JSON.parse(response.data.choices[0].message.content);
    return aiSuggestions;
    */
  } catch (error) {
    console.error("Error calling AI for selectors:", error);
    throw error;
  }
};

/**
 * Generate a CSS selector for an element
 */
export const generateSelector = (element: HTMLElement): string => {
  // Try ID first
  if (element.id) {
    return `#${element.id}`;
  }

  // Try classes
  if (element.className && typeof element.className === "string") {
    const classes = element.className
      .split(" ")
      .filter((c) => c && !c.includes("tempo-") && !c.includes("js-"));

    if (classes.length > 0) {
      return `.${classes[0]}`;
    }
  }

  // Try data attributes
  const dataAttrs = Array.from(element.attributes).filter((attr) =>
    attr.name.startsWith("data-"),
  );

  if (dataAttrs.length > 0) {
    return `[${dataAttrs[0].name}="${dataAttrs[0].value}"]`;
  }

  // Try tag with nth-child
  const tagName = element.tagName.toLowerCase();
  let index = 1;
  let sibling = element.previousElementSibling;

  while (sibling) {
    if (sibling.tagName.toLowerCase() === tagName) {
      index++;
    }
    sibling = sibling.previousElementSibling;
  }

  // If it's the only one, just use the tag
  if (index === 1 && !element.nextElementSibling) {
    return tagName;
  }

  return `${tagName}:nth-child(${index})`;
};

/**
 * Guess the type of data an element contains
 */
export const guessElementType = (element: HTMLElement): string => {
  const tagName = element.tagName.toLowerCase();

  // Images
  if (tagName === "img") {
    return "image";
  }

  // Links
  if (tagName === "a") {
    return "link";
  }

  // Lists
  if (tagName === "ul" || tagName === "ol") {
    return "list";
  }

  // Check for common class names
  const className = element.className || "";
  if (typeof className === "string") {
    if (className.includes("price")) {
      return "price";
    }
    if (className.includes("title") || className.includes("heading")) {
      return "title";
    }
    if (className.includes("desc")) {
      return "description";
    }
    if (className.includes("img") || className.includes("image")) {
      return "image";
    }
  }

  // Default to text
  return "text";
};

/**
 * Suggest a name for the selector based on the element
 */
export const suggestSelectorName = (
  element: HTMLElement,
  type: string,
): string => {
  // Check for common attributes
  if (element.hasAttribute("itemprop")) {
    return element.getAttribute("itemprop") || type;
  }

  if (element.hasAttribute("name")) {
    return element.getAttribute("name") || type;
  }

  if (element.hasAttribute("id")) {
    return element.getAttribute("id") || type;
  }

  // Check class names for meaningful names
  const className = element.className || "";
  if (typeof className === "string") {
    const classes = className.split(" ");
    for (const cls of classes) {
      if (
        [
          "price",
          "title",
          "name",
          "description",
          "image",
          "link",
          "author",
          "date",
        ].includes(cls)
      ) {
        return cls;
      }
    }
  }

  // Default to the type
  return type;
};
