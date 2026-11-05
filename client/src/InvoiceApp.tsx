import { Route, Switch } from "wouter";
import { Toaster } from "./components/ui/sonner";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import PublicInvoice from "./pages/PublicInvoice";

/** Keep invoice links independent of the staff dashboard and marketing bundle. */
export default function InvoiceApp() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={false}>
        <Toaster theme="light" />
        <Switch>
          <Route path="/invoice/:shareToken" component={PublicInvoice} />
          <Route><div style={{ padding: 24, color: "#0f172a", background: "#ffffff" }}>This invoice link is incomplete. Please contact FlowSites.</div></Route>
        </Switch>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
