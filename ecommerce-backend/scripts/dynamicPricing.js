import dotenv from "dotenv";
dotenv.config();

import { runDynamicPricingUpdate } from "../services/dynamicPricingService.js";

const run = async () => {
  try {
    const updated = await runDynamicPricingUpdate();
    console.log(`✅ Dynamic pricing updated for ${updated} products`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Dynamic pricing engine failed", err);
    process.exit(1);
  }
};

if (require.main === module) {
  run();
}

export default run;
