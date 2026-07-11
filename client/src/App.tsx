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

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const utils = trpc.useUtils();

  const login = trpc.auth.adminLogin.useMutation({
    onSuccess: () => {
      setError("");
      utils.auth.me.invalidate();
    },
    onError: (e) => setError(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    login.mutate({ username: username.trim(), password });
  };

  return (
    <div className="min-h-screen bg-[#f8f9d7] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/tansylate-logo.svg" alt="TANSYLATE" className="h-8 mx-auto mb-6 opacity-80" />
          <p className="text-xs uppercase tracking-widest text-[#6B5C52]">Вход в панель управления</p>
        </div>
        <form onSubmit={submit} className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#6B5C52] mb-1.5">Логин</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full px-4 py-3 border border-[#DDD5C0] rounded-xl text-sm text-[#2B2521] focus:outline-none focus:border-[#1A1A1A]"
                disabled={login.isPending}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#6B5C52] mb-1.5">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-[#DDD5C0] rounded-xl text-sm text-[#2B2521] focus:outline-none focus:border-[#1A1A1A]"
                disabled={login.isPending}
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mb-4 text-center">{error}</p>}
          <button
            type="submit"
            disabled={!username.trim() || !password.trim() || login.isPending}
            className="w-full py-3 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest rounded-xl hover:bg-[#333] transition-colors disabled:opacity-40"
          >
            {login.isPending ? "Вход..." : "Войти"}
          </button>
        </form>
        <p className="text-center mt-6">
          <a href="/" className="text-xs text-[#6B5C52] hover:text-[#2B2521] transition-colors">← На главную</a>
        </p>
      </div>
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
  if (!user || (user as any).role !== "admin") return <AdminLogin />;
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
