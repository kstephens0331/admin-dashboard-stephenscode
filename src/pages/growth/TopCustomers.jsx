import { useEffect, useState } from "react";
import { ordersDb } from "../../auth/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";

export default function TopCustomers() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(ordersDb, "orders"), (snapshot) => {
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Aggregate spending by customer
  const customersMap = new Map();
  orders.forEach((order) => {
    if (!order.email) return;
    if (!customersMap.has(order.email)) {
      customersMap.set(order.email, { email: order.email, total: 0, orders: 0 });
    }
    const customer = customersMap.get(order.email);
    customer.total += order.total;
    customer.orders += 1;
  });

  // Convert to array and sort by total spent
  const topCustomers = Array.from(customersMap.values()).sort(
    (a, b) => b.total - a.total
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-orange-400">Top Customers</h2>
      <p className="text-gray-300 text-sm">
        Your highest-value customers, sorted by total spending.
      </p>

      <div className="mt-6 bg-[#1a1a1a] rounded-lg p-4 border border-gray-800 overflow-auto">
        <table className="min-w-full text-sm text-gray-300">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 px-4">Email</th>
              <th className="text-left py-2 px-4">Orders</th>
              <th className="text-left py-2 px-4">Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {topCustomers.map((customer) => (
              <tr
                key={customer.email}
                className="border-b border-gray-700 hover:bg-gray-800/50"
              >
                <td className="py-2 px-4">{customer.email}</td>
                <td className="py-2 px-4">{customer.orders}</td>
                <td className="py-2 px-4 text-orange-400 font-semibold">
                  ${customer.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
