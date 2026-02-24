import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth pages
import Login from './pages/auth/Login';
// User pages
import UserLayout from './components/layout/UserLayout';
import UserOverview from './pages/user/overview/Overview';
import Portfolio from './pages/user/portfolio/Portfolio';
import PortfolioHoldings from './pages/user/portfolio/Holdings';
import PortfolioAllocation from './pages/user/portfolio/Allocation';
import PortfolioHistory from './pages/user/portfolio/History';
import Markets from './pages/user/markets/Markets';
import Watchlist from './pages/user/markets/Watchlist';
import TickerDetail from './pages/user/markets/TickerDetail';
import Sectors from './pages/user/markets/Sectors';
import Documents from './pages/user/documents/Documents';
import DocumentDetail from './pages/user/documents/DocumentDetail';
import Payments from './pages/user/payments/Payments';
import LearningCenter from './pages/user/learning/LearningCenter';
import ArticleDetail from './pages/user/learning/ArticleDetail';
import Profile from './pages/user/profile/Profile';

// Admin pages
import AdminLayout from './components/layout/AdminLayout';
import AdminOverview from './pages/admin/overview/Overview';
import UserManagement from './pages/admin/users/UserManagement';
import UserDetail from './pages/admin/users/UserDetail';
import CreateUser from './pages/admin/users/CreateUser';
import MarketManagement from './pages/admin/markets/MarketManagement';
import DocumentManagement from './pages/admin/documents/DocumentManagement';
import Settings from './pages/admin/settings/Settings';
import AuditLogs from './pages/admin/settings/AuditLogs';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        {/* User routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard/overview" replace />} />
          <Route path="overview" element={<UserOverview />} />

          <Route path="portfolio" element={<Portfolio />}>
            <Route index element={<Navigate to="holdings" replace />} />
            <Route path="holdings" element={<PortfolioHoldings />} />
            <Route path="allocation" element={<PortfolioAllocation />} />
            <Route path="history" element={<PortfolioHistory />} />
          </Route>

          <Route path="markets" element={<Markets />}>
            <Route index element={<Navigate to="watchlist" replace />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="watchlist/:symbol" element={<TickerDetail />} />
            <Route path="sectors" element={<Sectors />} />
          </Route>

          <Route path="documents" element={<Documents />} />
          <Route path="documents/:id" element={<DocumentDetail />} />

          <Route path="payments" element={<Payments />} />

          <Route path="learning" element={<LearningCenter />} />
          <Route path="learning/:slug" element={<ArticleDetail />} />

          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />

          <Route path="users" element={<UserManagement />} />
          <Route path="users/create" element={<CreateUser />} />
          <Route path="users/:id" element={<UserDetail />} />

          <Route path="markets" element={<MarketManagement />} />

          <Route path="documents" element={<DocumentManagement />} />

          <Route path="settings" element={<Settings />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>

        {/* Default redirect */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
