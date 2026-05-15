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
      const paymentData = req.body;

      if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
        return res.status(400).json({ error: "Access token do Mercado Pago ausente nas variáveis de ambiente" });
      }

      const response = await payment.create({ body: paymentData });

      res.json(response);
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
  });

  // Check payment securely on the server
  app.get("/api/check_payment", async (req, res) => {
    try {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: "Missing payment id" });
      }

      const response = await payment.get({ id });
      res.json(response);
    } catch (error: any) {
      console.error("Payment check error:", error);
      res.status(400).json({ error: "Erro ao verificar pagamento", details: error.message });
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
