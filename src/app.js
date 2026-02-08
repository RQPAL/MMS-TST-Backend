import express from "express";
import clientsRouter from "./routes/clients.routes.js";
import offersRouter from "./routes/offers.routes.js";

const app = express();

// 🔥 INI KUNCI UTAMA
app.use(express.json());

// routes
app.use("/clients", clientsRouter);
app.use("/offers", offersRouter);

// health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;
