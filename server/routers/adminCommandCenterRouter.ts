import { and, asc, desc, eq, isNull, like, lt, or, sql } from "drizzle-orm";
import { z } from "zod";
import {
  clientAccounts,
  clientInvoices,
  clientProjects,
  wizardSubmissions,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { assertStrictAdminAccess } from "../adminCommandCenterAuth";
import { publicProcedure, router } from "../_core/trpc";

const pageSizeSchema = z.number().int().min(1).max(50).default(25);
const customerPageSizeSchema = z.number().int().min(1).max(10).default(10);
const customerStatusSchema = z.enum(["active", "paused", "cancelled", "past_due"]);
const customerSortSchema = z.enum(["attention", "name", "monthly", "balance", "status"]);

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") return Number(value);
  return 0;
}

function encodeCursor(createdAt: Date, id: number) {
  return Buffer.from(JSON.stringify({ createdAt: createdAt.toISOString(), id })).toString("base64url");
}

function decodeCursor(cursor: string | undefined) {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    if (typeof parsed?.createdAt !== "string" || !Number.isInteger(parsed?.id)) return null;
    const date = new Date(parsed.createdAt);
    if (Number.isNaN(date.getTime())) return null;
    return { createdAt: date, id: parsed.id as number };
  } catch {
    return null;
  }
}

function normalizedQuery(query: string | undefined) {
  const trimmed = query?.trim().replace(/[%_\\]/g, "") ?? "";
  return trimmed.slice(0, 80);
}

function encodeOffset(offset: number) {
  return Buffer.from(JSON.stringify({ offset })).toString("base64url");
}

function decodeOffset(cursor: string | undefined) {
  if (!cursor) return 0;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    return Number.isInteger(parsed?.offset) && parsed.offset >= 0 ? parsed.offset : null;
  } catch {
    return null;
  }
}

/**
 * The Admin 3.0 read model intentionally separates local configuration from
 * Stripe-verified facts. Until subscription event synchronization is deployed,
 * MRR is marked as locally configured rather than represented as provider truth.
 */
export const adminCommandCenterRouter = router({
  getOverview: publicProcedure.query(async ({ ctx }) => {
    await assertStrictAdminAccess(ctx);
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const today = new Date().toISOString().slice(0, 10);

    const [accountSummary] = await db
      .select({
        totalCustomers: sql<number>`count(*)`,
        activeCustomers: sql<number>`sum(case when ${clientAccounts.status} = 'active' then 1 else 0 end)`,
        configuredMonthlyRevenueCents: sql<number>`coalesce(sum(case when ${clientAccounts.status} = 'active' then ${clientAccounts.monthlyPriceCents} else 0 end), 0)`,
        activeAccountsMissingStripeSubscription: sql<number>`sum(case when ${clientAccounts.status} = 'active' and ${clientAccounts.stripeSubscriptionId} is null then 1 else 0 end)`,
      })
      .from(clientAccounts)
      .where(isNull(clientAccounts.removedAt));

    const [invoiceSummary] = await db
      .select({
        paidInvoiceCents: sql<number>`coalesce(sum(case when ${clientInvoices.status} = 'paid' then ${clientInvoices.totalAmountCents} else 0 end), 0)`,
        grossOpenInvoiceCents: sql<number>`coalesce(sum(case when ${clientInvoices.status} in ('open', 'overdue') then ${clientInvoices.totalAmountCents} else 0 end), 0)`,
        verifiedOutstandingInvoiceCents: sql<number>`coalesce(sum(case when ${clientInvoices.status} in ('open', 'overdue') and (${clientInvoices.stripeInvoiceId} is not null or ${clientInvoices.stripePaymentIntentId} is not null) then ${clientInvoices.totalAmountCents} else 0 end), 0)`,
        unreconciledOpenInvoiceCents: sql<number>`coalesce(sum(case when ${clientInvoices.status} in ('open', 'overdue') and ${clientInvoices.stripeInvoiceId} is null and ${clientInvoices.stripePaymentIntentId} is null then ${clientInvoices.totalAmountCents} else 0 end), 0)`,
        openInvoiceCount: sql<number>`sum(case when ${clientInvoices.status} in ('open', 'overdue') then 1 else 0 end)`,
      })
      .from(clientInvoices);

    const overdueInvoiceCondition = and(
      or(
        eq(clientInvoices.status, "overdue"),
        and(eq(clientInvoices.status, "open"), lt(clientInvoices.dueDate, today)),
      ),
      or(sql`${clientInvoices.stripeInvoiceId} is not null`, sql`${clientInvoices.stripePaymentIntentId} is not null`),
    );
    const [overdueSummary] = await db
      .select({ overdueAccounts: sql<number>`count(distinct ${clientInvoices.clientAccountId})` })
      .from(clientInvoices)
      .innerJoin(clientAccounts, eq(clientInvoices.clientAccountId, clientAccounts.id))
      .where(and(overdueInvoiceCondition, isNull(clientAccounts.removedAt)));

    const activeCustomers = toNumber(accountSummary?.activeCustomers);
    const missingSubscriptions = toNumber(accountSummary?.activeAccountsMissingStripeSubscription);

    return {
      asOf: new Date().toISOString(),
      metrics: {
        activeCustomers,
        configuredMonthlyRevenueCents: toNumber(accountSummary?.configuredMonthlyRevenueCents),
        mrrVerification: "requires_subscription_sync" as const,
        unlinkedActiveSubscriptionCount: missingSubscriptions,
        grossOpenInvoiceCents: toNumber(invoiceSummary?.grossOpenInvoiceCents),
        verifiedOutstandingInvoiceCents: toNumber(invoiceSummary?.verifiedOutstandingInvoiceCents),
        unreconciledOpenInvoiceCents: toNumber(invoiceSummary?.unreconciledOpenInvoiceCents),
        openInvoiceCount: toNumber(invoiceSummary?.openInvoiceCount),
        paidInvoiceCents: toNumber(invoiceSummary?.paidInvoiceCents),
        overdueAccounts: toNumber(overdueSummary?.overdueAccounts),
        totalCustomers: toNumber(accountSummary?.totalCustomers),
      },
      disclosures: {
        activeCustomers: "Count of active local CRM accounts. Active paid-service verification requires subscription synchronization.",
        monthlyRevenue: "Configured monthly amount on active local accounts. It is not provider-verified MRR and annual billing is not normalized.",
        grossOpenInvoices: "Gross face value of open and overdue local invoices, shown for audit only. It is not a confirmed collectible balance. Credits, refunds, partial payments, and write-offs are not modeled.",
        verifiedOutstandingInvoices: "Open and overdue invoices with a local Stripe invoice or payment-intent reference. Provider status is not inferred when the reference is missing.",
        unreconciledOpenInvoices: "Open and overdue local invoices without a Stripe invoice or payment-intent reference. These require reconciliation and are excluded from verified outstanding balance.",
        overdueAccounts: "Unique active-CRM customers with a linked local invoice marked overdue or past its due date.",
        paid: "Sum of local invoices marked paid. This is not a cash reconciliation or refund-adjusted total.",
      },
    };
  }),

  /**
   * Reconciliation report for administrative review. This deliberately reports
   * discrepancies between local configuration and local invoice records without
   * rewriting accounts or claiming Stripe/provider truth.
   */
  financialReconciliation: publicProcedure.query(async ({ ctx }) => {
    await assertStrictAdminAccess(ctx);
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const rows = await db
      .select({
        accountId: clientAccounts.id,
        businessName: clientAccounts.businessName,
        monthlyPriceCents: clientAccounts.monthlyPriceCents,
        billingCycle: clientAccounts.billingCycle,
        status: clientAccounts.status,
        stripeSubscriptionId: clientAccounts.stripeSubscriptionId,
        stripeCustomerId: clientAccounts.stripeCustomerId,
        planName: clientProjects.packageName,
        invoiceCount: sql<number>`count(${clientInvoices.id})`,
        recurringInvoiceCents: sql<number>`coalesce(sum(case when ${clientInvoices.isRecurring} = 1 and ${clientInvoices.status} <> 'void' then ${clientInvoices.totalAmountCents} else 0 end), 0)`,
        unpaidInvoiceCents: sql<number>`coalesce(sum(case when ${clientInvoices.status} in ('open', 'overdue') then ${clientInvoices.totalAmountCents} else 0 end), 0)`,
        paidInvoiceCents: sql<number>`coalesce(sum(case when ${clientInvoices.status} = 'paid' then ${clientInvoices.totalAmountCents} else 0 end), 0)`,
      })
      .from(clientAccounts)
      .leftJoin(clientInvoices, eq(clientInvoices.clientAccountId, clientAccounts.id))
      .leftJoin(clientProjects, eq(clientAccounts.projectId, clientProjects.id))
      .where(isNull(clientAccounts.removedAt))
      .groupBy(clientAccounts.id, clientAccounts.businessName, clientAccounts.monthlyPriceCents, clientAccounts.billingCycle, clientAccounts.status, clientAccounts.stripeSubscriptionId, clientAccounts.stripeCustomerId, clientProjects.packageName);

    const byBusiness = new Map<string, number>();
    for (const row of rows) byBusiness.set(row.businessName.toLowerCase(), (byBusiness.get(row.businessName.toLowerCase()) ?? 0) + 1);
    return rows.map(row => {
      const monthly = toNumber(row.monthlyPriceCents);
      const recurring = toNumber(row.recurringInvoiceCents);
      const hasSubscription = Boolean(row.stripeSubscriptionId);
      const accountType = hasSubscription && toNumber(row.invoiceCount) > 0 ? "both" : hasSubscription ? "monthly_subscription" : toNumber(row.invoiceCount) > 0 ? "one_time_or_invoice_only" : "unclassified";
      const flags: string[] = [];
      if (!row.planName) flags.push("plan_not_recorded");
      if (row.status === "active" && !hasSubscription) flags.push("active_without_stripe_subscription");
      if (row.status === "cancelled" && monthly > 0) flags.push("cancelled_with_configured_monthly_amount");
      if (row.billingCycle === "monthly" && recurring > 0 && recurring !== monthly) flags.push("recurring_invoice_total_differs_from_configured_monthly");
      if ((byBusiness.get(row.businessName.toLowerCase()) ?? 0) > 1) flags.push("duplicate_business_name_requires_review");
      return {
        accountId: row.accountId,
        businessName: row.businessName,
        planName: row.planName,
        status: row.status,
        accountType,
        configuredMonthlyCents: monthly,
        recurringInvoiceCents: recurring,
        unpaidInvoiceCents: toNumber(row.unpaidInvoiceCents),
        paidInvoiceCents: toNumber(row.paidInvoiceCents),
        invoiceCount: toNumber(row.invoiceCount),
        stripeSubscriptionVerified: hasSubscription,
        stripeCustomerLinked: Boolean(row.stripeCustomerId),
        flags,
      };
    });
  }),

  globalSearch: publicProcedure
    .input(z.object({ query: z.string().trim().min(2).max(80) }))
    .query(async ({ ctx, input }) => {
      await assertStrictAdminAccess(ctx);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const query = normalizedQuery(input.query);
      if (query.length < 2) return { customers: [], invoices: [], leads: [] };
      const pattern = `%${query}%`;
      const [customers, invoices, leads] = await Promise.all([
        db.select({ id: clientAccounts.id, businessName: clientAccounts.businessName, clientName: clientAccounts.clientName, clientEmail: clientAccounts.clientEmail })
          .from(clientAccounts)
          .where(and(isNull(clientAccounts.removedAt), or(like(clientAccounts.businessName, pattern), like(clientAccounts.clientName, pattern), like(clientAccounts.clientEmail, pattern), like(clientAccounts.clientPhone, pattern))!))
          .orderBy(desc(clientAccounts.updatedAt)).limit(5),
        db.select({ id: clientInvoices.id, invoiceNumber: clientInvoices.invoiceNumber, accountId: clientAccounts.id, businessName: clientAccounts.businessName })
          .from(clientInvoices)
          .leftJoin(clientAccounts, eq(clientInvoices.clientAccountId, clientAccounts.id))
          .where(or(like(clientInvoices.invoiceNumber, pattern), like(clientAccounts.businessName, pattern))!)
          .orderBy(desc(clientInvoices.createdAt)).limit(5),
        db.select({ id: wizardSubmissions.id, businessName: wizardSubmissions.businessName, contactName: wizardSubmissions.contactName, email: wizardSubmissions.email })
          .from(wizardSubmissions)
          .where(and(isNull(wizardSubmissions.removedAt), or(like(wizardSubmissions.businessName, pattern), like(wizardSubmissions.contactName, pattern), like(wizardSubmissions.email, pattern), like(wizardSubmissions.phone, pattern))!))
          .orderBy(desc(wizardSubmissions.createdAt)).limit(5),
      ]);
      return { customers, invoices, leads };
    }),

  listCustomers: publicProcedure
    .input(z.object({
      query: z.string().max(120).optional(),
      status: customerStatusSchema.optional(),
      sort: customerSortSchema.default("attention"),
      direction: z.enum(["asc", "desc"]).default("asc"),
      cursor: z.string().max(300).optional(),
      pageSize: customerPageSizeSchema,
    }).default({ pageSize: 10, sort: "attention", direction: "asc" }))
    .query(async ({ ctx, input }) => {
      await assertStrictAdminAccess(ctx);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const offset = decodeOffset(input.cursor);
      if (offset === null) throw new Error("Invalid customer cursor.");
      const query = normalizedQuery(input.query);
      const today = new Date().toISOString().slice(0, 10);
      const conditions = [isNull(clientAccounts.removedAt)];

      if (input.status) conditions.push(eq(clientAccounts.status, input.status));
      if (query) {
        const pattern = `%${query}%`;
        conditions.push(or(
          like(clientAccounts.businessName, pattern),
          like(clientAccounts.clientName, pattern),
          like(clientAccounts.clientEmail, pattern),
          like(clientAccounts.clientPhone, pattern),
          like(clientAccounts.websiteUrl, pattern),
        )!);
      }
      const [countResult] = await db
        .select({ total: sql<number>`count(*)` })
        .from(clientAccounts)
        .where(and(...conditions));

      const outstandingBalanceCents = sql<number>`coalesce(sum(case when ${clientInvoices.status} in ('open', 'overdue') and (${clientInvoices.stripeInvoiceId} is not null or ${clientInvoices.stripePaymentIntentId} is not null) then ${clientInvoices.totalAmountCents} else 0 end), 0)`;
      const unreconciledBalanceCents = sql<number>`coalesce(sum(case when ${clientInvoices.status} in ('open', 'overdue') and ${clientInvoices.stripeInvoiceId} is null and ${clientInvoices.stripePaymentIntentId} is null then ${clientInvoices.totalAmountCents} else 0 end), 0)`;
      const overdueInvoiceCount = sql<number>`sum(case when (${clientInvoices.status} = 'overdue' or (${clientInvoices.status} = 'open' and ${clientInvoices.dueDate} < ${today})) and (${clientInvoices.stripeInvoiceId} is not null or ${clientInvoices.stripePaymentIntentId} is not null) then 1 else 0 end)`;
      const attentionRank = sql<number>`case when sum(case when ${clientInvoices.status} = 'overdue' or (${clientInvoices.status} = 'open' and ${clientInvoices.dueDate} < ${today}) then 1 else 0 end) > 0 then 0 when ${clientAccounts.status} = 'past_due' then 1 when ${clientAccounts.status} = 'active' then 2 else 3 end`;
      const ordering = input.sort === "name"
        ? (input.direction === "asc" ? asc(clientAccounts.businessName) : desc(clientAccounts.businessName))
        : input.sort === "monthly"
          ? (input.direction === "asc" ? asc(clientAccounts.monthlyPriceCents) : desc(clientAccounts.monthlyPriceCents))
          : input.sort === "balance"
            ? (input.direction === "asc" ? asc(outstandingBalanceCents) : desc(outstandingBalanceCents))
            : input.sort === "status"
              ? (input.direction === "asc" ? asc(clientAccounts.status) : desc(clientAccounts.status))
              : attentionRank;

      const rows = await db
        .select({
          id: clientAccounts.id,
          businessName: clientAccounts.businessName,
          clientName: clientAccounts.clientName,
          clientEmail: clientAccounts.clientEmail,
          clientPhone: clientAccounts.clientPhone,
          websiteUrl: clientAccounts.websiteUrl,
          status: clientAccounts.status,
          planName: clientProjects.packageName,
          monthlyPriceCents: clientAccounts.monthlyPriceCents,
          billingCycle: clientAccounts.billingCycle,
          createdAt: clientAccounts.createdAt,
          updatedAt: clientAccounts.updatedAt,
          hasStripeSubscription: sql<number>`case when ${clientAccounts.stripeSubscriptionId} is null then 0 else 1 end`,
          hasStripeCustomer: sql<number>`case when ${clientAccounts.stripeCustomerId} is null then 0 else 1 end`,
          outstandingBalanceCents,
          unreconciledBalanceCents,
          overdueInvoiceCount,
        })
        .from(clientAccounts)
        .leftJoin(clientInvoices, eq(clientInvoices.clientAccountId, clientAccounts.id))
        .leftJoin(clientProjects, eq(clientAccounts.projectId, clientProjects.id))
        .where(and(...conditions))
        .groupBy(
          clientAccounts.id,
          clientAccounts.businessName,
          clientAccounts.clientName,
          clientAccounts.clientEmail,
          clientAccounts.clientPhone,
          clientAccounts.websiteUrl,
          clientAccounts.status,
          clientProjects.packageName,
          clientAccounts.monthlyPriceCents,
          clientAccounts.billingCycle,
          clientAccounts.createdAt,
          clientAccounts.updatedAt,
          clientAccounts.stripeSubscriptionId,
          clientAccounts.stripeCustomerId,
        )
        .orderBy(ordering, desc(clientAccounts.updatedAt), desc(clientAccounts.id))
        .limit(input.pageSize)
        .offset(offset);

      const total = toNumber(countResult?.total);
      const hasMore = offset + rows.length < total;

      return {
        items: rows.map((row) => ({
          ...row,
          hasStripeSubscription: row.hasStripeSubscription === 1,
          hasStripeCustomer: row.hasStripeCustomer === 1,
          outstandingBalanceCents: toNumber(row.outstandingBalanceCents),
          unreconciledBalanceCents: toNumber(row.unreconciledBalanceCents),
          overdueInvoiceCount: toNumber(row.overdueInvoiceCount),
          reconciliationState: toNumber(row.unreconciledBalanceCents) > 0 ? "unreconciled" as const : "reconciled" as const,
          displayStatus: toNumber(row.overdueInvoiceCount) > 0 ? "past_due" as const : row.status,
        })),
        nextCursor: hasMore ? encodeOffset(offset + rows.length) : null,
        total,
      };
    }),

  getCustomerSummary: publicProcedure
    .input(z.object({ accountId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      await assertStrictAdminAccess(ctx);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [account] = await db
        .select({
          id: clientAccounts.id,
          businessName: clientAccounts.businessName,
          clientName: clientAccounts.clientName,
          clientEmail: clientAccounts.clientEmail,
          clientPhone: clientAccounts.clientPhone,
          websiteUrl: clientAccounts.websiteUrl,
          status: clientAccounts.status,
          monthlyPriceCents: clientAccounts.monthlyPriceCents,
          billingCycle: clientAccounts.billingCycle,
          billingStartDate: clientAccounts.billingStartDate,
          projectId: clientAccounts.projectId,
          createdAt: clientAccounts.createdAt,
          updatedAt: clientAccounts.updatedAt,
          stripeSubscriptionId: clientAccounts.stripeSubscriptionId,
          stripeCustomerId: clientAccounts.stripeCustomerId,
        })
        .from(clientAccounts)
        .where(and(eq(clientAccounts.id, input.accountId), isNull(clientAccounts.removedAt)))
        .limit(1);
      if (!account) throw new Error("Customer not found.");

        const [invoiceSummary] = await db
      .select({
        paidInvoiceCents: sql<number>`coalesce(sum(case when ${clientInvoices.status} = 'paid' then ${clientInvoices.totalAmountCents} else 0 end), 0)`,
          outstandingInvoiceCents: sql<number>`coalesce(sum(case when ${clientInvoices.status} in ('open', 'overdue') and (${clientInvoices.stripeInvoiceId} is not null or ${clientInvoices.stripePaymentIntentId} is not null) then ${clientInvoices.totalAmountCents} else 0 end), 0)`,
          unreconciledInvoiceCents: sql<number>`coalesce(sum(case when ${clientInvoices.status} in ('open', 'overdue') and ${clientInvoices.stripeInvoiceId} is null and ${clientInvoices.stripePaymentIntentId} is null then ${clientInvoices.totalAmountCents} else 0 end), 0)`,
          invoiceCount: sql<number>`count(*)`,
        })
        .from(clientInvoices)
        .where(eq(clientInvoices.clientAccountId, input.accountId));

      return {
        account: { ...account, hasStripeSubscription: Boolean(account.stripeSubscriptionId) },
        invoiceSummary: {
          paidInvoiceCents: toNumber(invoiceSummary?.paidInvoiceCents),
          outstandingInvoiceCents: toNumber(invoiceSummary?.outstandingInvoiceCents),
          unreconciledInvoiceCents: toNumber(invoiceSummary?.unreconciledInvoiceCents),
          invoiceCount: toNumber(invoiceSummary?.invoiceCount),
        },
        disclosures: {
          subscription: account.stripeSubscriptionId
            ? "A Stripe subscription ID is linked locally. Live provider status is not synchronized in this workspace."
            : "No Stripe subscription ID is linked to this account locally.",
          balance: "Outstanding includes only open and overdue invoices with a local Stripe invoice or payment-intent reference. Unmatched local invoices are shown separately as unreconciled.",
        },
      };
    }),

  listInvoices: publicProcedure
    .input(z.object({
      query: z.string().max(120).optional(),
      status: z.enum(["draft", "open", "paid", "overdue", "void"]).optional(),
      accountId: z.number().int().positive().optional(),
      cursor: z.string().max(300).optional(),
      pageSize: pageSizeSchema,
    }).default({ pageSize: 25 }))
    .query(async ({ ctx, input }) => {
      await assertStrictAdminAccess(ctx);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const cursor = decodeCursor(input.cursor);
      if (input.cursor && !cursor) throw new Error("Invalid invoice cursor.");
      const query = normalizedQuery(input.query);
      const conditions = [];
      if (input.status) conditions.push(eq(clientInvoices.status, input.status));
      if (input.accountId) conditions.push(eq(clientInvoices.clientAccountId, input.accountId));
      if (query) {
        const pattern = `%${query}%`;
        conditions.push(or(
          like(clientInvoices.invoiceNumber, pattern),
          like(clientAccounts.businessName, pattern),
          like(clientAccounts.clientName, pattern),
        )!);
      }
      if (cursor) {
        conditions.push(or(
          lt(clientInvoices.createdAt, cursor.createdAt),
          and(eq(clientInvoices.createdAt, cursor.createdAt), lt(clientInvoices.id, cursor.id)),
        )!);
      }

      const baseConditions = conditions.slice(0, cursor ? -1 : conditions.length);
      const [countResult] = await db
        .select({ total: sql<number>`count(*)` })
        .from(clientInvoices)
        .leftJoin(clientAccounts, eq(clientInvoices.clientAccountId, clientAccounts.id))
        .where(baseConditions.length ? and(...baseConditions) : undefined);

      const rows = await db
        .select({
          id: clientInvoices.id,
          invoiceNumber: clientInvoices.invoiceNumber,
          status: clientInvoices.status,
          totalAmountCents: clientInvoices.totalAmountCents,
          dueDate: clientInvoices.dueDate,
          paidAt: clientInvoices.paidAt,
          invoiceType: clientInvoices.invoiceType,
          isRecurring: clientInvoices.isRecurring,
          shareToken: clientInvoices.shareToken,
          createdAt: clientInvoices.createdAt,
          accountId: clientAccounts.id,
          businessName: clientAccounts.businessName,
          clientName: clientAccounts.clientName,
          accountRemovedAt: clientAccounts.removedAt,
        })
        .from(clientInvoices)
        .leftJoin(clientAccounts, eq(clientInvoices.clientAccountId, clientAccounts.id))
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(clientInvoices.createdAt), desc(clientInvoices.id))
        .limit(input.pageSize + 1);

      const hasMore = rows.length > input.pageSize;
      const pageItems = hasMore ? rows.slice(0, input.pageSize) : rows;
      const last = pageItems.at(-1);
      return {
        items: pageItems,
        nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null,
        total: toNumber(countResult?.total),
      };
    }),

  listLeads: publicProcedure
    .input(z.object({
      query: z.string().max(120).optional(),
      status: z.enum(["new", "contacted", "in_progress", "proposal_sent", "won", "lost"]).optional(),
      cursor: z.string().max(300).optional(),
      pageSize: pageSizeSchema,
    }).default({ pageSize: 25 }))
    .query(async ({ ctx, input }) => {
      await assertStrictAdminAccess(ctx);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const cursor = decodeCursor(input.cursor);
      if (input.cursor && !cursor) throw new Error("Invalid lead cursor.");
      const query = normalizedQuery(input.query);
      const conditions = [isNull(wizardSubmissions.removedAt)];
      if (input.status) conditions.push(eq(wizardSubmissions.status, input.status));
      if (query) {
        const pattern = `%${query}%`;
        conditions.push(or(
          like(wizardSubmissions.businessName, pattern),
          like(wizardSubmissions.email, pattern),
          like(wizardSubmissions.phone, pattern),
          like(wizardSubmissions.website, pattern),
        )!);
      }
      if (cursor) {
        conditions.push(or(
          lt(wizardSubmissions.createdAt, cursor.createdAt),
          and(eq(wizardSubmissions.createdAt, cursor.createdAt), lt(wizardSubmissions.id, cursor.id)),
        )!);
      }
      const baseConditions = conditions.slice(0, cursor ? -1 : conditions.length);
      const [countResult] = await db.select({ total: sql<number>`count(*)` }).from(wizardSubmissions).where(and(...baseConditions));
      const rows = await db
        .select({
          id: wizardSubmissions.id,
          businessName: wizardSubmissions.businessName,
          contactName: wizardSubmissions.contactName,
          businessType: wizardSubmissions.businessType,
          email: wizardSubmissions.email,
          phone: wizardSubmissions.phone,
          source: wizardSubmissions.source,
          status: wizardSubmissions.status,
          followUpDate: wizardSubmissions.followUpDate,
          createdAt: wizardSubmissions.createdAt,
          statusUpdatedAt: wizardSubmissions.statusUpdatedAt,
        })
        .from(wizardSubmissions)
        .where(and(...conditions))
        .orderBy(desc(wizardSubmissions.createdAt), desc(wizardSubmissions.id))
        .limit(input.pageSize + 1);
      const hasMore = rows.length > input.pageSize;
      const pageItems = hasMore ? rows.slice(0, input.pageSize) : rows;
      const last = pageItems.at(-1);
      return { items: pageItems, nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null, total: toNumber(countResult?.total) };
    }),

  listProjects: publicProcedure
    .input(z.object({
      cursor: z.string().max(300).optional(),
      pageSize: pageSizeSchema,
    }).default({ pageSize: 25 }))
    .query(async ({ ctx, input }) => {
      await assertStrictAdminAccess(ctx);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const cursor = decodeCursor(input.cursor);
      if (input.cursor && !cursor) throw new Error("Invalid project cursor.");
      const conditions = cursor ? [or(
        lt(clientProjects.createdAt, cursor.createdAt),
        and(eq(clientProjects.createdAt, cursor.createdAt), lt(clientProjects.id, cursor.id)),
      )!] : [];
      const [countResult] = await db.select({ total: sql<number>`count(*)` }).from(clientProjects);
      const rows = await db
        .select({
          id: clientProjects.id,
          businessName: clientProjects.businessName,
          clientName: clientProjects.clientName,
          clientEmail: clientProjects.clientEmail,
          websiteDomain: clientProjects.websiteDomain,
          status: clientProjects.status,
          currentStage: clientProjects.currentStage,
          stageProgress: clientProjects.stageProgress,
          packageName: clientProjects.packageName,
          estimatedLaunchDate: clientProjects.estimatedLaunchDate,
          previewUrl: clientProjects.previewUrl,
          createdAt: clientProjects.createdAt,
        })
        .from(clientProjects)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(clientProjects.createdAt), desc(clientProjects.id))
        .limit(input.pageSize + 1);
      const hasMore = rows.length > input.pageSize;
      const pageItems = hasMore ? rows.slice(0, input.pageSize) : rows;
      const last = pageItems.at(-1);
      return { items: pageItems, nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null, total: toNumber(countResult?.total) };
    }),
});
