import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import LocalPlan from "./pages/LocalPlan";
import LocalWorkspace from "./pages/LocalWorkspace";
import LocalAuth from "./pages/LocalAuth";
import LocalPublicTrip from "./pages/LocalPublicTrip";
import LocalAdmin from "./pages/LocalAdmin";
import AdminDashboard from "./pages/AdminDashboard";
import PublicTrip from "./pages/PublicTrip";
import TravelWorkspace from "./pages/TravelWorkspace";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
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
