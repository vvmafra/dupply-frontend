import { useEffect, type ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SellerUnderReviewOverlay } from "@/components/seller/SellerUnderReviewOverlay";
import { useAuth } from "@/contexts/AuthContext";
import { useSeller } from "@/contexts/SellerContext";
import { AppSidebar } from "./Sidebar";
import { Header } from "./Header";

const SELLER_STATUS_POLL_MS = 30_000;

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isAuthenticated, selectedProfile } = useAuth();
  const { lifecycleStatus, refreshSellerStatus, isLoading: sellerLoading } = useSeller();

  useEffect(() => {
    if (
      !isAuthenticated ||
      selectedProfile !== "seller" ||
      lifecycleStatus !== "in_review"
    ) {
      return;
    }

    const interval = globalThis.setInterval(() => {
      void refreshSellerStatus();
    }, SELLER_STATUS_POLL_MS);

    return () => globalThis.clearInterval(interval);
  }, [isAuthenticated, selectedProfile, lifecycleStatus, refreshSellerStatus]);

  const isUnderReview = lifecycleStatus === "in_review";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header logoutOnly={isUnderReview} />
        <main
          className={isUnderReview ? "flex-1 overflow-hidden p-4 md:p-6" : "flex-1 overflow-auto p-4 md:p-6"}
          aria-hidden={isUnderReview || undefined}
        >
          {children}
        </main>
      </SidebarInset>
      {isUnderReview ? <SellerUnderReviewOverlay checkingStatus={sellerLoading} /> : null}
    </SidebarProvider>
  );
}
