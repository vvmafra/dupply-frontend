import { MockLoginForm } from "@/components/auth/MockLoginForm";
import { PublicShell } from "@/components/layout/PublicShell";

export function LoginPage() {
  return (
    <PublicShell>
      <main className="flex flex-1 items-center justify-center p-4">
        <MockLoginForm />
      </main>
    </PublicShell>
  );
}
