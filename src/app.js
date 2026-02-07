import express from "express";
import clientsRouter from "./routes/clients.routes.js";

const app = express();

app.use(express.json());

// 🔴 INI WAJIB ADA
app.use("/clients", clientsRouter);

// health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;
