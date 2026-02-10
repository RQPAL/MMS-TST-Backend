import cron from "node-cron";
import { runAlertChecks } from "../alerts/alert.service.js";

export const startAlertScheduler = () => {
  // jalan tiap hari jam 08:00
  cron.schedule("0 8 * * *", async () => {
    console.log("⏰ Running alert scheduler...");

    try {
      const alerts = await runAlertChecks();
      console.log("🚨 ALERT RESULT:", JSON.stringify(alerts, null, 2));
      console.log("🚨 ALERT SUMMARY:", alerts.summary);
        
      if (alerts.summary.silent > 0) {
        console.log("⚠️ Silent offers:", alerts.silentOffers);
      }

      if (alerts.summary.overdue > 0) {
        console.log("⚠️ Overdue FU:", alerts.overdueFollowUps);
      }

      // nanti: email / WA / Slack
    } catch (err) {
      console.error("❌ Alert scheduler error:", err);
    }
  });
};