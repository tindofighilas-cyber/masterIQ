
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuizResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateQuestions = async (): Promise<Question[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "أريد توليد 10 أسئلة ذكاء متنوعة باللغة العربية (منطق، رياضيات، لغويات، بصري). يجب أن تكون الأسئلة احترافية وتتدرج في الصعوبة.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            text: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              minItems: 4,
              maxItems: 4
            },
            correctAnswerIndex: { type: Type.INTEGER },
            category: { 
              type: Type.STRING,
              description: "one of: logic, math, verbal, spatial"
            },
            explanation: { type: Type.STRING }
          },
          required: ["id", "text", "options", "correctAnswerIndex", "category", "explanation"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    return [];
  }
};

export const analyzeResult = async (
  score: number, 
  total: number, 
  answers: { question: string, isCorrect: boolean, category: string }[]
): Promise<string> => {
  const prompt = `بناءً على نتائج اختبار الذكاء التالي، قم بكتابة تحليل شخصي ومفصل لمستوى الذكاء باللغة العربية:
  - النتيجة: ${score} من ${total}
  - التفاصيل: ${JSON.stringify(answers)}
  
  التحليل يجب أن يشمل:
  1. وصف لمستوى الذكاء الحالي.
  2. نقاط القوة الذهنية المكتشفة.
  3. نصائح لتطوير القدرات العقلية.
  كن مشجعاً ودقيقاً علمياً.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text || "لم نتمكن من تحليل النتائج حالياً، ولكن أداءك كان متميزاً!";
};
