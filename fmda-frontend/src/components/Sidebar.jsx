import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Map as MapIcon,
  FolderKanban,
  Boxes,
  PlusCircle,
  ShieldCheck,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Wallet,
  BarChart3,
  FileText
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import stateLogo from "../assets/state.png";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useSelector((state) => state.auth);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  if (!isOpen) return null;

  const NavItem = ({ to, icon: Icon, label, end = false }) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group ${isActive
          ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-indigo-100/20"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={17} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-300 group-hover:scale-110" />
          <span className="font-bold text-xs tracking-tight">{label}</span>
          <div className="flex-1" />
          <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity translate-x-1`} />
        </>
      )}
    </NavLink>
  );

  return (
    <aside className="fixed left-0 top-[89px] bottom-0 w-65 bg-white flex flex-col z-50 transition-all duration-300 group shadow-lg">
      {/* Simplified Brand Header or just Toggle */}
      <div className="relative py-4">
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-4 w-7 h-7 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-xl cursor-pointer z-[60] transition-all hover:scale-110 active:scale-95"
          title="Collapse Sidebar"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="px-6">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Navigation</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-4 overflow-hidden">
        {/* Main Section */}
        <div>
          <p className="px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-2">Main Menu</p>
          <div className="space-y-1">
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" end />
            <NavItem to="/map" icon={MapIcon} label="City Map" />
            <NavItem to="/reports" icon={FileText} label="Reports" />
          </div>
        </div>

        {/* Projects Section */}
        <div>
          <p className="px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-2">Inventory</p>
          <div className="space-y-1">
            <NavItem to="/assets" icon={Boxes} label="Assets" />
            <NavItem to="/projects" icon={FolderKanban} label="Projects" />
            <NavItem to="/progress" icon={BarChart3} label="Work Progress" />
            <NavItem to="/finance" icon={Wallet} label="Finance & Payments" />
          </div>
        </div>

        {/* System Section - Only for Admin */}
        {isAuthenticated && user?.role === 'ADMIN' && (
          <div>
            <p className="px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-2">System</p>
            <div className="space-y-1">
              <NavItem to="/admin" icon={ShieldCheck} label="Admin Portal" />
            </div>
          </div>
        )}
      </nav>

      {/* Theme Switcher */}
      <ThemeToggle />

      {/* User Card / Login Section */}
      <div className="p-3 text-[var(--text-main)] transition-colors">
        {isAuthenticated ? (
          <div className="bg-indigo-50/40 dark:bg-indigo-500/10 rounded-2xl p-4 transition-colors shadow-sm">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-[12px] font-black shadow-md border-2 border-white/80 dark:border-slate-800 transition-colors">
                {user?.username?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="overflow-hidden">
                <p className="text-[12px] font-extrabold text-slate-900 truncate uppercase tracking-tight leading-tight">{user?.username || "Admin"}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{user?.role || "Manager"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-700/40 text-slate-700 dark:text-slate-200 hover:bg-rose-500 dark:hover:bg-rose-500 hover:text-white dark:hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm group/logout"
            >
              <LogOut size={13} className="group-hover/logout:-translate-x-0.5 transition-transform" />
              Log Out
            </button>
          </div>
        ) : (
          <div className="px-2 pb-2">
            <button
              onClick={() => navigate("/login")}
              className="w-full py-4 rounded-[2rem] bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-2"
            >
              Officer Login <ChevronRight size={14} />
            </button>
            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 text-center mt-3 uppercase tracking-widest leading-relaxed">Official Staff & Admin Use Only</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
