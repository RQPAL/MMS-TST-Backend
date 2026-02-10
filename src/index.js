import "dotenv/config";
import app from "./app.js";
import { startAlertScheduler } from "./schedulers/alert.scheduler.js";

console.log("🚀 INDEX.JS LOADED:", import.meta.url);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  startAlertScheduler();
});
