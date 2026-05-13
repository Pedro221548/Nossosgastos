import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { MercadoPagoConfig, Payment } from "mercadopago";
import cors from "cors";

// Initialize MercadoPago
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
});
const payment = new Payment(mpClient);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Process payment securely on the server
  app.post("/api/process_payment", async (req, res) => {
    try {
      const { transaction_amount, token, description, installments, payment_method_id, issuer_id, payer } = req.body;
      
      const paymentData: any = {
        transaction_amount: Number(transaction_amount),
        description,
        payment_method_id,
        payer: {
          email: payer?.email,
        },
      };

      if (token) paymentData.token = token;
      if (installments) paymentData.installments = Number(installments);
      if (issuer_id) paymentData.issuer_id = issuer_id;
      
      if (payer?.identification?.type && payer?.identification?.number) {
        paymentData.payer.identification = {
          type: payer.identification.type,
          number: payer.identification.number,
        };
      }

      if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
        return res.status(400).json({ error: "Access token do Mercado Pago ausente nas variáveis de ambiente" });
      }

      const response = await payment.create({ body: paymentData });
      res.json(response);
    } catch (error: any) {
      console.error("Payment processing error:", error);
      
      // Attempt to extract detailed API error from MercadoPago
      let errorDetails = "Unknown error";
      if (error && error.message) {
         errorDetails = error.message;
      }
      
      // Sometimes MercadoPago SDK wraps the original fetch response error
      if (error && error.cause) {
         errorDetails += ` | Cause: ${JSON.stringify(error.cause)}`;
      }

      res.status(400).json({ 
        error: "Erro no processamento do pagamento",
        message: errorDetails,
        raw: JSON.stringify(error) 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
