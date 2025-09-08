import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ProfileSetupPage from './pages/Auth/ProfileSetupPage';
import ProfilePage from './pages/Auth/ProfilePage';
import DonorDashboard from './pages/Dashboard/DonorDashboard';
import RecipientDashboard from './pages/Dashboard/RecipientDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import BloodRequestPage from './pages/Request/BloodRequestPage';
import DonorMatchingPage from './pages/Matching/DonorMatchingPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import DonorHistoryPage from './pages/History/DonorHistoryPage';
import RecipientHistoryPage from './pages/History/RecipientHistoryPage';
import AboutPage from './pages/About/AboutPage';
import ContactPage from './pages/Contact/ContactPage';
import NotFoundPage from './pages/Error/NotFoundPage';
import UnauthorizedPage from './pages/Error/UnauthorizedPage';
import ServerErrorPage from './pages/Error/ServerErrorPage';
import NoDonorsPage from './pages/Error/NoDonorsPage';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              
              {/* Protected Routes */}
              <Route path="/profile-setup" element={
                <ProtectedRoute>
                  <ProfileSetupPage />
                </ProtectedRoute>
              } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DonorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/donor-dashboard" element={
                <ProtectedRoute requiredRole="donor">
                  <DonorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/recipient-dashboard" element={
                <ProtectedRoute requiredRole="recipient">
                  <RecipientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin-dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              {/* Feature Routes */}
              <Route path="/request-blood" element={
                <ProtectedRoute>
                  <BloodRequestPage />
                </ProtectedRoute>
              } />
              <Route path="/find-donors" element={
                <ProtectedRoute>
                  <DonorMatchingPage />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              } />
              <Route path="/donor-history" element={
                <ProtectedRoute requiredRole="donor">
                  <DonorHistoryPage />
                </ProtectedRoute>
              } />
              <Route path="/recipient-history" element={
                <ProtectedRoute requiredRole="recipient">
                  <RecipientHistoryPage />
                </ProtectedRoute>
              } />
              
              {/* Error Routes */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/server-error" element={<ServerErrorPage />} />
              <Route path="/no-donors" element={<NoDonorsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;