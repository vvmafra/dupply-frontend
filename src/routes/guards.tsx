import { Navigate, useLocation } from "react-router-dom";
import { AuthBootstrapFallback } from "@/components/auth/AuthBootstrapFallback";
import { useAuth } from "@/contexts/AuthContext";
import { getProfileRedirect } from "@/domain/auth/auth.helpers";
import type { UserProfile } from "@/domain/auth/auth.types";
import { ROUTES } from "@/lib/routes";

type ProtectedRouteProps = {
  children: React.ReactNode;
  profile?: UserProfile;
};

export function ProtectedRoute({ children, profile }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, selectedProfile } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthBootstrapFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  if (!selectedProfile) {
    return <Navigate to={ROUTES.selectProfile} state={{ from: location }} replace />;
  }

  if (profile && selectedProfile !== profile) {
    return <Navigate to={ROUTES.selectProfile} state={{ from: location }} replace />;
  }

  return children;
}

type GuestRouteProps = {
  children: React.ReactNode;
  redirectTo?: string;
  allowAuthenticatedView?: boolean;
};

export function GuestRoute({ children, redirectTo, allowAuthenticatedView }: GuestRouteProps) {
  const { isAuthenticated, isLoading, selectedProfile } = useAuth();

  if (isLoading) {
    return <AuthBootstrapFallback />;
  }

  if (isAuthenticated) {
    if (allowAuthenticatedView) {
      return children;
    }

    const target =
      redirectTo ?? (selectedProfile ? getProfileRedirect(selectedProfile) : ROUTES.selectProfile);
    return <Navigate to={target} replace />;
  }

  return children;
}

type SemiProtectedRouteProps = {
  children: React.ReactNode;
};

export function SemiProtectedRoute({ children }: SemiProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthBootstrapFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  return children;
}
