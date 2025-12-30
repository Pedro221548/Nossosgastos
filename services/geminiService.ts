
import { GoogleGenAI } from "@google/genai";

export const getAiMediatorResponse = async (
  userMessage: string,
  contextData: any
): Promise<string> => {
  try {
    // Initialize the client inside the function to use the most up-to-date API key from the environment.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Model selection: 'gemini-3-flash-preview' is chosen for basic text/coaching tasks.
    const model = 'gemini-3-flash-preview';
    
    const systemInstruction = `
      Você é o "Mediador Sinc", um assistente de IA empático, neutro e orientado a soluções para casais gerenciarem suas finanças.
      Seu objetivo é reduzir conflitos e promover a "Transparência com Autonomia".
      
      Tom de voz:
      - Calmo, sem julgamentos e encorajador.
      - Use linguagem de "nós" ao se referir ao casal.
      - Evite tomar partidos.
      - Mantenha as respostas concisas (menos de 3 frases), a menos que peçam um plano detalhado.
      - Responda sempre em Português do Brasil.

      Contexto fornecido: ${JSON.stringify(contextData)}
      
      Se o usuário estiver reclamando sobre gastos, sugira alternativas construtivas (ex: cozinhar em casa vs. jantar fora).
      Se o usuário estiver feliz, celebre a conquista.
    `;

    // Use ai.models.generateContent to query GenAI with both model name and prompt.
    const response = await ai.models.generateContent({
      model: model,
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    // The text property directly returns the string output from the response.
    return response.text || "Estou com dificuldades para conectar meus circuitos de mediação agora. Vamos respirar fundo e tentar novamente mais tarde.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Parece que estou offline. Vamos focar no que podemos controlar agora.";
  }
};
