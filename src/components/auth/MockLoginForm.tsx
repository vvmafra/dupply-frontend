import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader as Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { mockLogin } from "@/services/auth.service";
import { ROUTES } from "@/lib/routes";

export function MockLoginForm() {
  const [email, setEmail] = useState("demo@dupply.com.br");
  const [password, setPassword] = useState("Dupply@Demo2026!");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await mockLogin(email, password);
    if (result.success) {
      login(email);
      navigate(ROUTES.selectProfile);
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
        <p className="text-center text-xs text-muted-foreground mt-4">
          Acesso demonstrativo para o protótipo
        </p>
      </CardContent>
    </Card>
  );
}
