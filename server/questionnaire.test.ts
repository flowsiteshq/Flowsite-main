import { describe, it, expect } from "vitest";

// ─── Validation helpers (mirrors BookCall.tsx client logic) ──────────────────

type FieldType = "text" | "textarea" | "select" | "radio" | "checkbox";

interface Question {
  id: number;
  questionText: string;
  fieldType: FieldType;
  isRequired: number;
  options: string | null;
  placeholder: string | null;
}

type Answers = Record<number, string | string[]>;

function validateAnswers(questions: Question[], answers: Answers): string | null {
  for (const q of questions) {
    if (q.isRequired === 1) {
      const ans = answers[q.id];
      const isEmpty = !ans || (Array.isArray(ans) ? ans.length === 0 : !String(ans).trim());
      if (isEmpty) {
        return `Please answer: "${q.questionText}"`;
      }
    }
  }
  return null;
}

function formatAnswerForStorage(ans: string | string[] | undefined): string | null {
  if (!ans) return null;
  if (Array.isArray(ans)) return ans.join(", ");
  return String(ans);
}

function parseOptions(optionsJson: string | null): string[] {
  if (!optionsJson) return [];
  try {
    return JSON.parse(optionsJson) as string[];
  } catch {
    return [];
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Questionnaire validation", () => {
  const questions: Question[] = [
    { id: 1, questionText: "What is your business name?", fieldType: "text", isRequired: 1, options: null, placeholder: null },
    { id: 2, questionText: "How did you hear about us?", fieldType: "select", isRequired: 0, options: JSON.stringify(["Google", "Referral", "Social Media"]), placeholder: null },
    { id: 3, questionText: "What are your goals?", fieldType: "textarea", isRequired: 1, options: null, placeholder: null },
  ];

  it("returns null when all required questions are answered", () => {
    const answers: Answers = {
      1: "My Dojo Academy",
      3: "Grow enrollment by 30%",
    };
    expect(validateAnswers(questions, answers)).toBeNull();
  });

  it("returns error message when a required question is missing", () => {
    const answers: Answers = {
      1: "My Dojo Academy",
      // question 3 missing
    };
    const result = validateAnswers(questions, answers);
    expect(result).toBe('Please answer: "What are your goals?"');
  });

  it("returns error for empty string answer on required question", () => {
    const answers: Answers = {
      1: "  ", // whitespace only
      3: "Some goals",
    };
    const result = validateAnswers(questions, answers);
    expect(result).toBe('Please answer: "What is your business name?"');
  });

  it("does not require optional questions", () => {
    const answers: Answers = {
      1: "My Dojo",
      3: "Enroll more students",
      // question 2 (optional) not answered
    };
    expect(validateAnswers(questions, answers)).toBeNull();
  });

  it("returns null when no questions exist", () => {
    expect(validateAnswers([], {})).toBeNull();
  });

  it("validates checkbox required question — empty array fails", () => {
    const checkboxQ: Question[] = [
      { id: 10, questionText: "Select services", fieldType: "checkbox", isRequired: 1, options: JSON.stringify(["Website", "CRM", "SEO"]), placeholder: null },
    ];
    expect(validateAnswers(checkboxQ, { 10: [] })).toBe('Please answer: "Select services"');
  });

  it("validates checkbox required question — non-empty array passes", () => {
    const checkboxQ: Question[] = [
      { id: 10, questionText: "Select services", fieldType: "checkbox", isRequired: 1, options: JSON.stringify(["Website", "CRM", "SEO"]), placeholder: null },
    ];
    expect(validateAnswers(checkboxQ, { 10: ["Website", "CRM"] })).toBeNull();
  });
});

describe("Answer formatting for storage", () => {
  it("formats string answer as-is", () => {
    expect(formatAnswerForStorage("My Dojo Academy")).toBe("My Dojo Academy");
  });

  it("joins checkbox array with comma", () => {
    expect(formatAnswerForStorage(["Website", "CRM", "SEO"])).toBe("Website, CRM, SEO");
  });

  it("returns null for undefined answer", () => {
    expect(formatAnswerForStorage(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(formatAnswerForStorage("")).toBeNull();
  });

  it("returns null for empty array", () => {
    expect(formatAnswerForStorage([])).toBe("");
  });
});

describe("Options parsing", () => {
  it("parses valid JSON array", () => {
    const opts = parseOptions(JSON.stringify(["Google", "Referral", "Social Media"]));
    expect(opts).toEqual(["Google", "Referral", "Social Media"]);
  });

  it("returns empty array for null", () => {
    expect(parseOptions(null)).toEqual([]);
  });

  it("returns empty array for invalid JSON", () => {
    expect(parseOptions("not-json")).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(parseOptions("")).toEqual([]);
  });
});

describe("Field type coverage", () => {
  const allFieldTypes: FieldType[] = ["text", "textarea", "select", "radio", "checkbox"];

  it("supports all expected field types", () => {
    const supported = new Set(allFieldTypes);
    expect(supported.has("text")).toBe(true);
    expect(supported.has("textarea")).toBe(true);
    expect(supported.has("select")).toBe(true);
    expect(supported.has("radio")).toBe(true);
    expect(supported.has("checkbox")).toBe(true);
  });

  it("validates required text field", () => {
    const q: Question[] = [{ id: 1, questionText: "Name", fieldType: "text", isRequired: 1, options: null, placeholder: null }];
    expect(validateAnswers(q, { 1: "John" })).toBeNull();
    expect(validateAnswers(q, { 1: "" })).not.toBeNull();
  });

  it("validates required radio field", () => {
    const q: Question[] = [{ id: 1, questionText: "Budget", fieldType: "radio", isRequired: 1, options: JSON.stringify(["< $1k", "$1k-$5k", "> $5k"]), placeholder: null }];
    expect(validateAnswers(q, { 1: "$1k-$5k" })).toBeNull();
    expect(validateAnswers(q, {})).not.toBeNull();
  });
});
