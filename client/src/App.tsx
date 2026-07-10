import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import { trpc } from "@/lib/trpc";


function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "#f8f9d7",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999,
        animation: "splash-hide 0.5s ease-in 2.7s forwards",
      }}
    >
      <img
        src="/tansylate-eye.svg"
        alt=""
        style={{ width: 220, animation: "eye-pulse 2.6s cubic-bezier(0.4,0,0.6,1) forwards" }}
      />
    </div>
  );
}

function AdminRoute() {
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9d7]">
        <div className="w-8 h-8 border-2 border-[#A0755A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user || (user as any).role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9d7] gap-4">
        <p className="text-[#2B2521] text-lg font-serif">Доступ запрещён</p>
        <a href="/" className="text-sm text-[#A0755A] hover:underline">На главную</a>
      </div>
    );
  }
  return <Admin />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/catalog" component={Home} />
      <Route path="/product/:id" component={Home} />
      <Route path="/privacy" component={Home} />
      <Route path="/admin" component={AdminRoute} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem("tansylate_splash_shown"));

  const handleSplashDone = () => {
    sessionStorage.setItem("tansylate_splash_shown", "1");
    setShowSplash(false);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          {showSplash && <SplashScreen onDone={handleSplashDone} />}
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
