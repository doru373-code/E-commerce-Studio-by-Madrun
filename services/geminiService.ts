
import { GoogleGenAI } from "@google/genai";
import { PROMPT_TEMPLATES, AVATAR_PROMPT, CUSTOM_CHARACTER_PROMPT } from "../constants";
import { BackgroundStyle, GenerationMode, Gender, AspectRatio, Scene, Pose, HairColor, Hairstyle, SkinTone, CharacterSource } from "../types";

export interface GenerationOptions {
  style?: BackgroundStyle;
  gender?: Gender;
  aspectRatio: AspectRatio;
  scene?: Scene;
  pose?: Pose;
  hairColor?: HairColor;
  hairstyle?: Hairstyle;
  skinTone?: SkinTone;
  characterSource?: CharacterSource;
  characterImage?: string | null;
}

export const generateProductPhoto = async (
  base64Image: string,
  mode: GenerationMode,
  options: GenerationOptions
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });
  
  const parts: any[] = [];
  
  // Always include the product image
  const cleanProductBase64 = base64Image.split(',')[1] || base64Image;
  parts.push({
    inlineData: {
      data: cleanProductBase64,
      mimeType: 'image/png'
    }
  });

  let promptText = "";

  if (mode === 'avatar') {
    if (options.characterSource === 'custom' && options.characterImage) {
      // Include the character reference image
      const cleanCharBase64 = options.characterImage.split(',')[1] || options.characterImage;
      parts.push({
        inlineData: {
          data: cleanCharBase64,
          mimeType: 'image/png'
        }
      });
      promptText = CUSTOM_CHARACTER_PROMPT(options.scene || 'studio', options.pose || 'neutral');
    } else {
      // AI Generated prompt
      promptText = AVATAR_PROMPT(
        options.gender || 'female', 
        options.scene || 'studio', 
        options.pose || 'neutral',
        options.hairColor || 'brown',
        options.hairstyle || 'medium',
        options.skinTone || 'medium'
      );
    }
  } else {
    // Background mode
    promptText = PROMPT_TEMPLATES[options.style || 'white-studio'];
  }

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts
      },
      config: {
        imageConfig: {
          aspectRatio: options.aspectRatio
        }
      }
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("No response from AI");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image was generated in the response");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
