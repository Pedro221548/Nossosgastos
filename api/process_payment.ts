import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MercadoPagoConfig, Payment } from "mercadopago";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration if needed
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const paymentData = req.body;

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return res.status(400).json({ error: "Access token do Mercado Pago ausente nas variáveis de ambiente" });
    }

    const mpClient = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    });
    const payment = new Payment(mpClient);

    const response = await payment.create({ body: paymentData });

    res.status(200).json(response);
  } catch (error: any) {
    console.error("Payment processing error:", error);
    let errorDetails = "Unknown error";
    if (error && error.message) {
       errorDetails = error.message;
    }
    if (error && error.cause) {
       errorDetails += ` | Cause: ${JSON.stringify(error.cause)}`;
    }
    res.status(400).json({ 
      error: "Erro no processamento do pagamento",
      message: errorDetails,
      raw: JSON.stringify(error) 
    });
  }
}
