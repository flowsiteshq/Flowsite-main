import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { publicSafeHeaders } from "../client/src/lib/requestHeaders";

const source = (relative: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relative), "utf8");

describe("mobile public invoice regressions", () => {
  it("returns empty headers when browser storage is blocked", () => {
    expect(publicSafeHeaders("/admin", () => {
      throw new Error("Storage access blocked");
    })).toEqual({});
  });

  it("never reads an admin token on a public invoice path", () => {
    const readToken = vi.fn(() => "private-admin-token");
    expect(publicSafeHeaders("/invoice/shared-token", readToken)).toEqual({});
    expect(readToken).not.toHaveBeenCalled();
  });

  it("preserves admin authentication for non-invoice paths", () => {
    expect(publicSafeHeaders("/admin", () => "admin-token")).toEqual({
      "x-admin-token": "admin-token",
    });
  });

  it("returns empty headers when no admin token exists", () => {
    expect(publicSafeHeaders("/", () => null)).toEqual({});
    expect(publicSafeHeaders("/admin", () => "")).toEqual({});
  });

  it("isolates invoice startup from the full app with a visible lazy-loading fallback", () => {
    const main = source("client/src/main.tsx");
    expect(main).toMatch(/lazy\s*\(\s*\(\)\s*=>\s*import\(["']\.\/App["']\)/);
    expect(main).not.toMatch(/import\s+App\s+from\s+["']\.\/App["']/);
    expect(main).toMatch(/location\.pathname\.startsWith\(["']\/invoice\/["']\)/);
    expect(main).toContain("<InvoiceApp");
    expect(main).toContain("<App");
    expect(main).toMatch(/<Suspense\s+fallback=/);
    expect(main).toMatch(/Loading[^<\n]*/i);
    expect(main).toMatch(/publicSafeHeaders\s*\(\s*(?:window\.)?location\.pathname/);
    expect(main).toContain('localStorage.getItem("admin_session_token")');
  });

  it("keeps the standalone invoice route protected and consistently light themed", () => {
    const invoiceApp = source("client/src/InvoiceApp.tsx");
    expect(invoiceApp).toMatch(/<Route\b[^>]*path=["']\/invoice\/:shareToken["'][^>]*component=\{PublicInvoice\}/);
    expect(invoiceApp).toContain("<ErrorBoundary");
    expect(invoiceApp).toMatch(/<ThemeProvider\b[^>]*defaultTheme=["']light["']/);
    expect(invoiceApp).toContain("switchable={false}");
    expect(invoiceApp).toMatch(/<Toaster\b[^>]*theme=["']light["']/);
    expect(invoiceApp).not.toMatch(/from\s+["']\.\/App["']/);
  });

  it("stacks invoice headers on mobile and avoids rendering a numeric recurring flag", () => {
    const invoice = source("client/src/pages/PublicInvoice.tsx");
    const header = invoice.slice(invoice.indexOf("Top action bar"), invoice.indexOf("Bill to / dates"));
    expect(header).toMatch(/className=["'][^"']*flex-col[^"']*sm:flex-row/);
    expect(invoice).toMatch(/\{\s*(?:Boolean\(invoice\.isRecurring\)|invoice\.isRecurring\s*!==\s*0)\s*&&/);
    expect(invoice).not.toMatch(/\{\s*invoice\.isRecurring\s*&&/);
  });

  it("provides readable loading feedback and a retry action for invoice errors", () => {
    const invoice = source("client/src/pages/PublicInvoice.tsx");
    const loadingAndError = invoice.slice(invoice.indexOf("if (isLoading)"), invoice.indexOf("const { invoice,"));
    expect(loadingAndError).toContain("Loading invoice...");
    expect(invoice).toContain("refetch");
    expect(loadingAndError).toMatch(/onClick=\{[^}]*refetch/);
    expect(loadingAndError).toMatch(/Try again|Retry/i);
    expect(loadingAndError).toContain("mailto:hello@flow-sites.com");
  });
});
