import { GoogleGenAI, Type } from "@google/genai";
import { Question, TOPICS } from "../types";

const processApiKey = process.env.API_KEY;

// Fallback questions in case API fails or key is missing (for robust demo)
const FALLBACK_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Which of the following is NOT a valid state in the Process Control Block (PCB) lifecycle?",
    options: ["New", "Running", "Waiting", "Archived"],
    correctAnswerIndex: 3,
    topic: "Operating Systems",
    explanation: "Standard process states include New, Ready, Running, Waiting, and Terminated. 'Archived' is not a standard process state."
  },
  {
    id: 2,
    text: "In the context of Relational Database, which normal form deals with partial dependency?",
    options: ["First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "Boyce-Codd Normal Form (BCNF)"],
    correctAnswerIndex: 1,
    topic: "Relational Database Design and SQL",
    explanation: "2NF eliminates partial dependencies, ensuring that non-key attributes are fully dependent on the primary key."
  }
];

export const generateExamQuestions = async (count: number = 20): Promise<Question[]> => {
  if (!processApiKey) {
    console.warn("API Key missing, using fallback questions.");
    return FALLBACK_QUESTIONS;
  }

  const ai = new GoogleGenAI({ apiKey: processApiKey });

  const prompt = `Generate ${count} multiple-choice questions for the UGC NET Computer Science and Applications exam. 
  The questions should be difficult and cover these topics: ${TOPICS.join(', ')}.
  Focus on "Previous Year Question" style (conceptual, analytical, and some numerical).
  
  Ensure the output is a valid JSON array. Each question must have:
  - text: The question stem.
  - options: An array of exactly 4 strings.
  - correctAnswerIndex: The index (0-3) of the correct option.
  - topic: One of the topics listed.
  - explanation: A brief explanation of why the answer is correct.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswerIndex: { type: Type.INTEGER },
              topic: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["text", "options", "correctAnswerIndex", "topic", "explanation"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from Gemini");

    const rawQuestions = JSON.parse(jsonText);
    
    // Add IDs to questions
    return rawQuestions.map((q: any, index: number) => ({
      ...q,
      id: index + 1
    }));

  } catch (error) {
    console.error("Failed to generate questions:", error);
    // Return fallback with IDs adjusted if necessary, or just fallback
    return FALLBACK_QUESTIONS.map((q, i) => ({...q, id: i + 1}));
  }
};