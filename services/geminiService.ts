
import { GoogleGenAI } from "@google/genai";

export const transformToGameCharacter = async (base64Image: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = "Please stylize the person in this photo into a high-end 3D game character. Unreal Engine 5 render style, cinematic neon lighting, futuristic armor or sleek tech-wear, soft skin textures, and sharp details. Keep the person's basic features recognizable but fully transformed into a high-quality 3D avatar with game engine character aesthetics.";

  // Extract base64 data correctly
  const data = base64Image.split(',')[1] || base64Image;

  // Switched to image/jpeg to match the compressed capture
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data, mimeType: 'image/jpeg' } },
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/jpeg;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to process image style");
};
