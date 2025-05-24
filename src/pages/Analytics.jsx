import { useEffect, useState } from "react";
import { db } from "../auth/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Analytics() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const groupByDate = (interval) => {
    const dataMap = new Map();

    orders.forEach((order) => {
      const date = order.createdAt?.toDate();
      if (!date) return;

      let key = "";
      switch (interval) {
        case "monthly":
          key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          break;
        case "yearly":
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toLocaleDateString();
      }

      if (!dataMap.has(key)) {
        dataMap.set(key, { revenue: 0, orders: 0, customers: new Set() });
      }

      const data = dataMap.get(key);
      data.revenue += order.total;
      data.orders += 1;
      data.customers.add(order.email);
      dataMap.set(key, data);
    });

    return Array.from(dataMap.entries())
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
        customers: data.customers.size,
      }));
  };

  const buildChartData = (interval, metric) => {
    const groupedData = groupByDate(interval);
    return {
      labels: groupedData.map((d) => d.date),
      datasets: [
        {
          label: metric.charAt(0).toUpperCase() + metric.slice(1),
          data: groupedData.map((d) => d[metric]),
          borderColor: "rgb(249,115,22)",
          backgroundColor: "rgba(249,115,22,0.2)",
          fill: true,
        },
      ],
    };
  };

  // Top Products
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

  const topProducts = Array.from(productMap.values()).sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <h2 className="text-2xl font-bold text-orange-400">Analytics Overview</h2>
      <p className="text-gray-300 text-sm">
        A holistic view of your business performance across revenue, orders, customers, and products.
      </p>

      <div className="space-y-12">
        <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800 shadow">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Revenue</h3>
          <Line data={buildChartData("monthly", "revenue")} />
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800 shadow">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Orders & New Customers</h3>
          <Line data={buildChartData("monthly", "orders")} />
          <Line data={buildChartData("monthly", "customers")} className="mt-4" />
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800 shadow">
          <h3 className="text-lg font-semibold text-white mb-4">Top Products</h3>
          <table className="min-w-full text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-4">Product</th>
                <th className="text-left py-2 px-4">Quantity Sold</th>
                <th className="text-left py-2 px-4">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product) => (
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
      </div>
    </motion.div>
  );
}
