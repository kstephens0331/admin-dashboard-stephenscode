import Sidebar from "./Sidebar";
import Topbar from "../components/Topbar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-[#111] to-gray-900 text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto px-6 py-6 bg-black/30 backdrop-blur-lg shadow-inner rounded-tl-3xl">
          {children}
        </main>
      </div>
    </div>
  );
}
