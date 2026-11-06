import { AdminCommandShell } from "@/components/AdminCommandShell";
import { ThemeProvider } from "@/contexts/ThemeContext";
import KnowledgeCenter from "@/pages/KnowledgeCenter";

/** Reuse the established training library while keeping the current Admin navigation. */
export default function AdminKnowledgeWorkspace() {
  return (
    <AdminCommandShell
      activeHref="/flowsites-admin-knowledge"
      title="Knowledge Center"
      subtitle="Articles, lessons, quizzes, and sales decks for your team."
    >
      <ThemeProvider defaultTheme="light" switchable={false}>
        <KnowledgeCenter embedded />
      </ThemeProvider>
    </AdminCommandShell>
  );
}
