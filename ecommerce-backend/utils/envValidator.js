/**
 * Environment Variable Validator
 * Ensures all required environment variables are set and secure
 */

export const validateEnv = () => {
  const errors = [];

  // Required variables
  const required = {
    JWT_ACCESS_SECRET: { minLength: 32, description: "JWT access token secret" },
    JWT_REFRESH_SECRET: { minLength: 32, description: "JWT refresh token secret" },
    PG_HOST: { minLength: 1, description: "PostgreSQL host" },
    PG_DB: { minLength: 1, description: "PostgreSQL database name" },
    PG_USER: { minLength: 1, description: "PostgreSQL username" },
    PG_PASSWORD: { minLength: 1, description: "PostgreSQL password" },
  };

  // Check required variables
  for (const [key, config] of Object.entries(required)) {
    const value = process.env[key];
    if (!value || (typeof value === "string" && value.trim() === "")) {
      errors.push(`Missing required environment variable: ${key} (${config.description})`);
    } else if (config.minLength && value.length < config.minLength) {
      errors.push(
        `${key} must be at least ${config.minLength} characters long (currently ${value.length})`
      );
    }
  }

  // Warn about default/weak secrets
  const weakSecrets = [
    { key: "JWT_ACCESS_SECRET", patterns: ["replace-with", "secret", "test", "demo"] },
    { key: "JWT_REFRESH_SECRET", patterns: ["replace-with", "secret", "test", "demo"] },
  ];

  for (const { key, patterns } of weakSecrets) {
    const value = process.env[key] || "";
    if (patterns.some((pattern) => value.toLowerCase().includes(pattern))) {
      console.warn(`⚠️  WARNING: ${key} appears to be using a default/weak value. Change it in production!`);
    }
  }

  // Validate database connection string doesn't contain secrets in logs
  if (process.env.PG_PASSWORD) {
    const password = process.env.PG_PASSWORD;
    if (password.length < 8) {
      errors.push("PG_PASSWORD should be at least 8 characters long");
    }
  }

  if (errors.length > 0) {
    console.error("❌ Environment validation errors:");
    errors.forEach((error) => console.error(`   - ${error}`));
    throw new Error("Environment validation failed");
  }

  console.log("✅ Environment variables validated successfully");
  return true;
};

