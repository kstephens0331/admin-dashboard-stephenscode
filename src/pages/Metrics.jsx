import { useEffect, useState } from "react";
import { db } from "../auth/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { useSearchParams } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Metrics() {
  const [orders, setOrders] = useState([]);
  const [searchParams] = useSearchParams();
  const selectedType = searchParams.get("type");
  const selectedPeriod = searchParams.get("period");

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

  const metricOptions = selectedType ? [selectedType] : ["revenue", "orders", "customers"];
  const periodOptions = {
    day: "daily",
    week: "weekly",
    month: "monthly",
    quarter: "quarterly",
    year: "yearly",
  };

  const intervalsToShow = selectedPeriod
    ? [periodOptions[selectedPeriod]]
    : ["daily", "weekly", "monthly", "quarterly", "yearly"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <h2 className="text-2xl font-bold text-orange-400">Detailed Metrics</h2>
      <p className="text-gray-300 text-sm">
        Showing charts for{" "}
        <span className="text-orange-400 font-semibold">
          {selectedType ?? "all metrics"}
        </span>{" "}
        {selectedPeriod && (
          <>
            during{" "}
            <span className="text-orange-400 font-semibold">
              {selectedPeriod}
            </span>
          </>
        )}
        .
      </p>

      <div className="space-y-12">
        {intervalsToShow.map((interval) => (
          <div
            key={interval}
            className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800 shadow"
          >
            <h3 className="text-lg font-semibold text-white mb-4 capitalize">
              {interval} Metrics
            </h3>
            {metricOptions.map((metric) => (
              <Line
                key={metric}
                data={buildChartData(interval, metric)}
                className="mb-6"
              />
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
