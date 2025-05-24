import { useEffect, useState } from "react";
import { db } from "../../auth/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AIInsights() {
  const [orders, setOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const groupByMonth = () => {
    const dataMap = new Map();
    orders.forEach((order) => {
      const date = order.createdAt?.toDate();
      if (!date) return;
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!dataMap.has(key)) dataMap.set(key, { revenue: 0, orders: 0, customers: new Set() });
      const data = dataMap.get(key);
      data.revenue += order.total;
      data.orders += 1;
      data.customers.add(order.email);
      dataMap.set(key, data);
    });
    return Array.from(dataMap.entries()).sort(([a], [b]) => new Date(a) - new Date(b)).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
      customers: data.customers.size,
    }));
  };

  const linearForecast = (data, key, periods = 3) => {
    const points = data.map((d, i) => ({ x: i, y: d[key] }));
    const n = points.length;
    if (n < 2) return [];

    const sumX = points.reduce((acc, p) => acc + p.x, 0);
    const sumY = points.reduce((acc, p) => acc + p.y, 0);
    const sumXY = points.reduce((acc, p) => acc + p.x * p.y, 0);
    const sumX2 = points.reduce((acc, p) => acc + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const forecast = [];
    for (let i = n; i < n + periods; i++) {
      forecast.push({
        date: `Forecast ${i - n + 1}`,
        value: slope * i + intercept,
      });
    }
    return forecast;
  };

  const historical = groupByMonth();
  const revenueForecast = linearForecast(historical, "revenue", 3);
  const ordersForecast = linearForecast(historical, "orders", 3);
  const customersForecast = linearForecast(historical, "customers", 3);

  // Alerts if revenue for next forecast month exceeds $10k
  useEffect(() => {
    const upcomingRevenue = revenueForecast[0]?.value || 0;
    if (upcomingRevenue > 10000) {
      setAlerts((prev) => [
        ...prev,
        `🚀 Revenue is forecasted to exceed $10,000 next month!`,
      ]);
    }
  }, [revenueForecast]);

  const buildChartData = (key, label, color) => {
    const histData = historical.map((d) => d[key]);
    const forecastData = [...Array(historical.length).fill(null), ...revenueForecast.map((d) => d.value)];
    if (key === "orders") forecastData.splice(-revenueForecast.length, revenueForecast.length, ...ordersForecast.map((d) => d.value));
    if (key === "customers") forecastData.splice(-revenueForecast.length, revenueForecast.length, ...customersForecast.map((d) => d.value));

    return {
      labels: [...historical.map((d) => d.date), ...revenueForecast.map((d) => d.date)],
      datasets: [
        {
          label: `Actual ${label}`,
          data: histData,
          borderColor: color,
          backgroundColor: `${color}33`,
          fill: true,
        },
        {
          label: `Forecasted ${label}`,
          data: forecastData,
          borderColor: "rgb(34,197,94)",
          borderDash: [5, 5],
          backgroundColor: "rgba(34,197,94,0.2)",
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
      <h2 className="text-2xl font-bold text-orange-400">AI Forecasting Insights</h2>
      <p className="text-gray-300 text-sm">Forecasts for revenue, orders, and customers based on historical trends.</p>

      {alerts.length > 0 && (
        <div className="bg-green-900/30 text-green-400 border border-green-700 p-4 rounded shadow">
          {alerts.map((alert, idx) => (
            <p key={idx}>{alert}</p>
          ))}
        </div>
      )}

      <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800 shadow space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Forecast</h3>
          <Line data={buildChartData("revenue", "Revenue", "rgb(249,115,22)")} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Orders Forecast</h3>
          <Line data={buildChartData("orders", "Orders", "rgb(59,130,246)")} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Customer Forecast</h3>
          <Line data={buildChartData("customers", "Customers", "rgb(250,204,21)")} />
        </div>
      </div>
    </motion.div>
  );
}
