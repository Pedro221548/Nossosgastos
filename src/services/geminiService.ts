
import { GoogleGenAI } from "@google/genai";

export const getAiMediatorResponse = async (
  userMessage: string,
  contextData: any
): Promise<string> => {
  try {
    // The API key must be obtained directly from process.env.API_KEY and initialized inside the function.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = 'gemini-3-flash-preview';
    
    const systemInstruction = `
      Você é o "Mediador Sinc", um assistente de IA empático para casais gerenciarem finanças.
      Contexto financeiro atual: ${JSON.stringify(contextData)}
      Regras: Responda em Português do Brasil, seja conciso e neutro.
    `;

    // Use ai.models.generateContent to query the model with the prompt and system instructions.
    const response = await ai.models.generateContent({
      model: modelName,
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    // Extract the generated text output directly from the .text property.
    return response.text || "Desculpe, não consegui processar sua solicitação.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Estou temporariamente offline. Por favor, tente novamente mais tarde.";
  }
};
