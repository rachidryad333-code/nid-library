import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getBookInsights(title: string, author: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a brief, sophisticated summary and "Why read this?" insight for the book "${title}" by ${author}. Format as Markdown.`,
      config: {
        systemInstruction: "You are a world-class literary critic. Provide insightful, concise, and engaging book summaries.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate insights at this time.";
  }
}
