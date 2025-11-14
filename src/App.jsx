import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import AddOrder from "./pages/AddOrder";
import NotFound from "./pages/NotFound";
import AdminLayout from "./layout/AdminLayout";
import ProtectedRoute from "./auth/ProtectedRoute";
import Metrics from "./pages/Metrics";
import TopCustomers from "./pages/growth/TopCustomers";
import RevenueTrends from "./pages/growth/RevenueTrends";
import ProductPerformance from "./pages/growth/ProductPerformance";
import Analytics from "./pages/Analytics";
import AIInsights from "./pages/ai/AIInsights";
import Customers from "./pages/Customers";
import ReferralCredits from "./pages/ReferralCredits";
import PrivateFeedback from "./pages/PrivateFeedback";
import UpdateRequests from "./pages/UpdateRequests";
import ModuleRequests from "./pages/ModuleRequests";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public login route */}
        <Route path="/login" element={<Login />} />

        {/* Protected admin routes */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/orders/add" element={<AddOrder />} />
                  <Route path="*" element={<NotFound />} />
                  <Route path="/metrics" element={<Metrics />} />
                  <Route path="/growth/top-customers" element={<TopCustomers />} />
                  <Route path="/growth/revenue-trends" element={<RevenueTrends />} />
                  <Route path="/growth/products" element={<ProductPerformance />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/ai-insights" element={<AIInsights />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/referral-credits" element={<ReferralCredits />} />
                  <Route path="/feedback" element={<PrivateFeedback />} />
                  <Route path="/update-requests" element={<UpdateRequests />} />
                  <Route path="/module-requests" element={<ModuleRequests />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
