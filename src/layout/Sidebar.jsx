import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaClipboardList,
  FaUsers,
  FaChartLine,
  FaSignOutAlt,
  FaStar,
  FaDollarSign,
  FaBox
} from "react-icons/fa";

export default function Sidebar() {
  const navItem =
    "flex items-center gap-3 px-4 py-3 hover:bg-orange-600 transition rounded-lg text-sm";

  return (
    <aside className="w-64 bg-[#111] border-r border-gray-800 flex flex-col p-6">
      <div className="text-2xl font-bold text-orange-400 mb-8">Admin Portal</div>

      <nav className="flex flex-col gap-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? `${navItem} bg-orange-600` : navItem
          }
        >
          <FaHome /> Dashboard
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            isActive ? `${navItem} bg-orange-600` : navItem
          }
        >
          <FaClipboardList /> Orders
        </NavLink>

        <div className="mt-4 mb-2 text-xs uppercase text-gray-500 tracking-wide">
          Growth Insights
        </div>

        <NavLink
          to="/metrics"
          className={({ isActive }) =>
            isActive ? `${navItem} bg-orange-600` : navItem
          }
        >
          <FaChartLine /> Metrics
        </NavLink>

        <NavLink
          to="/growth/top-customers"
          className={({ isActive }) =>
            isActive ? `${navItem} bg-orange-600` : navItem
          }
        >
          <FaStar /> Top Customers
        </NavLink>

        <NavLink
          to="/growth/revenue-trends"
          className={({ isActive }) =>
            isActive ? `${navItem} bg-orange-600` : navItem
          }
        >
          <FaDollarSign /> Revenue Trends
        </NavLink>

        <NavLink
          to="/growth/products"
          className={({ isActive }) =>
            isActive ? `${navItem} bg-orange-600` : navItem
          }
        >
          <FaBox /> Product Performance
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            isActive ? `${navItem} bg-orange-600` : navItem
          }
        >
          <FaChartLine /> Analytics
        </NavLink>
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-800">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-200 hover:bg-red-900 transition rounded-lg text-sm">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </aside>
  );
}
