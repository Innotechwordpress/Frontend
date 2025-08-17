import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import About from "@/pages/about";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import Pricing from "@/pages/pricing";
import Checkout from "@/pages/checkout";
import NotFound from "@/pages/not-found";
import Chatbot from "@/components/chatbot";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-green-400 text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/login" component={isAuthenticated ? Dashboard : Login} />
      <Route path="/signup" component={isAuthenticated ? Dashboard : Signup} />
      <Route path="/dashboard" component={isAuthenticated ? Dashboard : Login} />
      <Route path="/profile" component={isAuthenticated ? Profile : Login} />
      <Route path="/settings" component={isAuthenticated ? Settings : Login} />
      <Route path="/checkout" component={isAuthenticated ? Checkout : Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <Chatbot />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
