import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

const LocalPlan = lazy(() => import("./pages/LocalPlan"));
const LocalWorkspace = lazy(() => import("./pages/LocalWorkspace"));
const LocalAuth = lazy(() => import("./pages/LocalAuth"));
const LocalPublicTrip = lazy(() => import("./pages/LocalPublicTrip"));
const LocalAdmin = lazy(() => import("./pages/LocalAdmin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PublicTrip = lazy(() => import("./pages/PublicTrip"));
const TravelWorkspace = lazy(() => import("./pages/TravelWorkspace"));

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<main className="loading-page">Opening your travel desk…</main>}>
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/plan"} component={LocalPlan} />
      <Route path={"/local"} component={LocalWorkspace} />
      <Route path={"/auth"} component={LocalAuth} />
      <Route path={"/local/share/:tripId"} component={LocalPublicTrip} />
      <Route path={"/local-admin"} component={LocalAdmin} />
      <Route path={"/app"} component={TravelWorkspace} />
      <Route path={"/discover"} component={TravelWorkspace} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/share/:shareCode"} component={PublicTrip} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
