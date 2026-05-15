import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { ROUTES } from "@/lib/routes";

import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { SelectProfilePage } from "@/pages/SelectProfilePage";
import { SellerRegistrationPage } from "@/pages/SellerRegistrationPage";
import { ConfirmationPage } from "@/pages/ConfirmationPage";

import { SellerDashboardPage } from "@/pages/seller/SellerDashboardPage";
import { SellerValidationPage } from "@/pages/seller/SellerValidationPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminValidationsPage } from "@/pages/admin/AdminValidationsPage";
import { AdminReceivablesPage } from "@/pages/admin/AdminReceivablesPage";
import { AdminTransactionsPage } from "@/pages/admin/AdminTransactionsPage";
import { AdminSellersPage } from "@/pages/admin/AdminSellersPage";

import { AnalystDashboardPage } from "@/pages/analyst/AnalystDashboardPage";
import { AnalystSellersPage } from "@/pages/analyst/AnalystSellersPage";
import { AnalystDuplicatasPage } from "@/pages/analyst/AnalystDuplicatasPage";
import { AnalystDuplicataDetailPage } from "@/pages/analyst/AnalystDuplicataDetailPage";
import { SellerReviewDetailPage } from "@/pages/SellerReviewDetailPage";

import { SellerDuplicatasPage } from "@/pages/seller/SellerDuplicatasPage";
import { NewDuplicataPage } from "@/pages/seller/NewDuplicataPage";

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
      <Route path="/register/seller" element={<SellerRegistrationPage />} />
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
      <Route path="/seller/receivables" element={<Navigate to={ROUTES.seller.duplicatas.list} replace />} />
      <Route path="/seller/receivables/new" element={<Navigate to={ROUTES.seller.duplicatas.new} replace />} />
      <Route path="/seller/receivables/:id" element={<Navigate to={ROUTES.seller.duplicatas.list} replace />} />

      <Route
        path="/seller/duplicatas"
        element={
          <ProtectedRoute profile="seller">
            <AppShell><SellerDuplicatasPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/duplicatas/new"
        element={
          <ProtectedRoute profile="seller">
            <AppShell><NewDuplicataPage /></AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/analyst"
        element={
          <ProtectedRoute profile="riskAnalyst">
            <AppShell><AnalystDashboardPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyst/sellers"
        element={
          <ProtectedRoute profile="riskAnalyst">
            <AppShell><AnalystSellersPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyst/sellers/:sellerId"
        element={
          <ProtectedRoute profile="riskAnalyst">
            <AppShell><SellerReviewDetailPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyst/duplicatas"
        element={
          <ProtectedRoute profile="riskAnalyst">
            <AppShell><AnalystDuplicatasPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyst/duplicatas/:id"
        element={
          <ProtectedRoute profile="riskAnalyst">
            <AppShell><AnalystDuplicataDetailPage /></AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/sellers"
        element={
          <ProtectedRoute profile="admin">
            <AppShell><AdminSellersPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sellers/:sellerId"
        element={
          <ProtectedRoute profile="admin">
            <AppShell><SellerReviewDetailPage /></AppShell>
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
