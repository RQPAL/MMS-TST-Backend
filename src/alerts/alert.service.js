import { getSilentOffers } from "./rules/silentOffers.rule.js";
import { getOverdueFollowUps } from "./rules/overdueFollowUps.rule.js";

export const runAlertChecks = async () => {
  const silentOffers = await getSilentOffers(3);
  const overdueFollowUps = await getOverdueFollowUps();

  return {
    silentOffers,
    overdueFollowUps,
    summary: {
      silent: silentOffers.length,
      overdue: overdueFollowUps.length
    }
  };
};