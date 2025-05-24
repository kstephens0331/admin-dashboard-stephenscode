import { useEffect, useState } from "react";
import { db } from "../../auth/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function RevenueTrends() {
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
        case "daily":
          key = date.toLocaleDateString();
          break;
        case "weekly":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toLocaleDateString();
          break;
        case "monthly":
          key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          break;
        case "quarterly":
          key = `Q${Math.floor(date.getMonth() / 3) + 1}-${date.getFullYear()}`;
          break;
        case "yearly":
          key = date.getFullYear().toString();
          break;
        default:
          break;
      }

      if (!dataMap.has(key)) {
        dataMap.set(key, 0);
      }

      dataMap.set(key, dataMap.get(key) + order.total);
    });

    return Array.from(dataMap.entries())
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, total]) => ({ date, total }));
  };

  const buildChartData = (interval) => {
    const groupedData = groupByDate(interval);
    return {
      labels: groupedData.map((d) => d.date),
      datasets: [
        {
          label: "Revenue",
          data: groupedData.map((d) => d.total),
          borderColor: "rgb(249,115,22)",
          backgroundColor: "rgba(249,115,22,0.2)",
          fill: true,
        },
      ],
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <h2 className="text-2xl font-bold text-orange-400">Revenue Trends</h2>
      <p className="text-gray-300 text-sm">
        Track how your revenue grows over time to make informed decisions.
      </p>

      <div className="space-y-12">
        {["daily", "weekly", "monthly", "quarterly", "yearly"].map((interval) => (
          <div
            key={interval}
            className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800 shadow"
          >
            <h3 className="text-lg font-semibold text-white mb-4 capitalize">
              {interval} Revenue
            </h3>
            <Line data={buildChartData(interval)} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
