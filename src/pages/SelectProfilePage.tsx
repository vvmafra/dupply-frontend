import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProfileSelectionCard } from "@/components/auth/ProfileSelectionCard";
import { PublicShell } from "@/components/layout/PublicShell";
import { useAuth } from "@/contexts/AuthContext";
import { resolvePostLoginPath } from "@/domain/auth/auth.helpers";
import {
  getAvailableProfiles,
  MOCK_DEMO_PROFILES,
  shouldAutoSelectProfile,
} from "@/domain/auth/auth-profiles";
import { resolveApiMode } from "@/lib/env";

type LocationState = {
  from?: { pathname: string };
};

export function SelectProfilePage() {
  const { user, selectedProfile, setProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  const profiles = useMemo(() => {
    if (!user) return [];
    return resolveApiMode() === "mock"
      ? (user.email === "demo@dupply.com.br" ? MOCK_DEMO_PROFILES : getAvailableProfiles(user.platformRole))
      : getAvailableProfiles(user.platformRole);
  }, [user]);

  useEffect(() => {
    if (!user || selectedProfile) return;

    const autoProfile = shouldAutoSelectProfile(profiles);
    if (!autoProfile) return;

    setProfile(autoProfile);
    navigate(resolvePostLoginPath(autoProfile, locationState?.from?.pathname), { replace: true });
  }, [user, selectedProfile, profiles, setProfile, navigate, locationState?.from?.pathname]);

  function handleSelect(profile: (typeof profiles)[number]) {
    setProfile(profile);
    navigate(resolvePostLoginPath(profile, locationState?.from?.pathname), { replace: true });
  }

  return (
    <PublicShell>
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-5xl space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">Selecione seu perfil</h1>
            <p className="text-[#7C8594]">Escolha como deseja acessar a plataforma Dupply</p>
          </div>
          <ProfileSelectionCard profiles={profiles} onSelect={handleSelect} />
        </div>
      </main>
    </PublicShell>
  );
}
