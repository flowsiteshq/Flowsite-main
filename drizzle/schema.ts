import { bigint, float, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Wizard submissions table for storing customer onboarding data
 */
export const wizardSubmissions = mysqlTable("wizard_submissions", {
  id: int("id").autoincrement().primaryKey(),
  businessName: varchar("businessName", { length: 255 }).notNull(),
  businessType: varchar("businessType", { length: 100 }).notNull(),
  businessTypeOther: text("businessTypeOther"),
  website: varchar("website", { length: 500 }),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  colorScheme: varchar("colorScheme", { length: 100 }).notNull(),
  customColors: text("customColors"),
  designStyle: text("designStyle"),
  referenceWebsites: text("referenceWebsites"),
  primaryGoal: text("primaryGoal").notNull(),
  currentChallenges: text("currentChallenges"),
  timeline: varchar("timeline", { length: 100 }).notNull(),
  budget: varchar("budget", { length: 100 }),
  additionalNotes: text("additionalNotes"),
  status: mysqlEnum("status", ["new", "contacted", "in_progress", "proposal_sent", "won", "lost"]).default("new").notNull(),
  statusUpdatedAt: timestamp("statusUpdatedAt").defaultNow().notNull(),
  /** Lead source — how this lead found us */
  source: mysqlEnum("source", ["website", "cold_call", "referral", "social", "partner", "other"]),
  /** Admin notes — call outcomes, context, next steps */
  adminNotes: text("adminNotes"),
  /** Follow-up date — surfaces overdue follow-ups at top of Leads tab */
  followUpDate: varchar("followUpDate", { length: 10 }),
  /** Assigned sales rep (technician) */
  assignedTechnicianId: int("assignedTechnicianId"),
  /** Assigned partner */
  assignedPartnerId: int("assignedPartnerId"),
  /** Niche tag for categorizing leads by industry */
  nicheTag: mysqlEnum("nicheTag", ["martial_arts", "restaurant", "fitness", "self_defense", "health_wellness", "salon", "hospitality", "other"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WizardSubmission = typeof wizardSubmissions.$inferSelect;
export type InsertWizardSubmission = typeof wizardSubmissions.$inferInsert;

/**
 * Lead notes — timestamped activity log for each lead
 */
export const leadNotes = mysqlTable("lead_notes", {
  id: int("id").autoincrement().primaryKey(),
  /** The lead (wizard_submission) this note belongs to */
  leadId: int("leadId").notNull(),
  /** Note content */
  content: text("content").notNull(),
  /** Author name — technician name or 'Admin' */
  authorName: varchar("authorName", { length: 255 }).notNull().default("Admin"),
  /** Author openId for attribution */
  authorOpenId: varchar("authorOpenId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LeadNote = typeof leadNotes.$inferSelect;
export type InsertLeadNote = typeof leadNotes.$inferInsert;

/**
 * Admin sessions table for secret admin authentication
 * Uses a simple password-based session system separate from OAuth
 */
export const adminSessions = mysqlTable("admin_sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionToken: varchar("sessionToken", { length: 128 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type AdminSession = typeof adminSessions.$inferSelect;
export type InsertAdminSession = typeof adminSessions.$inferInsert;

/**
 * Weekly availability schedule — defines which days/hours are open for booking
 */
export const availability = mysqlTable("availability", {
  id: int("id").autoincrement().primaryKey(),
  dayOfWeek: int("dayOfWeek").notNull(), // 0=Sun, 1=Mon ... 6=Sat
  startTime: varchar("startTime", { length: 5 }).notNull(), // "09:00"
  endTime: varchar("endTime", { length: 5 }).notNull(),   // "17:00"
  slotDurationMins: int("slotDurationMins").default(30).notNull(),
  isActive: int("isActive").default(1).notNull(), // 1=active, 0=inactive
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = typeof availability.$inferInsert;

/**
 * Blocked dates — specific dates or date-ranges that are unavailable
 */
export const blockedDates = mysqlTable("blocked_dates", {
  id: int("id").autoincrement().primaryKey(),
  blockedDate: varchar("blockedDate", { length: 10 }).notNull(), // "2026-03-15" (YYYY-MM-DD)
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BlockedDate = typeof blockedDates.$inferSelect;
export type InsertBlockedDate = typeof blockedDates.$inferInsert;

/**
 * Bookings — confirmed discovery call appointments
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  confirmationCode: varchar("confirmationCode", { length: 16 }).notNull().unique(),
  // Guest info
  guestName: varchar("guestName", { length: 255 }).notNull(),
  guestEmail: varchar("guestEmail", { length: 320 }).notNull(),
  guestPhone: varchar("guestPhone", { length: 50 }),
  businessName: varchar("businessName", { length: 255 }),
  notes: text("notes"),
  // Slot
  bookingDate: varchar("bookingDate", { length: 10 }).notNull(), // "2026-03-15"
  startTime: varchar("startTime", { length: 5 }).notNull(),     // "10:00"
  endTime: varchar("endTime", { length: 5 }).notNull(),         // "10:30"
  timezone: varchar("timezone", { length: 64 }).default("America/New_York").notNull(),
  // Status
  status: mysqlEnum("status", ["confirmed", "cancelled", "completed", "no_show"]).default("confirmed").notNull(),
  cancelledAt: timestamp("cancelledAt"),
  cancelReason: text("cancelReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Questionnaire questions — admin-configurable questions shown before booking
 */
export const questionnaireQuestions = mysqlTable("questionnaire_questions", {
  id: int("id").autoincrement().primaryKey(),
  /** Display order (lower = shown first) */
  sortOrder: int("sortOrder").default(0).notNull(),
  /** The question text shown to the prospect */
  questionText: text("questionText").notNull(),
  /** Field type: text, textarea, select, radio, checkbox */
  fieldType: mysqlEnum("fieldType", ["text", "textarea", "select", "radio", "checkbox"]).default("text").notNull(),
  /** JSON array of option strings for select/radio/checkbox types, e.g. '["Option A","Option B"]' */
  options: text("options"),
  /** Whether an answer is required to proceed */
  isRequired: int("isRequired").default(0).notNull(), // 1=required, 0=optional
  /** Whether this question is currently shown to prospects */
  isActive: int("isActive").default(1).notNull(),
  /** Optional helper text shown below the field */
  placeholder: text("placeholder"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuestionnaireQuestion = typeof questionnaireQuestions.$inferSelect;
export type InsertQuestionnaireQuestion = typeof questionnaireQuestions.$inferInsert;

/**
 * Booking answers — prospect's answers to questionnaire questions, linked to a booking
 */
export const bookingAnswers = mysqlTable("booking_answers", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  questionId: int("questionId").notNull(),
  /** Stored as plain text; for checkbox/multi-select, stored as JSON array string */
  answerText: text("answerText"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BookingAnswer = typeof bookingAnswers.$inferSelect;
export type InsertBookingAnswer = typeof bookingAnswers.$inferInsert;

/**
 * Budget Wizard quotes — stores each completed quote from the /budget-wizard page
 */
export const budgetQuotes = mysqlTable("budget_quotes", {
  id: int("id").autoincrement().primaryKey(),
  /** Prospect contact info (optional — filled in on the summary step) */
  prospectName: varchar("prospectName", { length: 255 }),
  prospectEmail: varchar("prospectEmail", { length: 320 }),
  prospectPhone: varchar("prospectPhone", { length: 50 }),
  /** Selected industry */
  industry: varchar("industry", { length: 100 }).notNull(),
  /** Selected base package id */
  basePackage: varchar("basePackage", { length: 50 }).notNull(),
  /** JSON array of selected core add-on ids */
  coreAddons: text("coreAddons").notNull(),
  /** JSON array of selected automation add-on ids */
  autoAddons: text("autoAddons").notNull(),
  /** JSON array of selected industry-specific add-on ids */
  industryAddons: text("industryAddons").notNull(),
  /** Selected monthly subscription tier id */
  subscriptionTier: varchar("subscriptionTier", { length: 50 }).notNull(),
  /** Monthly subscription price */
  monthlyPrice: int("monthlyPrice").notNull(),
  /** Selected payment plan: full | 6mo | 12mo */
  paymentPlan: varchar("paymentPlan", { length: 10 }).notNull().default("full"),
  /** Estimated build cost min */
  buildCostMin: int("buildCostMin").notNull(),
  /** Estimated build cost max */
  buildCostMax: int("buildCostMax").notNull(),
  /** Admin status */
  status: mysqlEnum("status", ["new", "contacted", "proposal_sent", "won", "lost"]).default("new").notNull(),
  /** Admin notes */
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BudgetQuote = typeof budgetQuotes.$inferSelect;
export type InsertBudgetQuote = typeof budgetQuotes.$inferInsert;
/**
 * Client Projects — tracks website build progress for each customer
 * Admin creates a project and links it to a user; client views it in their portal.
 */
export const clientProjects = mysqlTable("client_projects", {
  id: int("id").autoincrement().primaryKey(),
  /** Linked user (Manus OAuth openId) — null until client logs in */
  clientOpenId: varchar("clientOpenId", { length: 64 }),
  /** Client contact info (pre-filled from lead/quote, editable by admin) */
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  clientPhone: varchar("clientPhone", { length: 50 }),
  /** Business name */
  businessName: varchar("businessName", { length: 255 }).notNull(),
  /** Website domain being built */
  websiteDomain: varchar("websiteDomain", { length: 255 }),
  /** Live preview URL (staging link) */
  previewUrl: varchar("previewUrl", { length: 500 }),
  /** Overall project status */
  status: mysqlEnum("status", ["onboarding", "design", "development", "review", "revisions", "launch", "maintenance", "paused"]).default("onboarding").notNull(),
  /** Current active stage index (0-based, maps to STAGES array) */
  currentStage: int("currentStage").default(0).notNull(),
  /** Percentage completion within current stage (0-100) */
  stageProgress: int("stageProgress").default(0).notNull(),
  /** Admin notes visible only to admin */
  adminNotes: text("adminNotes"),
  /** Message from admin shown to client on their dashboard */
  clientMessage: text("clientMessage"),
  /** Unique access token for client to claim their project without OAuth */
  accessToken: varchar("accessToken", { length: 64 }),
  /** Package name (e.g. "Growth", "Conversion") */
  packageName: varchar("packageName", { length: 100 }),
  /** One-time setup / build fee charged upfront */
  setupFee: int("setup_fee").default(0),
  /** Monthly subscription price */
  monthlyPrice: int("monthlyPrice"),
  /** Estimated launch date */
  estimatedLaunchDate: varchar("estimatedLaunchDate", { length: 10 }),
  /** GitHub repositories JSON: [{label: string, url: string}] */
  githubRepos: text("githubRepos"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClientProject = typeof clientProjects.$inferSelect;
export type InsertClientProject = typeof clientProjects.$inferInsert;

/**
 * Change Requests — submitted by clients from their portal dashboard
 */
export const changeRequests = mysqlTable("change_requests", {
  id: int("id").autoincrement().primaryKey(),
  /** Linked project */
  projectId: int("projectId").notNull(),
  /** Client who submitted it */
  clientOpenId: varchar("clientOpenId", { length: 64 }),
  clientName: varchar("clientName", { length: 255 }),
  /** Request details */
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  /** Priority: low | medium | high */
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  /** Page or section affected */
  pageSection: varchar("pageSection", { length: 255 }),
  /** Admin status */
  status: mysqlEnum("status", ["pending", "in_review", "approved", "in_progress", "completed", "declined"]).default("pending").notNull(),
  /** Admin response/notes shown to client */
  adminResponse: text("adminResponse"),
  /** Estimated hours to complete */
  estimatedHours: int("estimatedHours"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChangeRequest = typeof changeRequests.$inferSelect;
export type InsertChangeRequest = typeof changeRequests.$inferInsert;

/**
 * Project Messages — threaded communication between client and staff
 */
export const projectMessages = mysqlTable("project_messages", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  /** 'client' or 'staff' */
  senderRole: mysqlEnum("senderRole", ["client", "staff"]).notNull(),
  senderName: varchar("senderName", { length: 255 }).notNull(),
  message: text("message").notNull(),
  /** Whether the other party has read this message */
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectMessage = typeof projectMessages.$inferSelect;
export type InsertProjectMessage = typeof projectMessages.$inferInsert;

/**
 * Feature Upgrade Requests — submitted by clients from their portal to add new features
 */
export const featureUpgradeRequests = mysqlTable("feature_upgrade_requests", {
  id: int("id").autoincrement().primaryKey(),
  /** Linked project */
  projectId: int("projectId").notNull(),
  /** Client who submitted it */
  clientOpenId: varchar("clientOpenId", { length: 64 }),
  clientName: varchar("clientName", { length: 255 }),
  /** Feature add-on id (from CORE_ADDONS / AUTO_ADDONS) */
  featureId: varchar("featureId", { length: 100 }).notNull(),
  /** Human-readable feature name */
  featureLabel: varchar("featureLabel", { length: 255 }).notNull(),
  /** Price at time of request */
  featurePrice: int("featurePrice").notNull(),
  /** Optional notes from client */
  clientNotes: text("clientNotes"),
  /** Admin status */
  status: mysqlEnum("status", ["pending", "quoted", "approved", "in_progress", "completed", "declined"]).default("pending").notNull(),
  /** Admin response / quote details */
  adminResponse: text("adminResponse"),
  /** Final agreed price (may differ from listed price) */
  agreedPrice: int("agreedPrice"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeatureUpgradeRequest = typeof featureUpgradeRequests.$inferSelect;
export type InsertFeatureUpgradeRequest = typeof featureUpgradeRequests.$inferInsert;

/**
 * Client Accounts — one row per paying client, linked to their project
 * Tracks subscription plan, Stripe IDs, billing rules, and account status
 */
export const clientAccounts = mysqlTable("client_accounts", {
  id: int("id").autoincrement().primaryKey(),
  /** Linked project (nullable until project is created) */
  projectId: int("projectId"),
  /** Manus OAuth openId — set when client logs in for the first time */
  clientOpenId: varchar("clientOpenId", { length: 64 }),
  /** Client contact info */
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  clientPhone: varchar("clientPhone", { length: 50 }),
  /** Business name and website */
  businessName: varchar("businessName", { length: 255 }).notNull(),
  websiteUrl: varchar("websiteUrl", { length: 500 }),
  /** Stripe customer ID */
  stripeCustomerId: varchar("stripeCustomerId", { length: 64 }),
  /** Stripe subscription ID (active recurring subscription) */
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 64 }),
  /** Monthly price in cents (e.g. 19900 = $199.00) */
  monthlyPriceCents: int("monthlyPriceCents").notNull(),
  /** Billing cycle: monthly | annual */
  billingCycle: mysqlEnum("billingCycle", ["monthly", "annual"]).default("monthly").notNull(),
  /** Annual discount percentage (15 = 15% off) */
  annualDiscountPct: int("annualDiscountPct").default(15).notNull(),
  /** Early-pay discount percentage (5 = 5% off if paid before 1st) */
  earlyPayDiscountPct: int("earlyPayDiscountPct").default(5).notNull(),
  /** Late fee percentage (15 = 15% surcharge if paid after due date) */
  lateFeePct: int("lateFeePct").default(15).notNull(),
  /** Billing start date (YYYY-MM-DD) */
  billingStartDate: varchar("billingStartDate", { length: 10 }),
  /** Account status */
  status: mysqlEnum("status", ["active", "paused", "cancelled", "past_due"]).default("active").notNull(),
  /** Admin notes */
  adminNotes: text("adminNotes"),
  /** Invite token for client to claim their account */
  inviteToken: varchar("inviteToken", { length: 64 }),
  /** Whether client has accepted the invite */
  inviteAccepted: int("inviteAccepted").default(0).notNull(),
  /** Umami analytics website ID for this client's site (from manus-analytics.com) */
  analyticsWebsiteId: varchar("analyticsWebsiteId", { length: 64 }),
  /** Assigned technician/sales rep ID (FK to technicians table) */
  assignedTechnicianId: int("assignedTechnicianId"),
  /** Assigned partner ID (FK to partners table) — earns 15% on every payment */
  assignedPartnerId: int("assignedPartnerId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClientAccount = typeof clientAccounts.$inferSelect;
export type InsertClientAccount = typeof clientAccounts.$inferInsert;

/**
 * Client Invoices — billing records for each client, one per billing period
 */
export const clientInvoices = mysqlTable("client_invoices", {
  id: int("id").autoincrement().primaryKey(),
  /** Linked client account */
  clientAccountId: int("clientAccountId").notNull(),
  /** Stripe invoice ID (if paid via Stripe) */
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 64 }),
  /** Stripe payment intent ID */
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 64 }),
  /** Invoice number (e.g. INV-2026-001) */
  invoiceNumber: varchar("invoiceNumber", { length: 32 }).notNull(),
  /** Billing period start (YYYY-MM-DD) */
  periodStart: varchar("periodStart", { length: 10 }).notNull(),
  /** Billing period end (YYYY-MM-DD) */
  periodEnd: varchar("periodEnd", { length: 10 }).notNull(),
  /** Due date (YYYY-MM-DD) — 1st of the month */
  dueDate: varchar("dueDate", { length: 10 }).notNull(),
  /** Base amount in cents */
  baseAmountCents: int("baseAmountCents").notNull(),
  /** Discount applied in cents (negative) */
  discountCents: int("discountCents").default(0).notNull(),
  /** Late fee in cents (positive, applied if overdue) */
  lateFeeCents: int("lateFeeCents").default(0).notNull(),
  /** Final amount due in cents */
  totalAmountCents: int("totalAmountCents").notNull(),
  /** Payment status */
  status: mysqlEnum("status", ["draft", "open", "paid", "overdue", "void"]).default("open").notNull(),
  /** Date paid (YYYY-MM-DD) */
  paidAt: timestamp("paidAt"),
  /** Discount type applied: early_pay | annual | none */
  discountType: mysqlEnum("discountType", ["early_pay", "annual", "none"]).default("none").notNull(),
  /** Admin notes */
  notes: text("notes"),
  /** Whether this is a recurring monthly invoice */
  isRecurring: int("isRecurring").default(1).notNull(),
  /** Invoice type: monthly | addon */
  invoiceType: mysqlEnum("invoiceType", ["monthly", "addon"]).default("monthly").notNull(),
  /** Linked feature upgrade request ID (for addon invoices) */
  addonRequestId: int("addonRequestId"),
  /** Public share token — allows unauthenticated view and payment of this invoice */
  shareToken: varchar("shareToken", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClientInvoice = typeof clientInvoices.$inferSelect;
export type InsertClientInvoice = typeof clientInvoices.$inferInsert;

/**
 * Invoice Items — individual line items for each invoice (supports multi-item invoices)
 */
export const invoiceItems = mysqlTable("invoice_items", {
  id: int("id").autoincrement().primaryKey(),
  /** Linked invoice */
  invoiceId: int("invoiceId").notNull(),
  /** Description of the item */
  description: varchar("description", { length: 255 }).notNull(),
  /** Quantity (default 1) */
  quantity: int("quantity").default(1).notNull(),
  /** Unit price in cents */
  unitAmountCents: int("unitAmountCents").notNull(),
  /** Total amount in cents (quantity * unitAmountCents) */
  amountCents: int("amountCents").notNull(),
  /** Sort order for display */
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = typeof invoiceItems.$inferInsert;

/**
 * Client Media — photos and videos uploaded by clients for their website
 */
export const clientMedia = mysqlTable("client_media", {
  id: int("id").autoincrement().primaryKey(),
  /** Linked client account */
  clientAccountId: int("clientAccountId").notNull(),
  /** S3 file key */
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  /** Public S3 URL */
  fileUrl: varchar("fileUrl", { length: 1000 }).notNull(),
  /** Original filename */
  fileName: varchar("fileName", { length: 255 }).notNull(),
  /** MIME type (image/jpeg, video/mp4, etc.) */
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  /** File size in bytes */
  fileSizeBytes: int("fileSizeBytes").notNull(),
  /** Media type: photo | video */
  mediaType: mysqlEnum("mediaType", ["photo", "video"]).notNull(),
  /** Optional caption or description */
  caption: text("caption"),
  /** Who uploaded: client | admin */
  uploadedBy: mysqlEnum("uploadedBy", ["client", "admin"]).default("client").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClientMedia = typeof clientMedia.$inferSelect;
export type InsertClientMedia = typeof clientMedia.$inferInsert;

/**
 * Technicians — sales reps / staff invited by the admin to use the platform
 * They can view their own assigned clients and commission earnings.
 */
export const technicians = mysqlTable("technicians", {
  id: int("id").autoincrement().primaryKey(),
  /** Linked user (set when they accept the invite and log in) */
  userId: int("userId"),
  /** Manus OAuth openId — set after login */
  openId: varchar("openId", { length: 64 }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  /** Commission rate in percent (default 15) */
  commissionRate: int("commissionRate").default(15).notNull(),
  /**
   * Access role — determines which dashboard tabs and data this person can see:
   * - sales_rep: Leads (own), Customers (read), Scripts, own Commissions
   * - technician: Projects (own), Messages (own), Change Requests (own), Upgrades (own), Scripts
   * - manager: All tabs except Partners and commission payouts
   * - team_lead: All tabs except Billing and Analytics; can invite/manage team members; no financial data
   * - admin: Full access (same as owner)
   */
  role: mysqlEnum("role", ["sales_rep", "technician", "manager", "team_lead", "admin"]).default("sales_rep").notNull(),
  /** Account status */
  status: mysqlEnum("status", ["invited", "active", "inactive"]).default("invited").notNull(),
  /** Admin notes */
  notes: text("notes"),
  invitedAt: timestamp("invitedAt").defaultNow().notNull(),
  joinedAt: timestamp("joinedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Technician = typeof technicians.$inferSelect;
export type InsertTechnician = typeof technicians.$inferInsert;

/**
 * Technician Invites — one-time invite tokens sent to technicians via email
 */
export const technicianInvites = mysqlTable("technician_invites", {
  id: int("id").autoincrement().primaryKey(),
  /** Linked technician record */
  technicianId: int("technicianId").notNull(),
  /** Unique invite token (UUID) */
  token: varchar("token", { length: 64 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull(),
  /** When the invite was used (null = not yet accepted) */
  usedAt: timestamp("usedAt"),
  /** Invite expires after 7 days */
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TechnicianInvite = typeof technicianInvites.$inferSelect;
export type InsertTechnicianInvite = typeof technicianInvites.$inferInsert;

/**
 * Partners — referral partners who earn 15% on every collected payment
 * Separate from sales reps (technicians); a partner is a company or individual
 * with a revenue-share agreement.
 */
export const partners = mysqlTable("partners", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  companyName: varchar("companyName", { length: 255 }),
  /** Commission rate in percent (default 15) */
  commissionRate: int("commissionRate").default(15).notNull(),
  /** Account status */
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  /** Admin notes */
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

/**
 * Technician Commissions — 15% commission on each collected payment per referred client
 * Also used for partner commissions (commissionType = 'partner').
 * Chargebacks deduct from the commissionAmountCents via chargebackDeductionCents.
 */
export const technicianCommissions = mysqlTable("technician_commissions", {
  id: int("id").autoincrement().primaryKey(),
  /** Commission type: 'rep' for sales reps, 'partner' for partner accounts */
  commissionType: mysqlEnum("commissionType", ["rep", "partner"]).default("rep").notNull(),
  /** The technician (sales rep) who referred the client — null for partner commissions */
  technicianId: int("technicianId"),
  /** The partner account — null for rep commissions */
  partnerId: int("partnerId"),
  /** The client account that was referred */
  clientAccountId: int("clientAccountId").notNull(),
  /** The invoice that triggered this commission */
  invoiceId: int("invoiceId").notNull(),
  /** Commission rate applied (snapshot at time of earning) */
  commissionRate: int("commissionRate").notNull(),
  /** Invoice total in cents */
  invoiceAmountCents: int("invoiceAmountCents").notNull(),
  /** Commission amount in cents (rate% of invoice total) */
  commissionAmountCents: int("commissionAmountCents").notNull(),
  /** Chargeback deduction in cents (subtracted from commission) */
  chargebackDeductionCents: int("chargebackDeductionCents").default(0).notNull(),
  /** Net commission after chargebacks: commissionAmountCents - chargebackDeductionCents */
  netCommissionCents: int("netCommissionCents").notNull(),
  /** Payment status */
  status: mysqlEnum("status", ["pending", "paid", "cancelled"]).default("pending").notNull(),
  /** When admin marked it as paid */
  paidAt: timestamp("paidAt"),
  /** Admin notes (e.g. payment method, chargeback reference) */
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TechnicianCommission = typeof technicianCommissions.$inferSelect;
export type InsertTechnicianCommission = typeof technicianCommissions.$inferInsert;

/**
 * Email Auth — stores hashed passwords for email+password login.
 * Separate from the OAuth `users` table so OAuth and email/password
 * can coexist. Each row links to a `users` row via userId.
 */
export const emailAuth = mysqlTable("email_auth", {
  id: int("id").autoincrement().primaryKey(),
  /** Links to users.id — one emailAuth row per user */
  userId: int("userId").notNull().unique(),
  /** Normalized lowercase email used as login identifier */
  email: varchar("email", { length: 320 }).notNull().unique(),
  /** bcrypt hash of the user's password */
  passwordHash: text("passwordHash").notNull(),
  /** Whether the email has been verified (optional — can skip for now) */
  emailVerified: int("emailVerified").default(0).notNull(),
  /** Secure random token for password reset (null when not in progress) */
  resetToken: varchar("resetToken", { length: 128 }),
  /** Unix timestamp (ms) when the reset token expires (null when not in progress) */
  resetTokenExpiry: bigint("resetTokenExpiry", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailAuth = typeof emailAuth.$inferSelect;
export type InsertEmailAuth = typeof emailAuth.$inferInsert;

/**
 * Email Auth Sessions — persistent sessions for email+password logins.
 * Separate from the OAuth session cookie so both can coexist.
 */
export const emailAuthSessions = mysqlTable("email_auth_sessions", {
  id: int("id").autoincrement().primaryKey(),
  /** The user this session belongs to */
  userId: int("userId").notNull(),
  /** Secure random session token stored in cookie */
  sessionToken: varchar("sessionToken", { length: 128 }).notNull().unique(),
  /** User agent for display purposes */
  userAgent: text("userAgent"),
  /** Whether this is an admin session */
  isAdmin: int("isAdmin").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type EmailAuthSession = typeof emailAuthSessions.$inferSelect;
export type InsertEmailAuthSession = typeof emailAuthSessions.$inferInsert;

/**
 * Opportunity Pool — pre-loaded leads (portfolio companies) that sales reps can claim.
 * First-come, first-served. Once claimed, locked to that rep (15% of first payment).
 */
export const opportunityPool = mysqlTable("opportunity_pool", {
  id: int("id").autoincrement().primaryKey(),
  /** Business/company name */
  businessName: varchar("businessName", { length: 255 }).notNull(),
  /** Website URL */
  websiteUrl: varchar("websiteUrl", { length: 500 }),
  /** Business type/industry */
  businessType: varchar("businessType", { length: 100 }),
  /** Location */
  location: varchar("location", { length: 255 }),
  /** Short description */
  description: text("description"),
  /** Estimated monthly value in cents (e.g. 4900 = $49/mo) */
  estimatedMonthlyCents: int("estimatedMonthlyCents").default(4900).notNull(),
  /** Source of this opportunity */
  source: varchar("source", { length: 100 }).default("portfolio").notNull(),
  /** Status: available, claimed, converted, inactive */
  status: mysqlEnum("status", ["available", "claimed", "converted", "inactive"]).default("available").notNull(),
  /** The technician (sales rep) who claimed this opportunity */
  claimedByTechnicianId: int("claimedByTechnicianId"),
  /** When it was claimed */
  claimedAt: timestamp("claimedAt"),
  /** Whether this opportunity is active (shown in pool) */
  isActive: int("isActive").default(1).notNull(),
  /** Admin notes */
  adminNotes: text("adminNotes"),
  /** Confirmed payout in cents — set by admin after first payment is received (15% of first month) */
  confirmedPayoutCents: int("confirmedPayoutCents"),
  /** When the payout was confirmed by admin */
  payoutConfirmedAt: timestamp("payoutConfirmedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OpportunityPool = typeof opportunityPool.$inferSelect;
export type InsertOpportunityPool = typeof opportunityPool.$inferInsert;

// ─── Client Pages ─────────────────────────────────────────────────────────────
export const clientPages = mysqlTable("client_pages", {
  id: int("id").primaryKey().autoincrement(),
  /** The client account this page belongs to */
  clientAccountId: int("clientAccountId").notNull(),
  /** Page title, e.g. "Home", "About", "Services" */
  title: varchar("title", { length: 100 }).notNull(),
  /** URL path, e.g. "/", "/about", "/services" */
  path: varchar("path", { length: 255 }).notNull(),
  /** Short description of the page */
  description: text("description"),
  /** Status: live, draft, in_progress */
  status: mysqlEnum("status", ["live", "draft", "in_progress"]).default("live").notNull(),
  /** Last time this page was updated (display string, e.g. "May 7, 2026") */
  lastUpdated: varchar("lastUpdated", { length: 50 }),
  /** Display order */
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ClientPage = typeof clientPages.$inferSelect;
export type InsertClientPage = typeof clientPages.$inferInsert;

// ─── SMS Logs ─────────────────────────────────────────────────────────────────
/** Tracks all SMS messages sent/received via 800.com integration */
export const smsLogs = mysqlTable("sms_logs", {
  id: int("id").primaryKey().autoincrement(),
  /** Lead ID if this SMS is associated with a lead/wizard submission */
  leadId: int("leadId"),
  /** Client account ID if this SMS is associated with a client */
  clientAccountId: int("clientAccountId"),
  /** Direction: outbound = we sent it, inbound = they replied */
  direction: mysqlEnum("direction", ["outbound", "inbound"]).notNull().default("outbound"),
  /** The phone number of the contact (lead/client) */
  contactPhone: varchar("contactPhone", { length: 30 }).notNull(),
  /** The message body */
  message: text("message").notNull(),
  /** Name of the staff member who sent the message (for outbound) */
  sentBy: varchar("sentBy", { length: 100 }),
  /** OpenID of the staff member who sent the message */
  sentByOpenId: varchar("sentByOpenId", { length: 100 }),
  /** 800.com conversation ID for threading */
  conversationId: varchar("conversationId", { length: 100 }),
  /** Delivery status */
  status: mysqlEnum("status", ["sent", "failed", "delivered"]).notNull().default("sent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SmsLog = typeof smsLogs.$inferSelect;
export type InsertSmsLog = typeof smsLogs.$inferInsert;

// ─── Knowledge Center: Lessons & Quizzes ────────────────────────────────────

/**
 * Lessons — each lesson belongs to a category and has ordered steps.
 */
export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  /** Estimated read time in minutes */
  estimatedMinutes: int("estimatedMinutes").notNull().default(5),
  /** Sort order within category */
  sortOrder: int("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

/**
 * Lesson steps — ordered content blocks within a lesson.
 */
export const lessonSteps = mysqlTable("lesson_steps", {
  id: int("id").autoincrement().primaryKey(),
  lessonId: int("lessonId").notNull(),
  stepNumber: int("stepNumber").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
});
export type LessonStep = typeof lessonSteps.$inferSelect;
export type InsertLessonStep = typeof lessonSteps.$inferInsert;

/**
 * Quiz questions — each question belongs to a lesson.
 */
export const quizQuestions = mysqlTable("quiz_questions", {
  id: int("id").autoincrement().primaryKey(),
  lessonId: int("lessonId").notNull(),
  questionNumber: int("questionNumber").notNull(),
  question: text("question").notNull(),
  /** JSON array of 4 option strings */
  options: text("options").notNull(),
  /** 0-based index of the correct option */
  correctIndex: int("correctIndex").notNull(),
  explanation: text("explanation"),
});
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = typeof quizQuestions.$inferInsert;

/**
 * User lesson progress — tracks which steps a user has completed.
 */
export const userLessonProgress = mysqlTable("user_lesson_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lessonId: int("lessonId").notNull(),
  /** Highest step number completed (0 = started but no steps done) */
  completedSteps: int("completedSteps").notNull().default(0),
  /** Whether the lesson reading is fully done */
  lessonCompleted: int("lessonCompleted").notNull().default(0),
  /** Whether the quiz has been passed */
  quizPassed: int("quizPassed").notNull().default(0),
  /** Best quiz score (0-100) */
  bestScore: int("bestScore").notNull().default(0),
  /** Number of quiz attempts */
  attempts: int("attempts").notNull().default(0),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});
export type UserLessonProgress = typeof userLessonProgress.$inferSelect;
export type InsertUserLessonProgress = typeof userLessonProgress.$inferInsert;

/**
 * Client Portal Passwords — standalone email+password auth for client portal access.
 * Separate from the Manus OAuth flow so clients don't need a Manus account.
 */
export const clientPortalPasswords = mysqlTable("client_portal_passwords", {
  id: int("id").autoincrement().primaryKey(),
  /** Client email — matches clientProjects.clientEmail */
  clientEmail: varchar("clientEmail", { length: 320 }).notNull().unique(),
  /** bcrypt hash of the client's portal password */
  passwordHash: text("passwordHash").notNull(),
  /** One-time setup token (sent via invite email) */
  setupToken: varchar("setupToken", { length: 128 }),
  /** Unix timestamp (ms) when setup token expires */
  setupTokenExpiry: bigint("setupTokenExpiry", { mode: "number" }),
  /** One-time reset token (sent via forgot-password email) */
  resetToken: varchar("resetToken", { length: 128 }),
  /** Unix timestamp (ms) when reset token expires */
  resetTokenExpiry: bigint("resetTokenExpiry", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ClientPortalPassword = typeof clientPortalPasswords.$inferSelect;
export type InsertClientPortalPassword = typeof clientPortalPasswords.$inferInsert;

/**
 * Client Portal Sessions — persistent sessions for client portal logins.
 */
export const clientPortalSessions = mysqlTable("client_portal_sessions", {
  id: int("id").autoincrement().primaryKey(),
  /** Client email this session belongs to */
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  /** Secure random session token stored in cookie */
  sessionToken: varchar("sessionToken", { length: 128 }).notNull().unique(),
  /** User agent for display purposes */
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});
export type ClientPortalSession = typeof clientPortalSessions.$inferSelect;
export type InsertClientPortalSession = typeof clientPortalSessions.$inferInsert;

/**
 * Heatmap click events — stores normalised (0-1) click coordinates per page per project
 */
export const heatmapClicks = mysqlTable("heatmap_clicks", {
  id: int("id").autoincrement().primaryKey(),
  /** The client project this click belongs to (matches clientProjects.id) */
  projectId: int("projectId").notNull(),
  /** Page path where the click occurred, e.g. "/" or "/services" */
  pagePath: varchar("pagePath", { length: 500 }).notNull().default("/"),
  /** Normalised X position (0.0 – 1.0 relative to viewport width) */
  xPct: float("xPct").notNull(),
  /** Normalised Y position (0.0 – 1.0 relative to document height) */
  yPct: float("yPct").notNull(),
  /** Anonymous session identifier */
  sessionId: varchar("sessionId", { length: 64 }),
  /** Device type inferred from user agent */
  deviceType: mysqlEnum("deviceType", ["desktop", "mobile", "tablet"]).default("desktop"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type HeatmapClick = typeof heatmapClicks.$inferSelect;
export type InsertHeatmapClick = typeof heatmapClicks.$inferInsert;

/**
 * Page Views — first-party analytics tracking for client websites.
 * Each row represents a single page view recorded by the tracking pixel.
 */
export const pageViews = mysqlTable("page_views", {
  id: int("id").autoincrement().primaryKey(),
  /** The client project this view belongs to */
  projectId: int("projectId").notNull(),
  /** Page path, e.g. "/" or "/services" */
  pagePath: varchar("pagePath", { length: 500 }).notNull().default("/"),
  /** Anonymous session ID (UUID generated client-side, stored in sessionStorage) */
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  /** Referrer URL (trimmed to 500 chars) */
  referrer: varchar("referrer", { length: 500 }),
  /** UTM source parameter */
  utmSource: varchar("utmSource", { length: 100 }),
  /** UTM medium parameter */
  utmMedium: varchar("utmMedium", { length: 100 }),
  /** UTM campaign parameter */
  utmCampaign: varchar("utmCampaign", { length: 100 }),
  /** Device type inferred from user agent */
  deviceType: mysqlEnum("deviceType", ["desktop", "mobile", "tablet"]).default("desktop"),
  /** Country code from IP (optional, populated if geo-lookup is available) */
  country: varchar("country", { length: 2 }),
  /** Timestamp of the page view */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;

/**
 * Analytics tracking tokens — one per client project.
 * The token is embedded in the JS snippet and used to attribute page views.
 */
export const analyticsTokens = mysqlTable("analytics_tokens", {
  id: int("id").autoincrement().primaryKey(),
  /** The client project this token belongs to */
  projectId: int("projectId").notNull().unique(),
  /** Public token embedded in the tracking snippet — not a secret */
  token: varchar("token", { length: 64 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AnalyticsToken = typeof analyticsTokens.$inferSelect;
export type InsertAnalyticsToken = typeof analyticsTokens.$inferInsert;

/**
 * Analyzer results — auto-saved when a website analysis completes.
 * Each row is a lead: the analyzed URL, scores, and a unique share token.
 */
export const analyzerResults = mysqlTable("analyzer_results", {
  id: int("id").autoincrement().primaryKey(),
  /** Unique token used in the shareable URL: /analyzer/results/:shareId */
  shareId: varchar("shareId", { length: 32 }).notNull().unique(),
  /** The analyzed URL (normalized, with https://) */
  url: varchar("url", { length: 2048 }).notNull(),
  /** PageSpeed scores 0–100 */
  performance: int("performance").notNull(),
  seo: int("seo").notNull(),
  accessibility: int("accessibility").notNull(),
  bestPractices: int("bestPractices").notNull(),
  mobileScore: int("mobileScore").notNull(),
  /** Time to interactive in seconds */
  loadTime: float("loadTime").notNull(),
  /** Full JSON blob of issues and recommendations */
  issuesJson: text("issuesJson"),
  recommendationsJson: text("recommendationsJson"),
  /** Optional contact info captured later */
  leadName: varchar("leadName", { length: 255 }),
  leadEmail: varchar("leadEmail", { length: 320 }),
  leadPhone: varchar("leadPhone", { length: 50 }),
  /** Whether the lead has booked a call */
  bookedCall: int("bookedCall").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyzerResult = typeof analyzerResults.$inferSelect;
export type InsertAnalyzerResult = typeof analyzerResults.$inferInsert;

/**
 * Marketing opt-ins — collected from email blast landing page.
 * Prospects who fill out the /interested form to express interest in FlowSites.
 */
export const marketingOptins = mysqlTable("marketing_optins", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  businessName: varchar("businessName", { length: 255 }).notNull(),
  website: varchar("website", { length: 500 }),
  source: varchar("source", { length: 100 }).default("email_blast"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type MarketingOptin = typeof marketingOptins.$inferSelect;
export type InsertMarketingOptin = typeof marketingOptins.$inferInsert;

/**
 * Admin impersonation tokens — short-lived tokens that let admins preview
 * any client's portal without needing to log in as that client.
 * Expires after 1 hour.
 */
export const adminImpersonationTokens = mysqlTable("admin_impersonation_tokens", {
  id: int("id").autoincrement().primaryKey(),
  /** The one-time token passed as ?adminPreview=<token> */
  token: varchar("token", { length: 64 }).notNull().unique(),
  /** The client project to preview */
  projectId: int("projectId").notNull(),
  /** The admin who generated this token */
  createdByAdminId: varchar("createdByAdminId", { length: 64 }).notNull(),
  /** Token expiry — 1 hour from creation */
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AdminImpersonationToken = typeof adminImpersonationTokens.$inferSelect;
export type InsertAdminImpersonationToken = typeof adminImpersonationTokens.$inferInsert;
