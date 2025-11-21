import crypto from "crypto";

/**
 * Generate secure random secrets for JWT
 */
const generateSecret = (length = 64) => {
  return crypto.randomBytes(length).toString("hex");
};

console.log("🔐 Generating secure JWT secrets...\n");
console.log("Add these to your .env file:\n");
console.log(`JWT_ACCESS_SECRET=${generateSecret(32)}`);
console.log(`JWT_REFRESH_SECRET=${generateSecret(32)}`);
console.log("\n✅ Secrets generated! Copy them to your .env file.");

