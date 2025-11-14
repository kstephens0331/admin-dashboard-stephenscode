import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaClipboardList,
  FaUsers,
  FaChartLine,
  FaSignOutAlt,
  FaStar,
  FaDollarSign,
  FaBox,
  FaCommentDots,
  FaEdit
} from "react-icons/fa";

export default function Sidebar() {
  const navItem =
    "group flex items-center gap-3 px-4 py-3.5 hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-orange-600/20 transition-all duration-300 rounded-xl text-sm font-medium relative overflow-hidden";

  const activeNavItem =
    "group flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 rounded-xl text-sm font-medium shadow-lg shadow-orange-500/30 relative overflow-hidden";

  return (
    <aside className="w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-slate-700/50 flex flex-col p-6 shadow-2xl">
      {/* Logo/Brand */}
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-2xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-700/80 p-4 rounded-2xl border border-slate-600/50 backdrop-blur-sm">
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
            Admin Portal
          </div>
          <div className="text-xs text-slate-400 mt-1">StephensCode Dashboard</div>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? activeNavItem : navItem
          }
        >
          {({ isActive }) => (
            <>
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <FaHome className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'} />
              </div>
              <span className={isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}>Dashboard</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
              )}
            </>
          )}
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            isActive ? activeNavItem : navItem
          }
        >
          {({ isActive }) => (
            <>
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <FaClipboardList className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'} />
              </div>
              <span className={isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}>Orders</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
              )}
            </>
          )}
        </NavLink>

        <NavLink
          to="/customers"
          className={({ isActive }) =>
            isActive ? activeNavItem : navItem
          }
        >
          {({ isActive }) => (
            <>
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <FaUsers className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'} />
              </div>
              <span className={isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}>Customers</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
              )}
            </>
          )}
        </NavLink>

        <NavLink
          to="/referral-credits"
          className={({ isActive }) =>
            isActive ? activeNavItem : navItem
          }
        >
          {({ isActive }) => (
            <>
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <FaDollarSign className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'} />
              </div>
              <span className={isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}>Referral Credits</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
              )}
            </>
          )}
        </NavLink>

        <NavLink
          to="/feedback"
          className={({ isActive }) =>
            isActive ? activeNavItem : navItem
          }
        >
          {({ isActive }) => (
            <>
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <FaCommentDots className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'} />
              </div>
              <span className={isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}>Private Feedback</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
              )}
            </>
          )}
        </NavLink>

        <NavLink
          to="/update-requests"
          className={({ isActive }) =>
            isActive ? activeNavItem : navItem
          }
        >
          {({ isActive }) => (
            <>
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <FaEdit className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'} />
              </div>
              <span className={isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}>Update Requests</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
              )}
            </>
          )}
        </NavLink>

        <NavLink
          to="/module-requests"
          className={({ isActive }) =>
            isActive ? activeNavItem : navItem
          }
        >
          {({ isActive }) => (
            <>
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <FaBox className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'} />
              </div>
              <span className={isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}>Module Requests</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
              )}
            </>
          )}
        </NavLink>

        <div className="mt-6 mb-3 flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent"></div>
          <span className="text-xs uppercase text-slate-500 font-bold tracking-wider">Growth Insights</span>
          <div className="h-px flex-1 bg-gradient-to-l from-slate-700 to-transparent"></div>
        </div>

        <NavLink
          to="/metrics"
          className={({ isActive }) =>
            isActive ? activeNavItem : navItem
          }
        >
          {({ isActive }) => (
            <>
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <FaChartLine className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'} />
              </div>
              <span className={isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}>Metrics</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
              )}
            </>
          )}
        </NavLink>

        <NavLink
          to="/growth/top-customers"
          className={({ isActive }) =>
            isActive ? activeNavItem : navItem
          }
        >
          {({ isActive }) => (
            <>
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <FaStar className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'} />
              </div>
              <span className={isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}>Top Customers</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
              )}
            </>
          )}
        </NavLink>

        <NavLink
          to="/growth/revenue-trends"
          className={({ isActive }) =>
            isActive ? activeNavItem : navItem
          }
        >
          {({ isActive }) => (
            <>
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <FaDollarSign className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'} />
              </div>
              <span className={isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}>Revenue Trends</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
              )}
            </>
          )}
        </NavLink>

        <NavLink
          to="/growth/products"
          className={({ isActive }) =>
            isActive ? activeNavItem : navItem
          }
        >
          {({ isActive }) => (
            <>
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <FaBox className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'} />
              </div>
              <span className={isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}>Product Performance</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
              )}
            </>
          )}
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            isActive ? activeNavItem : navItem
          }
        >
          {({ isActive }) => (
            <>
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <FaChartLine className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'} />
              </div>
              <span className={isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}>Analytics</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
              )}
            </>
          )}
        </NavLink>
      </nav>

      <div className="mt-auto pt-6">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-6"></div>
        <button className="group w-full flex items-center gap-3 px-4 py-3.5 text-red-400 hover:text-white hover:bg-gradient-to-r hover:from-red-500/20 hover:to-red-600/20 transition-all duration-300 rounded-xl text-sm font-medium border border-slate-700/50 hover:border-red-500/50 relative overflow-hidden">
          <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
            <FaSignOutAlt />
          </div>
          <span>Logout</span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </aside>
  );
}
