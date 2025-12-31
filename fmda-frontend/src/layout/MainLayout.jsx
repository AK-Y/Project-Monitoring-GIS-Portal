import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-inter">
      {/* Top Header */}
      <Header />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Main Content Area */}
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-65' : 'ml-0'} h-full overflow-y-auto relative scroll-smooth bg-slate-50 p-6`}>
          {/* Hamburger Button (only visible when sidebar is closed) */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="fixed top-[105px] left-6 z-40 p-3 bg-white border border-slate-100 rounded-2xl shadow-xl text-slate-600 hover:text-indigo-600 transition-all hover:scale-110 active:scale-95 animate-fade-in"
            >
              <Menu size={20} />
            </button>
          )}

          <div className="w-full max-w-7xl mx-auto pb-24">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
