import { useEffect, useState } from "react";
import { ordersDb, customerDb } from "../auth/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [updateRequests, setUpdateRequests] = useState([]);
  const [moduleRequests, setModuleRequests] = useState([]);
  const [privateFeedback, setPrivateFeedback] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(ordersDb, "orders"), (snapshot) => {
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubUpdates = onSnapshot(collection(customerDb, "updateRequests"), (snapshot) => {
      setUpdateRequests(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubModules = onSnapshot(collection(customerDb, "moduleRequests"), (snapshot) => {
      setModuleRequests(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubFeedback = onSnapshot(collection(customerDb, "privateFeedback"), (snapshot) => {
      setPrivateFeedback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubOrders();
      unsubUpdates();
      unsubModules();
      unsubFeedback();
    };
  }, []);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const orderCount = orders.length;
  const uniqueEmails = new Set(orders.map((o) => o.email));
  const newCustomers = uniqueEmails.size;

  const matchesPeriod = (date, now, period) => {
    switch (period) {
      case "day":
        return date.toDateString() === now.toDateString();
      case "week": {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        return date >= weekStart && date < weekEnd;
      }
      case "month":
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      case "quarter": {
        const quarter = Math.floor(now.getMonth() / 3);
        const orderQuarter = Math.floor(date.getMonth() / 3);
        return orderQuarter === quarter && date.getFullYear() === now.getFullYear();
      }
      case "year":
        return date.getFullYear() === now.getFullYear();
      default:
        return false;
    }
  };

  const getRevenueForPeriod = (period) => {
    const now = new Date();
    return orders.reduce((sum, order) => {
      const orderDate = order.createdAt?.toDate();
      if (!orderDate) return sum;
      return matchesPeriod(orderDate, now, period) ? sum + order.total : sum;
    }, 0);
  };

  const getOrdersForPeriod = (period) => {
    const now = new Date();
    return orders.filter((order) => {
      const orderDate = order.createdAt?.toDate();
      return orderDate && matchesPeriod(orderDate, now, period);
    }).length;
  };

  const getNewCustomersForPeriod = (period) => {
    const now = new Date();
    const customersSet = new Set();
    orders.forEach((order) => {
      const orderDate = order.createdAt?.toDate();
      if (orderDate && matchesPeriod(orderDate, now, period)) {
        customersSet.add(order.email);
      }
    });
    return customersSet.size;
  };

  const renderBreakdown = (type) => {
    const getValueForPeriod = {
      revenue: getRevenueForPeriod,
      orders: getOrdersForPeriod,
      customers: getNewCustomersForPeriod,
    }[type];

    const navigateWithParams = (period) => {
      navigate(`/metrics?type=${type}&period=${period}`);
      setActiveModal(null);
    };

    return (
      <ul className="space-y-3">
        {["day", "week", "month", "quarter", "year"].map((period) => (
          <li
            key={period}
            className="group flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-orange-600/20 border border-slate-700/50 hover:border-orange-500/50 cursor-pointer transition-all duration-300 hover:scale-105"
            onClick={() => navigateWithParams(period)}
          >
            <span className="font-semibold text-slate-300 group-hover:text-white transition-colors">
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </span>
            <span className="text-orange-400 font-bold text-lg group-hover:scale-110 transition-transform">
              {type === "revenue"
                ? `$${getValueForPeriod(period).toFixed(2)}`
                : getValueForPeriod(period)}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  const statCards = [
    {
      id: "revenue",
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: "💰",
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-500/10 to-teal-600/10",
      borderColor: "border-emerald-500/30"
    },
    {
      id: "orders",
      title: "Total Orders",
      value: orderCount,
      icon: "📦",
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-500/10 to-cyan-600/10",
      borderColor: "border-blue-500/30"
    },
    {
      id: "customers",
      title: "New Customers",
      value: newCustomers,
      icon: "👥",
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-500/10 to-pink-600/10",
      borderColor: "border-purple-500/30"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Click any metric card for detailed breakdowns
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/50 backdrop-blur-sm">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
          <span className="text-slate-300 font-semibold">Live Data</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => setActiveModal(stat.id)}
            className={`group relative cursor-pointer rounded-3xl bg-gradient-to-br ${stat.bgGradient} p-8 border-2 ${stat.borderColor} hover:border-opacity-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }} />
            </div>

            {/* Content */}
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`text-5xl group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>

              <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">
                {stat.title}
              </h3>
              <p className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 inline-block`}>
                {stat.value}
              </p>

              {/* Hover indicator */}
              <div className="mt-6 flex items-center gap-2 text-slate-500 group-hover:text-slate-300 transition-colors">
                <span className="text-sm font-medium">Click for breakdown</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onClick={() => navigate('/orders')}
          className="group relative p-8 rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-700/80 border-2 border-slate-600/50 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl text-left overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-3xl shadow-xl group-hover:rotate-12 transition-transform duration-300">
              📋
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">View All Orders</h3>
              <p className="text-slate-400 group-hover:text-slate-300 transition-colors">Manage and track all customer orders</p>
            </div>
            <svg className="w-8 h-8 text-slate-600 group-hover:text-orange-500 group-hover:translate-x-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          onClick={() => navigate('/analytics')}
          className="group relative p-8 rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-700/80 border-2 border-slate-600/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl text-left overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-3xl shadow-xl group-hover:rotate-12 transition-transform duration-300">
              📊
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Analytics Dashboard</h3>
              <p className="text-slate-400 group-hover:text-slate-300 transition-colors">Deep dive into business metrics</p>
            </div>
            <svg className="w-8 h-8 text-slate-600 group-hover:text-blue-500 group-hover:translate-x-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </motion.button>
      </div>

      {/* Client Request Management Cards */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Client Requests & Feedback</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            onClick={() => navigate('/update-requests')}
            className="group relative p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-700/80 border-2 border-slate-600/50 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 text-left overflow-hidden"
          >
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }} />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">📝</div>
                {updateRequests.filter(r => r.status === 'pending').length > 0 && (
                  <div className="px-3 py-1 rounded-full bg-orange-500 text-white text-sm font-bold">
                    {updateRequests.filter(r => r.status === 'pending').length}
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">Update Requests</h3>
              <p className="text-slate-400 text-sm">
                {updateRequests.filter(r => r.status === 'pending').length} pending
              </p>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            onClick={() => navigate('/module-requests')}
            className="group relative p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-700/80 border-2 border-slate-600/50 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 text-left overflow-hidden"
          >
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }} />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">🚀</div>
                {moduleRequests.filter(r => r.status === 'pending').length > 0 && (
                  <div className="px-3 py-1 rounded-full bg-cyan-500 text-white text-sm font-bold">
                    {moduleRequests.filter(r => r.status === 'pending').length}
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">Module Requests</h3>
              <p className="text-slate-400 text-sm">
                {moduleRequests.filter(r => r.status === 'pending').length} pending
              </p>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            onClick={() => navigate('/feedback')}
            className="group relative p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-700/80 border-2 border-slate-600/50 hover:border-pink-500/50 transition-all duration-300 hover:scale-105 text-left overflow-hidden"
          >
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }} />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">💬</div>
                {privateFeedback.filter(f => f.status === 'pending').length > 0 && (
                  <div className="px-3 py-1 rounded-full bg-pink-500 text-white text-sm font-bold">
                    {privateFeedback.filter(f => f.status === 'pending').length}
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-pink-400 transition-colors">Private Feedback</h3>
              <p className="text-slate-400 text-sm">
                {privateFeedback.filter(f => f.status === 'pending').length} pending
              </p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl border-2 border-slate-700/50 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '32px 32px'
                }} />
              </div>

              {/* Close button */}
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-red-500/20 border border-slate-700/50 hover:border-red-500/50 flex items-center justify-center text-slate-400 hover:text-red-400 transition-all duration-300 hover:rotate-90"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Content */}
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl">
                    {activeModal === "revenue" && "💰"}
                    {activeModal === "orders" && "📦"}
                    {activeModal === "customers" && "👥"}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {activeModal === "revenue" && "Revenue Breakdown"}
                      {activeModal === "orders" && "Orders Breakdown"}
                      {activeModal === "customers" && "Customers Breakdown"}
                    </h3>
                    <p className="text-slate-400">Click any period for detailed metrics</p>
                  </div>
                </div>

                {renderBreakdown(activeModal)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
