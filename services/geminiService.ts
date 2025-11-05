import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Deal, Contact, Task } from '../types';

// This function safely gets the API key from your .env.local file
const getApiKey = (): string | null => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Vite uses VITE_ prefix
  return apiKey || null;
};

// This function initializes the Generative AI client
const getAi = (): GoogleGenerativeAI | null => {
    const apiKey = getApiKey();
    if (apiKey) {
        return new GoogleGenerativeAI(apiKey);
    }
    return null;
};

export const isAiAvailable = (): boolean => {
    return getApiKey() !== null;
}

interface CrmData {
  deals: Deal[];
  contacts: Contact[];
  tasks: Task[];
}

export const runCrmQuery = async (query: string, crmData: CrmData): Promise<string> => {
  const ai = getAi();
  if (!ai) {
    return "AI service is not available. Please configure the GEMINI_API_KEY in your environment.";
  }

  // Explicitly use the gemini-1.5-flash model
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const prompt = `
      You are a helpful CRM assistant named Zenith. Analyze the provided CRM data to answer the user's question. 
      The data is in JSON format. Provide clear, concise answers based only on the data given. Do not make up information.
      If the data is empty, say that there is no data to analyze.
      Today's date is ${new Date().toLocaleDateString()}.
    
      Here is the CRM Data:
      - Contacts: ${JSON.stringify(crmData.contacts, null, 2)}
      - Deals: ${JSON.stringify(crmData.deals, null, 2)}
      - Tasks: ${JSON.stringify(crmData.tasks, null, 2)}

      User Query: "${query}"
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        // Provide a more helpful error message
        return `An error occurred while contacting the AI. Please check your API key and network connection. Details: ${error.message}`;
    }
    return "An unknown error occurred while contacting the AI.";
  }
};