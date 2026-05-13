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
      const submitData = req.body;

      if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
        return res.status(400).json({ error: "Access token do Mercado Pago ausente nas variáveis de ambiente" });
      }

      const orderResponse = await fetch("https://api.mercadopago.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          "X-Idempotency-Key": Date.now().toString() + Math.random().toString(),
        },
        body: JSON.stringify(submitData),
      });

      const responseData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(responseData.message || JSON.stringify(responseData));
      }

      res.json(responseData);
    } catch (error: any) {
      console.error("Payment processing error:", error);
      
      res.status(400).json({ 
        error: "Erro no processamento do pagamento",
        message: error.message || "Unknown error",
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
