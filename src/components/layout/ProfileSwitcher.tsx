import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getProfileLabel, getProfileRedirect } from "@/domain/auth/auth.helpers";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/domain/auth/auth.types";

const profiles: UserProfile[] = ["seller", "investor", "admin"];

export function ProfileSwitcher() {
  const { selectedProfile, setProfile } = useAuth();

  return (
    <div className="flex gap-2">
      {profiles.map((p) => (
        <Button
          key={p}
          variant={selectedProfile === p ? "default" : "outline"}
          size="sm"
          asChild
          onClick={() => setProfile(p)}
        >
          <Link to={getProfileRedirect(p)}>{getProfileLabel(p)}</Link>
        </Button>
      ))}
    </div>
  );
}
