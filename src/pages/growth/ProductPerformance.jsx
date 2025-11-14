import { useEffect, useState } from "react";
import { ordersDb } from "../../auth/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";

export default function ProductPerformance() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(ordersDb, "orders"), (snapshot) => {
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Aggregate product performance
  const productMap = new Map();
  orders.forEach((order) => {
    order.items?.forEach((item) => {
      if (!productMap.has(item.title)) {
        productMap.set(item.title, {
          title: item.title,
          totalRevenue: 0,
          quantitySold: 0,
        });
      }
      const product = productMap.get(item.title);
      product.totalRevenue += item.price * item.quantity;
      product.quantitySold += item.quantity;
    });
  });

  const products = Array.from(productMap.values()).sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-orange-400">Product Performance</h2>
      <p className="text-gray-300 text-sm">
        See how your products are performing and identify top-selling items.
      </p>

      <div className="mt-6 bg-[#1a1a1a] rounded-lg p-4 border border-gray-800 overflow-auto">
        <table className="min-w-full text-sm text-gray-300">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 px-4">Product</th>
              <th className="text-left py-2 px-4">Quantity Sold</th>
              <th className="text-left py-2 px-4">Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.title}
                className="border-b border-gray-700 hover:bg-gray-800/50"
              >
                <td className="py-2 px-4">{product.title}</td>
                <td className="py-2 px-4">{product.quantitySold}</td>
                <td className="py-2 px-4 text-orange-400 font-semibold">
                  ${product.totalRevenue.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
