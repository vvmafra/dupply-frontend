import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader as Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { authLoginSchema } from "@/domain/auth/auth-login.schema";
import { getProfileRedirect } from "@/domain/auth/auth.helpers";
import { getAvailableProfiles, MOCK_DEMO_PROFILES, shouldAutoSelectProfile } from "@/domain/auth/auth-profiles";
import { resolveApiMode } from "@/lib/env";
import { ROUTES } from "@/lib/routes";
import { login as loginFromService } from "@/services/auth.service";

type LocationState = {
  from?: { pathname: string };
};

export function MockLoginForm() {
  const [email, setEmail] = useState("demo@dupply.com.br");
  const [password, setPassword] = useState("Dupply@Demo2026!");
  const [loading, setLoading] = useState(false);
  const { loginWithSession, setProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = authLoginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }

    setLoading(true);

    const result = await loginFromService(parsed.data.email, parsed.data.password);

    if (!result.ok) {
      toast.error(result.message);
      setLoading(false);
      return;
    }

    loginWithSession(result.session);

    const profiles =
      resolveApiMode() === "mock"
        ? (result.session.user.email === "demo@dupply.com.br" ? MOCK_DEMO_PROFILES : getAvailableProfiles(result.session.user.platformRole))
        : getAvailableProfiles(result.session.user.platformRole);
    const autoProfile = shouldAutoSelectProfile(profiles);

    if (autoProfile) {
      setProfile(autoProfile);
      const fromPath = locationState?.from?.pathname;
      navigate(fromPath ?? getProfileRedirect(autoProfile), { replace: true });
    } else {
      navigate(ROUTES.selectProfile, {
        replace: true,
        state: locationState?.from ? { from: locationState.from } : undefined,
      });
    }

    setLoading(false);
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-4">
          <img src="/dupply-logo.png" alt="Dupply" className="h-14 w-14 object-contain" />
        </div>
        <CardTitle className="text-2xl font-bold">Dupply</CardTitle>
        <CardDescription>Acesse o protótipo de demonstração</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
          <Button type="button" variant="outline" className="w-full" asChild>
            <Link to={ROUTES.sellerRegistration}>Criar conta de cedente</Link>
          </Button>
        </form>
        <div className="mt-6 pt-4 border-t border-muted/50 space-y-3">
          <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Contas de Teste (Clique para preencher)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              className="px-2 py-1.5 rounded bg-muted/30 hover:bg-muted/60 text-left truncate transition-colors text-muted-foreground hover:text-foreground"
              onClick={() => {
                setEmail("investor@dupply.com.br");
                setPassword("Dupply@Demo2026!");
              }}
            >
              💼 <strong>Investidor</strong>
              <span className="block text-[10px] text-muted-foreground truncate">investor@dupply.com.br</span>
            </button>
            <button
              type="button"
              className="px-2 py-1.5 rounded bg-muted/30 hover:bg-muted/60 text-left truncate transition-colors text-muted-foreground hover:text-foreground"
              onClick={() => {
                setEmail("seller@dupply.com.br");
                setPassword("Dupply@Demo2026!");
              }}
            >
              🏬 <strong>Cedente</strong>
              <span className="block text-[10px] text-muted-foreground truncate">seller@dupply.com.br</span>
            </button>
            <button
              type="button"
              className="px-2 py-1.5 rounded bg-muted/30 hover:bg-muted/60 text-left truncate transition-colors text-muted-foreground hover:text-foreground"
              onClick={() => {
                setEmail("analyst@dupply.com.br");
                setPassword("Dupply@Demo2026!");
              }}
            >
              🔍 <strong>Analista</strong>
              <span className="block text-[10px] text-muted-foreground truncate">analyst@dupply.com.br</span>
            </button>
            <button
              type="button"
              className="px-2 py-1.5 rounded bg-muted/30 hover:bg-muted/60 text-left truncate transition-colors text-muted-foreground hover:text-foreground"
              onClick={() => {
                setEmail("admin@dupply.com.br");
                setPassword("Dupply@Demo2026!");
              }}
            >
              ⚙️ <strong>Admin</strong>
              <span className="block text-[10px] text-muted-foreground truncate">admin@dupply.com.br</span>
            </button>
          </div>
          <button
            type="button"
            className="w-full py-1.5 rounded bg-primary/10 hover:bg-primary/20 text-center transition-colors text-xs font-medium text-primary"
            onClick={() => {
              setEmail("demo@dupply.com.br");
              setPassword("Dupply@Demo2026!");
            }}
          >
            🌟 <strong>Superuser Demo</strong> (Todos os perfis)
          </button>
          <div className="text-[10px] text-center text-muted-foreground/80 mt-1">
            Para testar com a API real (local), use: <br/>
            <span className="font-mono text-[9px] bg-muted/50 px-1 py-0.5 rounded">seller@dupply.dev.local</span> ou <span className="font-mono text-[9px] bg-muted/50 px-1 py-0.5 rounded">investor@dupply.dev.local</span><br/>
            (Senha: <span className="font-mono text-[9px]">dev-password-change-me</span>)
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
