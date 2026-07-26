import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { AdminOffersReadyPage } from "@/pages/admin/AdminOffersReadyPage";
import { AdminCreateOfferPage } from "@/pages/admin/AdminCreateOfferPage";
import { AdminOffersPage } from "@/pages/admin/AdminOffersPage";
import { AdminOfferDetailPage } from "@/pages/admin/AdminOfferDetailPage";
import { AdminInvestmentsPage } from "@/pages/admin/AdminInvestmentsPage";

import { InvestorOpportunitiesPage } from "@/pages/investor/InvestorOpportunitiesPage";
import { InvestorOfferDetailPage } from "@/pages/investor/InvestorOfferDetailPage";
import { InvestorInvestmentsPage } from "@/pages/investor/InvestorInvestmentsPage";
import { InvestorAccountPage } from "@/pages/investor/InvestorAccountPage";

import { AnalystDashboardPage } from "@/pages/analyst/AnalystDashboardPage";
import { AnalystSellersPage } from "@/pages/analyst/AnalystSellersPage";
import { AnalystDuplicatasPage } from "@/pages/analyst/AnalystDuplicatasPage";
import { AnalystDuplicataDetailPage } from "@/pages/analyst/AnalystDuplicataDetailPage";
import { SellerReviewDetailPage } from "@/pages/SellerReviewDetailPage";

import { SellerDuplicatasPage } from "@/pages/seller/SellerDuplicatasPage";
import { NewDuplicataPage } from "@/pages/seller/NewDuplicataPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<LandingPage />} />
      <Route
        path={ROUTES.login}
        element={
          <GuestRoute>
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
      <Route path="/confirmation/:id" element={<ConfirmationPage />} />

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
        path="/seller/receivables"
        element={<Navigate to={ROUTES.seller.duplicatas.list} replace />}
      />
      <Route
        path="/seller/receivables/new"
        element={<Navigate to={ROUTES.seller.duplicatas.new} replace />}
      />
      <Route
        path="/seller/receivables/:id"
        element={<Navigate to={ROUTES.seller.duplicatas.list} replace />}
      />

      <Route
        path={ROUTES.seller.duplicatas.list}
        element={
          <ProtectedRoute profile="seller">
            <AppShell>
              <SellerDuplicatasPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.seller.duplicatas.new}
        element={
          <ProtectedRoute profile="seller">
            <AppShell>
              <NewDuplicataPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

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
        path="/analyst/sellers/:sellerId"
        element={
          <ProtectedRoute profile="riskAnalyst">
            <AppShell>
              <SellerReviewDetailPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.analyst.duplicatas.list}
        element={
          <ProtectedRoute profile="riskAnalyst">
            <AppShell>
              <AnalystDuplicatasPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyst/duplicatas/:id"
        element={
          <ProtectedRoute profile="riskAnalyst">
            <AppShell>
              <AnalystDuplicataDetailPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

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
        path="/admin/sellers/:sellerId"
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
      <Route
        path={ROUTES.admin.offers.ready}
        element={
          <ProtectedRoute profile="admin">
            <AppShell>
              <AdminOffersReadyPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.admin.offers.list}
        element={
          <ProtectedRoute profile="admin">
            <AppShell>
              <AdminOffersPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.admin.investments}
        element={
          <ProtectedRoute profile="admin">
            <AppShell>
              <AdminInvestmentsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/offers/new/:duplicataId"
        element={
          <ProtectedRoute profile="admin">
            <AppShell>
              <AdminCreateOfferPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/offers/:id"
        element={
          <ProtectedRoute profile="admin">
            <AppShell>
              <AdminOfferDetailPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.investor.opportunities}
        element={
          <ProtectedRoute profile="investor">
            <AppShell>
              <InvestorOpportunitiesPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/investor/offers/:id"
        element={
          <ProtectedRoute profile="investor">
            <AppShell>
              <InvestorOfferDetailPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.investor.investments}
        element={
          <ProtectedRoute profile="investor">
            <AppShell>
              <InvestorInvestmentsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.investor.account}
        element={
          <ProtectedRoute profile="investor">
            <AppShell>
              <InvestorAccountPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
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
