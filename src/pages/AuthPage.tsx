import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";

type AuthMode = "login" | "signup" | "forgot";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export default function AuthPage() {
  const { user, loading, signIn, signUp, signInWithOAuth, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: "Fraca", color: "bg-destructive" };
    if (score <= 2) return { level: 2, label: "Razoável", color: "bg-yellow-500" };
    if (score <= 3) return { level: 3, label: "Boa", color: "bg-blue-500" };
    return { level: 4, label: "Forte", color: "bg-green-500" };
  };
  const pwdStrength = mode === "signup" ? getPasswordStrength(password) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos" : error.message);
        } else {
          toast.success("Bem-vindo de volta! 🎉");
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Conta criada! Verifique seu e-mail para confirmar. 📩");
        }
      } else {
        const { error } = await resetPassword(email);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("E-mail de recuperação enviado! Verifique sua caixa de entrada. 📩");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    const { error } = await signInWithOAuth(provider);
    if (error) toast.error(error.message);
  };

  const titles = {
    login: "Entrar",
    signup: "Criar conta",
    forgot: "Recuperar senha",
  };

  const subtitles = {
    login: "Acesse sua conta para gerenciar seus links",
    signup: "Crie sua conta gratuita e comece agora",
    forgot: "Informe seu e-mail para receber o link de recuperação",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display text-gradient">LinkPro</h1>
          <p className="text-muted-foreground text-sm mt-1">Smart Links para seu negócio</p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-foreground mb-1">{titles[mode]}</h2>
          <p className="text-sm text-muted-foreground mb-6">{subtitles[mode]}</p>

          {/* Social login */}
          {mode !== "forgot" && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => handleOAuth("google")}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  <GoogleIcon />
                  Google
                </button>
                <button
                  onClick={() => handleOAuth("github")}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  <GithubIcon />
                  GitHub
                </button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">ou</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>

            {mode !== "forgot" && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            )}

            {mode === "signup" && password && pwdStrength && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= pwdStrength.level ? pwdStrength.color : "bg-border"}`} />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Força: <span className="font-medium">{pwdStrength.label}</span>
                  {pwdStrength.level < 3 && " — use maiúsculas, números e símbolos"}
                </p>
              </div>
            )}

            {mode === "login" && (
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-xs text-primary hover:underline"
              >
                Esqueceu a senha?
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? "Aguarde..." : titles[mode]}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Não tem conta?{" "}
                <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">
                  Criar conta
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button onClick={() => setMode("login")} className="text-primary font-medium hover:underline">
                  Entrar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
