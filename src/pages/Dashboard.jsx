import { useEffect, useState } from "react";
import { db } from "../auth/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
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
      <ul className="space-y-2">
        {["day", "week", "month", "quarter", "year"].map((period) => (
          <li
            key={period}
            className="hover:text-orange-400 cursor-pointer transition"
            onClick={() => navigateWithParams(period)}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}:{" "}
            <span className="text-orange-400 font-semibold">
              {type === "revenue"
                ? `$${getValueForPeriod(period).toFixed(2)}`
                : getValueForPeriod(period)}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  const boxClasses =
    "cursor-pointer bg-[#1a1a1a] rounded-lg p-6 shadow border border-gray-800 hover:bg-gray-800/50 transition";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-orange-400">Dashboard</h2>
      <p className="text-gray-300 text-sm">
        Click a box for a snapshot. Click inside the dialog for detailed metrics.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div
          onClick={() => setActiveModal("revenue")}
          className={boxClasses}
        >
          <h3 className="text-lg font-semibold text-white mb-1">Total Revenue</h3>
          <p className="text-2xl font-bold text-orange-400">${totalRevenue.toFixed(2)}</p>
        </div>

        <div
          onClick={() => setActiveModal("orders")}
          className={boxClasses}
        >
          <h3 className="text-lg font-semibold text-white mb-1">Total Orders</h3>
          <p className="text-2xl font-bold text-orange-400">{orderCount}</p>
        </div>

        <div
          onClick={() => setActiveModal("customers")}
          className={boxClasses}
        >
          <h3 className="text-lg font-semibold text-white mb-1">New Customers</h3>
          <p className="text-2xl font-bold text-orange-400">{newCustomers}</p>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800 max-w-sm w-full text-gray-300 relative">
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-orange-400 text-lg"
              >
                &times;
              </button>

              <h3 className="text-lg font-bold text-orange-400 mb-4 capitalize">
                {activeModal === "revenue" && "Revenue Breakdown"}
                {activeModal === "orders" && "Orders Breakdown"}
                {activeModal === "customers" && "New Customers Breakdown"}
              </h3>

              {renderBreakdown(activeModal)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
