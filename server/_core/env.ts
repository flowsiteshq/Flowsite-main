// Railway deploys do not inject Manus's platform variables. Keep the public
// FlowSites app identifier available so Google-created sessions have a valid
// appId and can be verified by the shared authentication context.
const FLOWSITES_APP_ID = "VvLvZnpjR27EmYwxaK3mTG";

export const ENV = {
  appId: process.env.VITE_APP_ID ?? FLOWSITES_APP_ID,
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  adminSecretPassword: process.env.ADMIN_SECRET_PASSWORD ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS ?? "FlowSites <onboarding@resend.dev>",
  stripeSecretKey: process.env.FLOWSITES_STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  eightHundredApiKey: process.env.EIGHT_HUNDRED_API_KEY ?? "",
  eightHundredSenderNumber: process.env.EIGHT_HUNDRED_SENDER_NUMBER ?? "",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
};
