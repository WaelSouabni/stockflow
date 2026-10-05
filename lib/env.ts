const requiredProduction = ["DATABASE_URL", "AUTH_SECRET"] as const;

export function validateServerEnv() {
  const missing = requiredProduction.filter((key) => !process.env[key]);

  if (process.env.NODE_ENV === "production" && missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
  }

  const authSecret = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && authSecret && authSecret.length < 32) {
    throw new Error("AUTH_SECRET must contain at least 32 characters in production.");
  }

  return {
    databaseUrl: process.env.DATABASE_URL ?? "",
    authSecret: authSecret ?? "",
  };
}
