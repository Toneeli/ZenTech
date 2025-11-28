import { GoogleGenAI, Type } from "@google/genai";
import { GeminiVoteSuggestion } from "../types";

// Initialize Gemini
// NOTE: In a real production app, ensure this is handled securely.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateVoteDetails = async (topic: string): Promise<GeminiVoteSuggestion> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `请针对住宅小区事务：“${topic}”，创建一个正式且专业的投票议程。
      请提供：
      1. 一个清晰的中文标题。
      2. 一段详细但中立的描述（中文）。
      3. 2-4个标准的投票选项（中文，例如：同意、反对、或具体的解决方案）。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "description", "options"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeminiVoteSuggestion;
    }
    
    throw new Error("No response text from Gemini");

  } catch (error) {
    console.error("Error generating vote details:", error);
    // Fallback if API fails
    return {
      title: topic,
      description: "请针对此事项进行投票表决。",
      options: ["同意", "反对", "弃权"]
    };
  }
};