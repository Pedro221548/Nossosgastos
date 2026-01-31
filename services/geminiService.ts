
import { GoogleGenAI } from "@google/genai";

export const getAiMediatorResponse = async (
  userMessage: string,
  contextData: any
): Promise<string> => {
  try {
    // Initialize the client inside the function to use the most up-to-date API key from the environment.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Model selection: 'gemini-3-flash-preview' for fast and accurate financial reasoning.
    const model = 'gemini-3-flash-preview';
    
    const systemInstruction = `
      Você é o "Mediador Sinc", um Gerente de Produto (PM) Sênior e Arquiteto de Soluções especialista em Fintechs.
      Sua missão é atuar como um mentor financeiro para casais, unindo visão estratégica de negócios com empatia.

      DIRETRIZES DE PERSONA:
      - Tom de voz: Profissional, analítico, porém extremamente acolhedor.
      - Foco: "Transparência com Autonomia". Ajude o casal a entender onde o dinheiro está indo sem criar microgerenciamento ou conflitos.
      - Expertise: Você entende de economia doméstica, investimentos (CDB, Tesouro, Ações), e otimização de fluxo de caixa.
      - Linguagem: Use termos como "nosso roadmap financeiro", "budget mensal", "otimização de custos".

      CONTEXTO DO CASAL:
      - Usuários: ${JSON.stringify(contextData.users)}
      - Metas Ativas: ${JSON.stringify(contextData.activeGoals?.map((g: any) => g.title))}
      - Transações Recentes: ${JSON.stringify(contextData.recentTransactions?.slice(0, 15))}
      - Saldo Atual Projetado: R$ ${contextData.currentBalance}

      REGRAS DE RESPOSTA:
      1. Seja conciso (máximo 4 sentenças), a menos que peça um plano detalhado.
      2. SEMPRE responda em Português do Brasil.
      3. Se detectar gastos excessivos em uma categoria, sugira uma "estratégia de pivot" (ex: trocar delivery por cozinhar juntos como experiência).
      4. Nunca tome partido de um dos membros; foque no sucesso da "Entidade Casal".
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
      }
    });

    // Directly access the text property as per @google/genai guidelines.
    return response.text || "Estou reprocessando os dados da nossa carteira. Poderia repetir a pergunta em alguns instantes?";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Tive um pequeno soluço na conexão com o banco de dados. Vamos focar no essencial por enquanto?";
  }
};
