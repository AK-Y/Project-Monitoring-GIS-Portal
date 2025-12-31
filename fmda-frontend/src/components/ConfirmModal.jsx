import { createPortal } from "react-dom";

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Yes, Submit", cancelText = "No, Go Back", type = "warning" }) => {
    if (!isOpen) return null;

    const typeStyles = {
        warning: {
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
            confirmBtn: "bg-indigo-600 hover:bg-indigo-700",
            icon: "⚠️"
        },
        danger: {
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            confirmBtn: "bg-red-600 hover:bg-red-700",
            icon: "🚨"
        }
    };

    const style = typeStyles[type] || typeStyles.warning;

    const content = (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            {/* Backdrop - simplified with solid color first to ensure visibility */}
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onCancel}></div>

            {/* Modal Box */}
            <div className="relative bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 z-[100001]">
                <div className="p-8 text-center">
                    <div className={`w-16 h-16 ${style.iconBg} ${style.iconColor} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner`}>
                        {style.icon}
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">{title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8 px-2">
                        {message}
                    </p>

                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log("Confirming save...");
                                onConfirm();
                            }}
                            className={`w-full py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all ${style.confirmBtn}`}
                        >
                            {confirmText}
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCancel();
                            }}
                            className="w-full py-3 rounded-xl text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>

                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
                    <p className="text-[9px] text-slate-400 text-center font-black uppercase tracking-widest leading-none">
                        FMDA System Security Confirmation
                    </p>
                </div>
            </div>
        </div>
    );

    if (typeof document === "undefined" || !document.body) return null;
    return createPortal(content, document.body);
};

export default ConfirmModal;
