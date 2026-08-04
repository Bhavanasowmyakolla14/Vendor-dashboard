import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import VendorsPage from './pages/VendorsPage';
import VendorDetailPage from './pages/VendorDetailPage';
import BookingPage from './pages/BookingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AuthPage from './pages/AuthPage';
import ExplorePage from './pages/ExplorePage';
import VendorDashboard from './pages/VendorDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BudgetPlannerPage from './pages/BudgetPlannerPage';
import CategoryDetailPage from './pages/CategoryDetailPage';
import VendorRegistrationPage from './pages/VendorRegistrationPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/vendors/:slug" element={<VendorDetailPage />} />
          <Route path="/book/:slug" element={<BookingPage />} />
          <Route path="/confirmation/:ref" element={<ConfirmationPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/vendor-registration" element={<VendorRegistrationPage />} />
          <Route path="/vendor-dashboard" element={<VendorDashboard />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/budget-planner" element={<BudgetPlannerPage />} />
          <Route path="/category/:category" element={<CategoryDetailPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
