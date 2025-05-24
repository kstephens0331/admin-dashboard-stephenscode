export default function Topbar() {
  return (
    <header className="h-16 bg-[#181818] border-b border-gray-800 px-6 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-white tracking-wide">Admin Dashboard</h1>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white">
          A
        </div>
        <span className="text-sm text-gray-300">Admin</span>
      </div>
    </header>
  );
}
