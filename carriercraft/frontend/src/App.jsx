import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MarketsPage } from './pages/MarketsPage';
import { MarketCampaignsPage } from './pages/MarketCampaignsPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { CampaignDetailPage } from './pages/CampaignDetailPage';
import { CampaignBuilder } from './pages/CampaignBuilder';
import { TrafficLogsPage } from './pages/TrafficLogsPage';
import { SessionDetailPage } from './pages/SessionDetailPage';
import { VendorsPage } from './pages/VendorsPage';
import { PostbacksPage } from './pages/PostbacksPage';
import { FunnelSimulatorPage } from './pages/FunnelSimulatorPage';
import { SubscriptionPage } from './pages/SubscriptionPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Live Subscriber Funnel Runtime */}
          <Route path="/subscription" element={<SubscriptionPage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

          {/* Markets Hierarchy */}
          <Route path="/markets" element={<ProtectedRoute><MarketsPage /></ProtectedRoute>} />
          <Route path="/markets/:countryCode/:operatorCode" element={<ProtectedRoute><MarketCampaignsPage /></ProtectedRoute>} />
          <Route path="/markets/:countryCode/:operatorCode/campaigns/:id" element={<ProtectedRoute><CampaignDetailPage /></ProtectedRoute>} />
          <Route path="/markets/:countryCode/:operatorCode/campaigns/:id/edit/:pageType" element={<ProtectedRoute><CampaignBuilder /></ProtectedRoute>} />

          {/* Campaigns Hub */}
          <Route path="/campaigns" element={<ProtectedRoute><CampaignsPage /></ProtectedRoute>} />
          <Route path="/campaigns/:id" element={<ProtectedRoute><CampaignDetailPage /></ProtectedRoute>} />
          <Route path="/campaigns/:id/edit/:pageType" element={<ProtectedRoute><CampaignBuilder /></ProtectedRoute>} />

          {/* Traffic Logs & Session Tracing */}
          <Route path="/logs" element={<ProtectedRoute><TrafficLogsPage /></ProtectedRoute>} />
          <Route path="/logs/:visitId" element={<ProtectedRoute><SessionDetailPage /></ProtectedRoute>} />
          <Route path="/analytics/visits/:visitId" element={<ProtectedRoute><SessionDetailPage /></ProtectedRoute>} />

          {/* Vendors & Postbacks */}
          <Route path="/vendors" element={<ProtectedRoute><VendorsPage /></ProtectedRoute>} />
          <Route path="/postbacks" element={<ProtectedRoute><PostbacksPage /></ProtectedRoute>} />

          {/* Test Lab */}
          <Route path="/simulator" element={<ProtectedRoute><FunnelSimulatorPage /></ProtectedRoute>} />

          {/* Defaults */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
