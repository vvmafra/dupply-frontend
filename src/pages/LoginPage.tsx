import { MockLoginForm } from "@/components/auth/MockLoginForm";
import { SessionActiveBanner } from "@/components/auth/SessionActiveBanner";
import { PublicShell } from "@/components/layout/PublicShell";
import { useAuth } from "@/contexts/AuthContext";

export function LoginPage() {
  const { isAuthenticated } = useAuth();

  return (
    <PublicShell>
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        {isAuthenticated ? (
          <div className="w-full max-w-md">
            <SessionActiveBanner />
          </div>
        ) : (
          <MockLoginForm />
        )}
      </main>
    </PublicShell>
  );
}
