import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/layout/AppShell";

import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { SelectProfilePage } from "@/pages/SelectProfilePage";
import { ConfirmationPage } from "@/pages/ConfirmationPage";

import { SellerDashboardPage } from "@/pages/seller/SellerDashboardPage";
import { SellerValidationPage } from "@/pages/seller/SellerValidationPage";
import { SellerReceivablesPage } from "@/pages/seller/SellerReceivablesPage";
import { NewReceivablePage } from "@/pages/seller/NewReceivablePage";
import { ReceivableDetailPage } from "@/pages/seller/ReceivableDetailPage";

import { InvestorDashboardPage } from "@/pages/investor/InvestorDashboardPage";
import { MarketplacePage } from "@/pages/investor/MarketplacePage";
import { MarketplaceDetailPage } from "@/pages/investor/MarketplaceDetailPage";
import { InvestorPositionsPage } from "@/pages/investor/InvestorPositionsPage";

import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminValidationsPage } from "@/pages/admin/AdminValidationsPage";
import { AdminReceivablesPage } from "@/pages/admin/AdminReceivablesPage";
import { AdminTransactionsPage } from "@/pages/admin/AdminTransactionsPage";

function ProtectedRoute({ children, profile }: { children: React.ReactNode; profile?: string }) {
  const { isAuthenticated, selectedProfile } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (profile && selectedProfile !== profile) return <Navigate to="/select-profile" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/select-profile" element={<SelectProfilePage />} />
      <Route path="/confirmation/:id" element={<ConfirmationPage />} />

      <Route
        path="/seller"
        element={
          <ProtectedRoute profile="seller">
            <AppShell><SellerDashboardPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/validation"
        element={
          <ProtectedRoute profile="seller">
            <AppShell><SellerValidationPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/receivables"
        element={
          <ProtectedRoute profile="seller">
            <AppShell><SellerReceivablesPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/receivables/new"
        element={
          <ProtectedRoute profile="seller">
            <AppShell><NewReceivablePage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/receivables/:id"
        element={
          <ProtectedRoute profile="seller">
            <AppShell><ReceivableDetailPage /></AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/investor"
        element={
          <ProtectedRoute profile="investor">
            <AppShell><InvestorDashboardPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/investor/marketplace"
        element={
          <ProtectedRoute profile="investor">
            <AppShell><MarketplacePage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/investor/marketplace/:id"
        element={
          <ProtectedRoute profile="investor">
            <AppShell><MarketplaceDetailPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/investor/positions"
        element={
          <ProtectedRoute profile="investor">
            <AppShell><InvestorPositionsPage /></AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute profile="admin">
            <AppShell><AdminDashboardPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/validations"
        element={
          <ProtectedRoute profile="admin">
            <AppShell><AdminValidationsPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/receivables"
        element={
          <ProtectedRoute profile="admin">
            <AppShell><AdminReceivablesPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions"
        element={
          <ProtectedRoute profile="admin">
            <AppShell><AdminTransactionsPage /></AppShell>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
