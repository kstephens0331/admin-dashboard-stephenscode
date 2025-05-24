import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";
import AdminLayout from "./layout/AdminLayout";
import ProtectedRoute from "./auth/ProtectedRoute";
import Metrics from "./pages/Metrics";
import TopCustomers from "./pages/growth/TopCustomers";
import RevenueTrends from "./pages/growth/RevenueTrends";
import ProductPerformance from "./pages/growth/ProductPerformance";
import Analytics from "./pages/Analytics";
import AIInsights from "./pages/ai/AIInsights";

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
                  <Route path="*" element={<NotFound />} />
                  <Route path="/metrics" element={<Metrics />} />
                  <Route path="/growth/top-customers" element={<TopCustomers />} />
                  <Route path="/growth/revenue-trends" element={<RevenueTrends />} />
                  <Route path="/growth/products" element={<ProductPerformance />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/ai-insights" element={<AIInsights />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
