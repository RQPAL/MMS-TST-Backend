import "dotenv/config";
import { runAlertChecks } from "../alerts/alert.service.js";

const run = async () => {
  const result = await runAlertChecks();
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
};

run();
