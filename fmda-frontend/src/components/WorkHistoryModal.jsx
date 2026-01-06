import { X, Calendar, Clock, Hammer, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "../utils/axiosConfig";

const WorkHistoryModal = ({ projectId, projectName, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`/api/projects/${projectId}`);
                setHistory(res.data.progress || []);
            } catch (err) {
                console.error("Failed to fetch project history", err);
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchHistory();
        }
    }, [projectId]);

    const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Clock size={16} className="text-indigo-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Work History & Logs</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 leading-tight">
                            {projectName || "Project History"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200/50 rounded-full transition-colors"
                    >
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-500 font-bold animate-pulse">Loading History...</p>
                        </div>
                    ) : history.length > 0 ? (
                        <div className="relative pl-4 border-l-2 border-slate-100 space-y-8 ml-2">
                            {history.map((log, idx) => (
                                <div key={log.id || idx} className="relative pl-8">
                                    {/* Timeline Dot */}
                                    <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-indigo-500 shadow-sm" />

                                    <div className="flex flex-col gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    <p className="text-sm font-bold text-slate-700">
                                                        {formatDate(log.updated_on || log.created_at)}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Site Inspection Log</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-indigo-600">{log.physical_progress_percent}%</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Physical Progress</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Progress Bar */}
                                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
                                                <div
                                                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-1000"
                                                    style={{ width: `${log.physical_progress_percent}%` }}
                                                />
                                            </div>

                                            {log.remarks && (
                                                <div className="p-3 bg-white rounded-xl border border-slate-100">
                                                    <p className="text-sm text-slate-600 leading-relaxed italic">
                                                        "{log.remarks}"
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Hammer size={12} className="text-slate-400" />
                                                    <span className="text-[10px] font-bold text-slate-500">Physical: {log.physical_progress_percent}%</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <FileText size={12} className="text-slate-400" />
                                                    <span className="text-[10px] font-bold text-slate-500">Financial: {log.financial_progress_percent}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <div className="text-6xl mb-4 opacity-20">📜</div>
                            <h3 className="text-lg font-bold text-slate-400">No History Found</h3>
                            <p className="text-sm text-slate-400">Regular progress updates haven't been logged yet.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        Close History
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkHistoryModal;
