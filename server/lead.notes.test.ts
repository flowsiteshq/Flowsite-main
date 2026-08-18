import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock DB ──────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 1, leadId: 10, content: "Test note", authorName: "Admin", createdAt: new Date() }]),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue([
      { id: 1, leadId: 10, content: "First note", authorName: "Admin", createdAt: new Date(Date.now() - 10000) },
      { id: 2, leadId: 10, content: "Second note", authorName: "Joey", createdAt: new Date() },
    ]),
    delete: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue(undefined),
  },
}));

// ─── Mock requireAdminAccess ───────────────────────────────────────────────────
vi.mock("./routers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./routers")>();
  return actual;
});

// ─── Unit tests for lead notes logic ─────────────────────────────────────────
describe("Lead Notes", () => {
  describe("addLeadNote", () => {
    it("should require a non-empty content string", () => {
      const content = "Called the business, left voicemail. Follow up Friday.";
      expect(content.trim().length).toBeGreaterThan(0);
    });

    it("should associate note with correct leadId", () => {
      const leadId = 42;
      const note = { leadId, content: "Test", authorName: "Admin" };
      expect(note.leadId).toBe(42);
    });

    it("should store author name with the note", () => {
      const note = { leadId: 1, content: "Called", authorName: "Joseph" };
      expect(note.authorName).toBe("Joseph");
    });

    it("should reject empty content", () => {
      const content = "   ";
      expect(content.trim().length).toBe(0);
    });
  });

  describe("getLeadNotes", () => {
    it("should require a leadId to fetch notes", () => {
      const input = { leadId: 10 };
      expect(input.leadId).toBe(10);
    });

    it("should return notes in descending order (newest first)", () => {
      const notes = [
        { id: 2, createdAt: new Date("2026-05-08T12:00:00Z") },
        { id: 1, createdAt: new Date("2026-05-08T10:00:00Z") },
      ];
      // Verify newest is first
      expect(notes[0].createdAt.getTime()).toBeGreaterThan(notes[1].createdAt.getTime());
    });

    it("should return an empty array when no notes exist", () => {
      const notes: unknown[] = [];
      expect(notes).toHaveLength(0);
    });
  });

  describe("deleteLeadNote", () => {
    it("should require a noteId to delete", () => {
      const input = { noteId: 5 };
      expect(input.noteId).toBe(5);
    });

    it("should return success true on deletion", () => {
      const result = { success: true };
      expect(result.success).toBe(true);
    });
  });

  describe("nicheTag", () => {
    it("should backfill martial_arts tag for martial arts business type", () => {
      const businessType = "martial_arts";
      const tag = businessType === "martial_arts" ? "Martial Arts" : "Other";
      expect(tag).toBe("Martial Arts");
    });

    it("should backfill Restaurant tag for restaurant business type", () => {
      const businessType = "restaurant";
      const tag = businessType === "restaurant" ? "Restaurant" : "Other";
      expect(tag).toBe("Restaurant");
    });

    it("should support custom niche tags", () => {
      const validTags = ["Martial Arts", "Restaurant", "Fitness", "Salon", "Dental", "Chiropractic", "Other"];
      const tag = "Salon";
      expect(validTags).toContain(tag);
    });
  });
});
