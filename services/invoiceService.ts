
import { GoogleGenAI, Type } from "@google/genai";
import { InvoiceItem } from "../types";

const SYSTEM_INSTRUCTION = `Você é um especialista em OCR financeiro e análise de faturas de cartão de crédito. 
Sua tarefa é extrair: Nome do banco, valor total da fatura e lista completa de lançamentos/itens.
Para cada item: 
- description: Nome do estabelecimento ou transação.
- amount: Valor numérico positivo.
- date: Data no formato DD/MM/AAAA.
- installments: Se houver indicação de parcelas (ex: 2/12), extraia como objeto { current: 2, total: 12 }.

Importante: Ignore pagamentos de faturas anteriores, juros ou créditos de estorno na lista de itens, foque nos gastos.
Retorne APENAS o JSON estruturado.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    bankName: { type: Type.STRING },
    totalAmount: { type: Type.NUMBER },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          date: { type: Type.STRING },
          installments: {
            type: Type.OBJECT,
            properties: {
              current: { type: Type.NUMBER },
              total: { type: Type.NUMBER }
            }
          }
        },
        required: ["description", "amount", "date"]
      }
    }
  },
  required: ["bankName", "totalAmount", "items"]
};

export const parseInvoiceText = async (text: string): Promise<{ bankName: string, items: InvoiceItem[], totalAmount: number }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analise o seguinte texto de uma fatura: ${text}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA
    }
  });

  return JSON.parse(response.text || "{}");
};

export const parseInvoiceFile = async (base64Data: string, mimeType: string): Promise<{ bankName: string, items: InvoiceItem[], totalAmount: number }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        { text: "Analise esta fatura e extraia todos os lançamentos de gastos, o nome do banco e o valor total." }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA
    }
  });

  return JSON.parse(response.text || "{}");
};
