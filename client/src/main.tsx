import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import { lazy, Suspense } from "react";
import { publicSafeHeaders } from "./lib/requestHeaders";
import ErrorBoundary from "./components/ErrorBoundary";
import { getLoginUrl } from "./const";
import "./index.css";

const App = lazy(() => import("./App"));
const InvoiceApp = lazy(() => import("./InvoiceApp"));
const isInvoiceEntry = window.location.pathname.startsWith("/invoice/");
const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        return publicSafeHeaders(window.location.pathname, () => window.localStorage.getItem("admin_session_token"));
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
      <Suspense fallback={<div role="status" style={{ minHeight: "100vh", padding: "48px 24px", background: "#f8fafc", color: "#0f172a", textAlign: "center", fontFamily: "Arial, sans-serif" }}>Loading {isInvoiceEntry ? "invoice" : "FlowSites"}…</div>}>
        {isInvoiceEntry ? <InvoiceApp /> : <App />}
      </Suspense>
      </ErrorBoundary>
    </QueryClientProvider>
  </trpc.Provider>
);
