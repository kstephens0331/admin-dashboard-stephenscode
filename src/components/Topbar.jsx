export default function Topbar() {
  return (
    <header className="h-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 px-8 flex items-center justify-between shadow-xl relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
      </div>

      <div className="relative flex items-center gap-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent tracking-wide">
          Admin Dashboard
        </h1>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/50 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></div>
          <span className="text-xs text-slate-400 font-medium">System Active</span>
        </div>
      </div>

      <div className="relative flex items-center gap-6">
        {/* Notifications */}
        <button className="group relative p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300">
          <svg className="w-5 h-5 text-slate-400 group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white text-xs font-bold flex items-center justify-center shadow-lg">
            3
          </span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-700/50">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-white">Admin User</div>
            <div className="text-xs text-slate-400">Administrator</div>
          </div>
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative h-11 w-11 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-white text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
              A
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
