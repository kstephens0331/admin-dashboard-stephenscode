import { useEffect, useState } from "react";
import { db } from "../auth/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const orderDate = order.createdAt?.toDate();
    const emailMatch = order.email.toLowerCase().includes(search.toLowerCase());
    if (startDate && orderDate < new Date(startDate)) return false;
    if (endDate && orderDate > new Date(endDate)) return false;
    return emailMatch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-orange-400">Orders</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by customer email"
          className="flex-1 p-2 rounded bg-gray-900 border border-gray-700 text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          className="p-2 rounded bg-gray-900 border border-gray-700 text-white"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="p-2 rounded bg-gray-900 border border-gray-700 text-white"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {filteredOrders.length === 0 ? (
        <div className="mt-6 border border-dashed border-gray-600 p-6 rounded-lg text-center text-gray-400 bg-black/10">
          No orders found.
        </div>
      ) : (
        <div className="mt-6 bg-[#1a1a1a] rounded-lg p-4 border border-gray-800 overflow-auto">
          <table className="min-w-full text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-4">Email</th>
                <th className="text-left py-2 px-4">Total</th>
                <th className="text-left py-2 px-4">Date</th>
                <th className="text-left py-2 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-700 hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="py-2 px-4">{order.email}</td>
                  <td className="py-2 px-4 text-orange-400 font-semibold">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="py-2 px-4">
                    {order.createdAt?.toDate().toLocaleString() ?? "Unknown"}
                  </td>
                  <td className="py-2 px-4 text-right text-xs text-gray-500">
                    View
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800 max-w-md w-full text-gray-300 relative">
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-orange-400 text-lg"
              >
                &times;
              </button>

              <h3 className="text-lg font-bold text-orange-400 mb-2">Order Details</h3>
              <p><strong>Email:</strong> {selectedOrder.email}</p>
              <p><strong>Total:</strong> ${selectedOrder.total.toFixed(2)}</p>
              <p><strong>Date:</strong> {selectedOrder.createdAt?.toDate().toLocaleString()}</p>

              <div className="mt-4">
                <h4 className="text-sm font-bold text-orange-400 mb-1">Items:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedOrder.items.map((item, idx) => (
                    <li key={idx}>
                      {item.title} x {item.quantity} (${item.price.toFixed(2)} each)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
