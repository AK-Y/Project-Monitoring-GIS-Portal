import fmdaLogo from "../assets/fmda.png";
import stateLogo from "../assets/state.png";

const Header = () => {
    return (
        <header className="w-full flex flex-col bg-white shadow-lg z-[100] relative transition-colors duration-300">
            {/* Main Branding Bar */}
            <div className="w-full bg-white py-3 px-8">
                <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-8">
                    {/* Haryana Government Branding - LEFT SIDE */}
                    <div className="flex items-center flex-shrink-0">
                        <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-white/5 py-2 transition-colors">
                            <img src={stateLogo} alt="Haryana Seal" className="w-full h-full object-contain filter dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-xl font-extrabold text-slate-900 leading-none uppercase tracking-tight whitespace-nowrap transition-colors">Government of Haryana</h2>
                            <p className="text-[14px] font-bold text-emerald-900 dark:text-emerald-500/90 uppercase tracking-widest mt-1.5 whitespace-nowrap transition-colors">हरियाणा सरकार</p>
                        </div>
                    </div>

                    {/* FMDA Branding - RIGHT SIDE */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex flex-col items-end text-right">
                            <h2 className="text-xl font-extrabold text-slate-900 leading-none uppercase tracking-tight whitespace-nowrap transition-colors">Faridabad Metropolitan</h2>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.25em] mt-1 mb-1.5 whitespace-nowrap transition-colors">Development Authority</p>
                            <div className="flex flex-col items-end">
                                <span className="text-[12px] font-bold text-emerald-900 dark:text-emerald-500/90 leading-tight whitespace-nowrap transition-colors opacity-90">फरीदाबाद महानगर विकास प्राधिकरण</span>
                            </div>
                        </div>
                        <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-white/5 transition-colors">
                            <img src={fmdaLogo} alt="FMDA Logo" className="w-full h-full object-contain filter rounded-2xl dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
