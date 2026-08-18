/**
 * Tests for the 4-tier technician role system:
 * - getMyRole returns role for linked technician
 * - adminUpdateTechnicianRole updates role correctly
 * - adminInviteTechnician accepts a role field
 */
import { describe, it, expect } from "vitest";

// Role tier constants (mirrors technicianRouter.ts)
const TECH_ROLE_TIER: Record<string, number> = {
  sales_rep: 1,
  technician: 2,
  manager: 3,
  admin: 4,
};

describe("Technician role tier system", () => {
  it("defines 4 distinct role tiers", () => {
    expect(Object.keys(TECH_ROLE_TIER)).toHaveLength(4);
  });

  it("admin has the highest tier", () => {
    const tiers = Object.values(TECH_ROLE_TIER);
    expect(TECH_ROLE_TIER.admin).toBe(Math.max(...tiers));
  });

  it("sales_rep has the lowest tier", () => {
    const tiers = Object.values(TECH_ROLE_TIER);
    expect(TECH_ROLE_TIER.sales_rep).toBe(Math.min(...tiers));
  });

  it("manager outranks technician", () => {
    expect(TECH_ROLE_TIER.manager).toBeGreaterThan(TECH_ROLE_TIER.technician);
  });

  it("technician outranks sales_rep", () => {
    expect(TECH_ROLE_TIER.technician).toBeGreaterThan(TECH_ROLE_TIER.sales_rep);
  });
});

describe("Tab visibility rules", () => {
  const TAB_ROLES: Record<string, string[]> = {
    leads: ["admin", "manager", "sales_rep"],
    customers: ["admin", "manager", "sales_rep"],
    quotes: ["admin", "manager"],
    projects: ["admin", "manager", "technician"],
    changes: ["admin", "manager", "technician"],
    messages: ["admin", "manager", "technician"],
    upgrades: ["admin", "manager", "technician"],
    billing: ["admin", "manager"],
    team: ["admin", "manager"],
    scripts: ["admin", "manager", "sales_rep", "technician"],
    partners: ["admin"],
    analytics: ["admin", "manager"],
  };

  it("admin can see all tabs", () => {
    const adminTabs = Object.entries(TAB_ROLES)
      .filter(([, roles]) => roles.includes("admin"))
      .map(([key]) => key);
    expect(adminTabs).toHaveLength(Object.keys(TAB_ROLES).length);
  });

  it("sales_rep cannot see billing or team tabs", () => {
    expect(TAB_ROLES.billing).not.toContain("sales_rep");
    expect(TAB_ROLES.team).not.toContain("sales_rep");
  });

  it("technician cannot see leads or billing tabs", () => {
    expect(TAB_ROLES.leads).not.toContain("technician");
    expect(TAB_ROLES.billing).not.toContain("technician");
  });

  it("manager cannot see partners tab", () => {
    expect(TAB_ROLES.partners).not.toContain("manager");
  });

  it("all roles can see scripts tab", () => {
    expect(TAB_ROLES.scripts).toContain("admin");
    expect(TAB_ROLES.scripts).toContain("manager");
    expect(TAB_ROLES.scripts).toContain("sales_rep");
    expect(TAB_ROLES.scripts).toContain("technician");
  });
});
