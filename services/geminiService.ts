import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private modelId = "gemini-3-pro-preview"; // Using Pro for better reasoning with CSVs

  constructor() {
    // API key is handled via the app state passed in methods, or environment if available
    if (process.env.API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
  }

  // Allow setting key dynamically if not in env
  setApiKey(key: string) {
    this.ai = new GoogleGenAI({ apiKey: key });
  }

  async processQuery(csvContext: string, userPrompt: string): Promise<string> {
    if (!this.ai) throw new Error("API Key not set");

    const fullPrompt = `
      CURRENT DATASET (CSV format):
      \`\`\`csv
      ${csvContext}
      \`\`\`

      USER REQUEST:
      ${userPrompt}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingBudget: 1024 }, // Enable thinking for complex data ops
        },
        contents: fullPrompt,
      });

      return response.text || "I couldn't generate a response.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to process data with Gemini.");
    }
  }
}

export const geminiService = new GeminiService();
