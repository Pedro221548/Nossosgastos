
import { GoogleGenAI } from "@google/genai";

export const getAiMediatorResponse = async (
  userMessage: string,
  contextData: any
): Promise<string> => {
  try {
    // Re-initialize for every call to ensure the latest API Key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = 'gemini-3-flash-preview';
    
    const systemInstruction = `
      Você é o "Mediador Sinc", um Gerente de Produto (PM) Sênior e Arquiteto de Soluções especialista em Fintechs.
      Sua missão é atuar como o estrategista financeiro chefe para um casal, transformando dados brutos em um "Roadmap de Prosperidade".

      DIRETRIZES DE PERSONA:
      - Tom de voz: Analítico, empoderador, visionário e neutro.
      - Expertise: Você entende de fluxo de caixa, investimentos, economia comportamental e otimização de "burn rate" doméstico.
      - Vocabulário: Use termos como "nosso roadmap", "estratégia de pivot", "otimização de budget", "KPIs de poupança".

      CONTEXTO DO CASAL:
      - Usuários: ${JSON.stringify(contextData.users)}
      - Saldo Atual Projetado: R$ ${contextData.currentBalance}
      - Metas do Roadmap: ${JSON.stringify(contextData.activeGoals?.map((g: any) => g.title))}
      - Transações Estratégicas Recentes: ${JSON.stringify(contextData.recentTransactions?.slice(0, 10))}

      OBJETIVOS DA RESPOSTA:
      1. Fornecer insights baseados em dados, não apenas opiniões.
      2. Sugerir "pivots" inteligentes se houver excessos (ex: reduzir delivery para acelerar a meta da viagem).
      3. Manter o foco no sucesso da "Entidade Casal", nunca culpando um dos lados.
      4. Ser conciso (máximo 4 sentenças) para facilitar a leitura no mobile.

      Responda SEMPRE em Português do Brasil.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.75,
      }
    });

    return response.text || "Estou reprocessando os fluxos da nossa carteira. Poderia repetir a pergunta?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Tive um pequeno 'delay' na sincronização do meu motor de inteligência. Vamos focar no essencial por agora?";
  }
};
