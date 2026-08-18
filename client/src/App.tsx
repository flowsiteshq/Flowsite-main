import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Contact from "./pages/Contact";
import Analyzer from "./pages/Analyzer";
import AnalyzerResults from "./pages/AnalyzerResults";
import CaseStudyHomeUp from "./pages/CaseStudyHomeUp";
import CaseStudyMyDojo from "./pages/CaseStudyMyDojo";
import CaseStudyYaeger from "./pages/CaseStudyYaeger";
import CaseStudyZolamind from "./pages/CaseStudyZolamind";
import CaseStudyPolicyPilot from "./pages/CaseStudyPolicyPilot";
import CaseStudyDojoFlow from "./pages/CaseStudyDojoFlow";
import CaseStudyBlueTide from "./pages/CaseStudyBlueTide";
import CaseStudyDonBar from "./pages/CaseStudyDonBar";
import CaseStudyGrapheneX from "./pages/CaseStudyGrapheneX";
import CaseStudyHachKi from "./pages/CaseStudyHachKi";
import CaseStudyGreenBahamas from "./pages/CaseStudyGreenBahamas";
import GetStarted from "./pages/GetStarted";
import AIIntake from "./pages/AIIntake";
import BookCall from "./pages/BookCall";
import AdminSubmissions from "./pages/AdminSubmissions";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminScheduling from "./pages/AdminScheduling";
import ClientPortal from "./pages/ClientPortal";
import ClientBilling from "./pages/ClientBilling";
import AcceptInvite from "./pages/AcceptInvite";
import AcceptTechInvite from "./pages/AcceptTechInvite";
import PublicInvoice from "./pages/PublicInvoice";
import MartialArtsPage from "./pages/industries/MartialArts";
import GymsFitnessPage from "./pages/industries/GymsFitness";
import RoofingPage from "./pages/industries/Roofing";
import ContractorsPage from "./pages/industries/Contractors";
import MedSpasPage from "./pages/industries/MedSpas";
import RVParksPage from "./pages/industries/RVParks";
import RestaurantsPage from "./pages/industries/Restaurants";
import SalonsPage from "./pages/industries/Salons";
import HealthWellnessPage from "./pages/industries/HealthWellness";
import RealEstatePage from "./pages/industries/RealEstate";
import InsurancePage from "./pages/industries/Insurance";
import ServiceBusinessPage from "./pages/industries/ServiceBusiness";
import EcommercePage from "./pages/industries/Ecommerce";
import Layout from "./components/Layout";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import RepDashboard from "./pages/RepDashboard";
import RepLogin from "./pages/RepLogin";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ClientLogin from "./pages/ClientLogin";
import ClientSetupPassword from "./pages/ClientSetupPassword";
import ClientResetPassword from "./pages/ClientResetPassword";
import Interested from "./pages/Interested";
import { leadCaptureHref } from "./lib/leadCapture";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/analyzer" component={Analyzer} />
        <Route path="/analyzer/results/:shareId" component={AnalyzerResults} />
        <Route path="/case-study/homeup" component={CaseStudyHomeUp} />
        <Route path="/case-study/mydojo" component={CaseStudyMyDojo} />
        <Route path="/case-study/yaeger" component={CaseStudyYaeger} />
        <Route path="/case-study/zolamind" component={CaseStudyZolamind} />
        <Route path="/case-study/policypilot" component={CaseStudyPolicyPilot} />
        <Route path="/case-study/dojoflow" component={CaseStudyDojoFlow} />
        <Route path="/case-study/bluetide" component={CaseStudyBlueTide} />
        <Route path="/case-study/donbar" component={CaseStudyDonBar} />
        <Route path="/case-study/graphenex" component={CaseStudyGrapheneX} />
        <Route path="/case-study/hachki" component={CaseStudyHachKi} />
        <Route path="/case-study/greenbahamas" component={CaseStudyGreenBahamas} />
        <Route path="/get-started">{() => { if (typeof window !== "undefined") window.location.replace(leadCaptureHref({ intent: "Get started" })); return null; }}</Route>
        <Route path="/ai-intake" component={AIIntake} />
        <Route path="/schedule">{() => { if (typeof window !== "undefined") window.location.replace(leadCaptureHref({ intent: "Schedule a strategy call" })); return null; }}</Route>
        <Route path="/budget-wizard">{() => { if (typeof window !== "undefined") window.location.replace(leadCaptureHref({ intent: "Build a website budget" })); return null; }}</Route>
        <Route path="/portal" component={ClientPortal} />
        <Route path="/portal/:tab" component={ClientPortal} />
        <Route path="/client-portal" component={ClientPortal} />
        <Route path="/client-portal/:tab" component={ClientPortal} />
        <Route path="/client-login" component={ClientLogin} />
        <Route path="/client-setup" component={ClientSetupPassword} />
        <Route path="/client-reset-password" component={ClientResetPassword} />
        <Route path="/client-billing" component={ClientBilling} />
        <Route path="/accept-invite" component={AcceptInvite} />
        <Route path="/accept-tech-invite" component={AcceptTechInvite} />
        <Route path="/invoice/:shareToken" component={PublicInvoice} />
        <Route path="/admin/submissions" component={AdminSubmissions} />
        <Route path="/flowsites-admin-secret" component={AdminLogin} />
        <Route path="/flowsites-admin-dashboard" component={AdminDashboard} />
        <Route path="/flowsites-admin-scheduling" component={AdminScheduling} />
        <Route path="/industries/martial-arts" component={MartialArtsPage} />
        <Route path="/industries/gyms-fitness" component={GymsFitnessPage} />
        <Route path="/industries/roofing" component={RoofingPage} />
        <Route path="/industries/contractors" component={ContractorsPage} />
        <Route path="/industries/med-spas" component={MedSpasPage} />
        <Route path="/industries/rv-parks" component={RVParksPage} />
        <Route path="/industries/restaurants" component={RestaurantsPage} />
        <Route path="/industries/salons" component={SalonsPage} />
        <Route path="/industries/health-wellness" component={HealthWellnessPage} />
        <Route path="/industries/real-estate" component={RealEstatePage} />
        <Route path="/industries/insurance" component={InsurancePage} />
        <Route path="/industries/service-business" component={ServiceBusinessPage} />
        <Route path="/industries/ecommerce" component={EcommercePage} />
        <Route path="/interested" component={Interested} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/refund-policy" component={RefundPolicy} />
        <Route path="/rep-dashboard" component={RepDashboard} />
        <Route path="/rep-login" component={RepLogin} />
        <Route path="/login" component={Login} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
