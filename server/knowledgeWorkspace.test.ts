import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const root = path.resolve(process.cwd());
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const knowledgePath = "client/src/pages/KnowledgeCenter.tsx";

// Exact boundaries from git show f9fb85a3ca9408bf9575a904c3164399b0c60167.
// Keep the original bytes, including whitespace; do not normalize these blocks.
function section(source: string, start: string, end: string) {
  expect(source.split(start), `unique start marker: ${start}`).toHaveLength(2);
  expect(source.split(end), `unique end marker: ${end}`).toHaveLength(2);
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  expect(endIndex, `end marker follows ${start}`).toBeGreaterThan(startIndex);
  return source.slice(startIndex, endIndex);
}

function openingTags(source: string, name: string) {
  const file = ts.createSourceFile("workspace.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const tags: Array<ts.JsxOpeningElement | ts.JsxSelfClosingElement> = [];
  const visit = (node: ts.Node) => {
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText(file) === name) {
      tags.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return tags;
}

function attribute(tag: ts.JsxOpeningElement | ts.JsxSelfClosingElement, name: string) {
  const attr = tag.attributes.properties.find(
    (prop): prop is ts.JsxAttribute => ts.isJsxAttribute(prop) && prop.name.getText() === name,
  );
  return attr?.initializer?.getText();
}

describe("Admin Knowledge workspace source regressions", () => {
  it("composes the existing Knowledge Center inside the Admin shell and a fixed light theme", () => {
    const workspace = read("client/src/pages/AdminKnowledgeWorkspace.tsx");
    const app = read("client/src/App.tsx");
    expect(workspace).toMatch(/import\s*\{\s*AdminCommandShell\s*\}\s*from\s+["'][^"']*AdminCommandShell["']/);
    expect(workspace).toMatch(/import\s+KnowledgeCenter\s+from\s+["'][^"']*KnowledgeCenter["']/);
    expect(workspace).toMatch(/import\s*\{\s*ThemeProvider\s*\}\s*from\s+["'][^"']*ThemeContext["']/);
    expect(workspace).toMatch(/<AdminCommandShell\b[\s\S]*?<ThemeProvider\b[\s\S]*?<KnowledgeCenter\s+embedded\s*\/>\s*<\/ThemeProvider>\s*<\/AdminCommandShell>/);
    const shell = openingTags(workspace, "AdminCommandShell");
    const theme = openingTags(workspace, "ThemeProvider");
    expect(shell).toHaveLength(1);
    expect(theme).toHaveLength(1);
    expect(attribute(shell[0], "activeHref")).toBe('"/flowsites-admin-knowledge"');
    expect(attribute(shell[0], "title")).toBe('"Knowledge Center"');
    expect(attribute(theme[0], "defaultTheme")).toBe('"light"');
    expect(attribute(theme[0], "switchable")).toBe("{false}");
    expect(app).toMatch(/import\s+AdminKnowledgeWorkspace\s+from\s+["'][^"']*AdminKnowledgeWorkspace["']/);
    expect(app).toMatch(/path="\/flowsites-admin-knowledge"\s+component=\{AdminKnowledgeWorkspace\}/);
    expect(app).toMatch(/path="\/flowsites-admin-legacy-crm"\s+component=\{AdminDashboard\}/);
  });

  it("preserves every article byte from the existing content library", () => {
    const articles = section(read(knowledgePath), "const ARTICLES: Article[] = [", "const CATEGORIES: Category[] = [");
    expect(createHash("sha256").update(articles, "utf8").digest("hex")).toBe(
      "fdf365c3462cf1b776a2aba4585437654da65c27db70722d4fcb58c7227b0218",
    );
  });

  it("preserves every sales-deck byte, including descriptions and PDF URLs", () => {
    const decks = section(read(knowledgePath), "const SALES_DECKS: SalesDeck[] = [", "// ─── Sales Deck Card ──────────────────────────────────────────────────────────");
    expect(createHash("sha256").update(decks, "utf8").digest("hex")).toBe(
      "ba7ed92e3688a6ef7d9ad33c00ac6b8b7e6f15350211be780db64d6943468bfe",
    );
    const card = section(read(knowledgePath), "function SalesDeckCard(", "// ─── Main Component");
    expect(card).toContain("href={deck.deckUrl}");
    expect(card).toContain('target="_blank"');
    expect(card).toContain('rel="noopener noreferrer"');
  });

  it("keeps standalone embedding optional and replaces dark reading surfaces in both viewers", () => {
    const knowledge = read(knowledgePath);
    const viewer = read("client/src/components/LessonViewer.tsx");
    expect(knowledge).toMatch(/function KnowledgeCenter\s*\(\s*\{\s*embedded\s*=\s*false\s*\}/);
    expect(knowledge).toMatch(/!embedded\s*&&|embedded\s*\?/);
    for (const source of [knowledge, viewer]) {
      expect(source).not.toContain("bg-[oklch(0.13_0.01_260)]");
      expect(source).toMatch(/bg-(?:white|(?:gray|slate)-50|card)/);
      expect(source).toMatch(/text-(?:(?:gray|slate)-900|foreground)/);
    }
  });

  it("uses a native article button and exposes all main-tab selection states", () => {
    const knowledge = read(knowledgePath);
    const card = section(knowledge, "function ArticleCard(", "function ArticleDetail(");
    const articleButtons = openingTags(card, "button");
    expect(articleButtons).toHaveLength(1);
    expect(attribute(articleButtons[0], "type")).toBe('"button"');
    expect(attribute(articleButtons[0], "onClick")).toBe("{onClick}");
    const tablists = openingTags(knowledge, "div").filter(tag => attribute(tag, "role") === '"tablist"');
    expect(tablists).toHaveLength(1);
    const tabs = openingTags(knowledge, "button").filter(tag => attribute(tag, "onClick")?.includes("setMainTab("));
    expect(tabs).toHaveLength(3);
    for (const tab of ["articles", "lessons", "decks"]) {
      const button = tabs.find(tag => attribute(tag, "onClick")?.includes(`setMainTab("${tab}")`));
      expect(button, `${tab} tab`).toBeDefined();
      expect(attribute(button!, "role")).toBe('"tab"');
      expect(attribute(button!, "aria-selected")?.replace(/\s+/g, "")).toBe(`{mainTab==="${tab}"}`);
    }
  });

  it("retains authenticated lesson queries, progress tracking, quiz submission, and navigation", () => {
    const knowledge = read(knowledgePath);
    const viewer = read("client/src/components/LessonViewer.tsx");
    for (const source of [knowledge, viewer]) {
      expect(source).toContain("const { user } = useAuth();");
      expect(source).toMatch(/trpc\.learning\.getMyProgress\.useQuery\(undefined,\s*\{\s*enabled:\s*!!user\s*[,}]/);
    }
    expect(knowledge).toContain("trpc.learning.getLessons.useQuery()");
    expect(knowledge).toContain("trpc.learning.seedLessons.useMutation()");
    expect(knowledge).toContain("utils.learning.getLessons.invalidate()");
    expect(knowledge).toContain("ARTICLES.filter(");
    expect(knowledge).toContain('activeCategory === "All" || a.category === activeCategory');
    expect(knowledge).toContain("setSelectedArticle(article)");
    expect(knowledge).toContain("setSelectedLessonId(lesson.id)");
    expect(knowledge).toContain("<LessonViewer lessonId={selectedLessonId} onBack={() => setSelectedLessonId(null)} />");
    expect(knowledge).toContain("(completedSteps / lesson.stepCount) * 100");
    expect(viewer).toContain("trpc.learning.getLesson.useQuery({ lessonId })");
    expect(viewer).toContain("trpc.learning.completeStep.useMutation()");
    expect(viewer).toContain("trpc.learning.submitQuiz.useMutation()");
    expect(viewer).toContain("await completeStepMut.mutateAsync({");
    expect(viewer).toContain("stepNumber: currentStep + 1");
    expect(viewer).toContain("await submitQuizMut.mutateAsync({ lessonId, answers })");
    expect(viewer.match(/utils\.learning\.getMyProgress\.invalidate\(\)/g)).toHaveLength(2);
    expect(viewer).toContain("(completedStepsCount / totalSteps) * 100");
    expect(viewer).toContain("setSelectedAnswers({})");
    expect(viewer).toContain('setViewState("quiz")');
    expect(viewer).toContain("Back to Lessons");
  });
});
