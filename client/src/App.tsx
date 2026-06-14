import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";

function EyeSVG() {
  return (
    <svg
      width="180" height="130"
      viewBox="0 0 180 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: "eye-pulse 2.6s cubic-bezier(0.4,0,0.6,1) forwards" }}
    >
      {/* Outer oval frame */}
      <ellipse cx="90" cy="65" rx="86" ry="58" stroke="#1A1A1A" strokeWidth="2.5"/>

      {/* Eye almond / lens shape */}
      <path
        d="M4 65 C28 28, 152 28, 176 65 C152 102, 28 102, 4 65 Z"
        fill="#FFFDF0" stroke="#1A1A1A" strokeWidth="2.5" strokeLinejoin="round"
      />

      {/* Iris */}
      <circle cx="90" cy="65" r="26" stroke="#1A1A1A" strokeWidth="2"/>

      {/* Pupil */}
      <circle cx="90" cy="65" r="9" fill="#1A1A1A"/>

      {/* Left corner decorative swirl */}
      <path
        d="M4 65 C-4 55,-7 42, 2 34 C9 27, 18 31, 14 40 C11 47, 4 43, 7 36"
        stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" fill="none"
      />

      {/* Right corner tail */}
      <path
        d="M176 65 C184 56, 187 45, 180 37"
        stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" fill="none"
      />

      {/* Top lashes */}
      <path d="M62 36 C59 27, 56 20" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M90 30 L90 21" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M118 36 C121 27, 124 20" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "#FFFDF0",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999,
        animation: "splash-hide 0.5s ease-in 2.7s forwards",
      }}
    >
      <EyeSVG />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/catalog" component={Home} />
      <Route path="/product/:id" component={Home} />
      <Route path="/privacy" component={Home} />
      <Route path="/admin" component={Admin} />
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
