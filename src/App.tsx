import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { GuestRoute, ProtectedRoute, SemiProtectedRoute } from "@/routes/guards";
import { ROUTES } from "@/lib/routes";

import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { SelectProfilePage } from "@/pages/SelectProfilePage";
import { SellerRegistrationPage } from "@/pages/SellerRegistrationPage";
import { SellerRegistrationCompletePage } from "@/pages/SellerRegistrationCompletePage";
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
import { AnalystReceivablesPage } from "@/pages/analyst/AnalystReceivablesPage";
import { AnalystReceivableDetailPage } from "@/pages/analyst/AnalystReceivableDetailPage";
import { SellerReviewDetailPage } from "@/pages/SellerReviewDetailPage";

import { SellerReceivablesPage } from "@/pages/seller/SellerReceivablesPage";
import { NewReceivablePage } from "@/pages/seller/NewReceivablePage";

function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<LandingPage />} />
      <Route
        path={ROUTES.login}
        element={
          <GuestRoute allowAuthenticatedView>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route path={ROUTES.sellerRegistration} element={<SellerRegistrationPage />} />
      <Route path={ROUTES.sellerRegistrationComplete} element={<SellerRegistrationCompletePage />} />
      <Route
        path={ROUTES.selectProfile}
        element={
          <SemiProtectedRoute>
            <SelectProfilePage />
          </SemiProtectedRoute>
        }
      />
      <Route path={ROUTES.confirmation.path} element={<ConfirmationPage />} />

      <Route
        path={ROUTES.seller.dashboard}
        element={
          <ProtectedRoute profile="seller">
            <AppShell>
              <SellerDashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.seller.validation}
        element={
          <ProtectedRoute profile="seller">
            <AppShell>
              <SellerValidationPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.seller.receivables.list}
        element={
          <ProtectedRoute profile="seller">
            <AppShell>
              <SellerReceivablesPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.seller.receivables.new}
        element={
          <ProtectedRoute profile="seller">
            <AppShell>
              <NewReceivablePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route path="/seller/duplicatas" element={<Navigate to={ROUTES.seller.receivables.list} replace />} />
      <Route path="/seller/duplicatas/new" element={<Navigate to={ROUTES.seller.receivables.new} replace />} />
      <Route path="/seller/duplicatas/*" element={<Navigate to={ROUTES.seller.receivables.list} replace />} />

      <Route
        path={ROUTES.analyst.dashboard}
        element={
          <ProtectedRoute profile="riskAnalyst">
            <AppShell>
              <AnalystDashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.analyst.sellers.list}
        element={
          <ProtectedRoute profile="riskAnalyst">
            <AppShell>
              <AnalystSellersPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${ROUTES.analyst.sellers.list}/:sellerId`}
        element={
          <ProtectedRoute profile="riskAnalyst">
            <AppShell>
              <SellerReviewDetailPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.analyst.receivables.list}
        element={
          <ProtectedRoute profile="riskAnalyst">
            <AppShell>
              <AnalystReceivablesPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${ROUTES.analyst.receivables.list}/:id`}
        element={
          <ProtectedRoute profile="riskAnalyst">
            <AppShell>
              <AnalystReceivableDetailPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route path="/analyst/duplicatas" element={<Navigate to={ROUTES.analyst.receivables.list} replace />} />
      <Route path="/analyst/duplicatas/*" element={<Navigate to={ROUTES.analyst.receivables.list} replace />} />

      <Route
        path={ROUTES.admin.sellers.list}
        element={
          <ProtectedRoute profile="admin">
            <AppShell>
              <AdminSellersPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${ROUTES.admin.sellers.list}/:sellerId`}
        element={
          <ProtectedRoute profile="admin">
            <AppShell>
              <SellerReviewDetailPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.admin.dashboard}
        element={
          <ProtectedRoute profile="admin">
            <AppShell>
              <AdminDashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.admin.validations}
        element={
          <ProtectedRoute profile="admin">
            <AppShell>
              <AdminValidationsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.admin.receivables}
        element={
          <ProtectedRoute profile="admin">
            <AppShell>
              <AdminReceivablesPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.admin.transactions}
        element={
          <ProtectedRoute profile="admin">
            <AppShell>
              <AdminTransactionsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  );
}

export function App() {
  return <AppRoutes />;
}

export default App;
