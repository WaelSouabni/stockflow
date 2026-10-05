const required = ["DATABASE_URL", "AUTH_SECRET"];
const production = process.env.NODE_ENV === "production";

const missing = required.filter((key) => !process.env[key]);

if (production && missing.length) {
  console.error(`Missing required production variables: ${missing.join(", ")}`);
  process.exit(1);
}

if (production && process.env.AUTH_SECRET && process.env.AUTH_SECRET.length < 32) {
  console.error("AUTH_SECRET must contain at least 32 characters in production.");
  process.exit(1);
}

const smtp = ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "EMAIL_FROM"];
const configuredSmtp = smtp.filter((key) => Boolean(process.env[key])).length;
if (configuredSmtp > 0 && configuredSmtp < smtp.length) {
  console.error("SMTP configuration is incomplete. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD and EMAIL_FROM together.");
  process.exit(1);
}

console.log("Environment validation passed.");
