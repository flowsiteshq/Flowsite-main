import { describe, it, expect } from "vitest";

describe("Admin Auth - ENV config", () => {
  it("should have ADMIN_SECRET_PASSWORD set in environment", () => {
    // The secret must be set for admin login to work
    const password = process.env.ADMIN_SECRET_PASSWORD;
    expect(password).toBeDefined();
    expect(typeof password).toBe("string");
    expect(password!.length).toBeGreaterThan(0);
  });

  it("should expose adminSecretPassword via ENV helper", async () => {
    const { ENV } = await import("./_core/env");
    expect(ENV.adminSecretPassword).toBeDefined();
    expect(typeof ENV.adminSecretPassword).toBe("string");
    expect(ENV.adminSecretPassword.length).toBeGreaterThan(0);
  });
});
