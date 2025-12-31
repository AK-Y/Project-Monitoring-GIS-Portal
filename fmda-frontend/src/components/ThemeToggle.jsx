import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "../store/slices/themeSlice";
import { Sun, Moon, Monitor } from "lucide-react";

const ThemeToggle = () => {
    const dispatch = useDispatch();
    const { mode } = useSelector((state) => state.theme);

    const options = [
        { id: "light", icon: Sun, label: "Light" },
        { id: "dark", icon: Moon, label: "Dark" },
        { id: "system", icon: Monitor, label: "System" },
    ];

    return (
        <div className="flex bg-slate-50 border border-slate-200 p-0.5 rounded-xl mx-4 mt-auto mb-2">
            {options.map((opt) => {
                const Icon = opt.icon;
                const isActive = mode === opt.id;
                return (
                    <button
                        key={opt.id}
                        onClick={() => dispatch(setTheme(opt.id))}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${isActive
                            ? "bg-white shadow-sm text-indigo-600 border border-slate-100"
                            : "text-slate-400 hover:text-slate-600"
                            }`}
                        title={`${opt.label} Mode`}
                    >
                        <Icon size={12} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[9px] font-black uppercase tracking-wider hidden lg:block">
                            {opt.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default ThemeToggle;
