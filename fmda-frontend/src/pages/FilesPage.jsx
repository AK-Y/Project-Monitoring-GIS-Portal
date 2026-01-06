import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchFiles } from "../store/slices/fileSlice";
import { fetchFilteredProjects } from "../store/slices/projectSlice";
import OfficerOnly from "../components/OfficerOnly";
import TimelineWarningBadge from "../components/TimelineWarningBadge";
import Pagination from "../components/Pagination";

const FilesPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { list: files, loading: filesLoading } = useSelector((s) => s.files);
    const filteredProjects = useSelector((s) => s.projects.filtered);
    const { user } = useSelector((s) => s.auth);

    const [activeTab, setActiveTab] = useState("approvals");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    useEffect(() => {
        if (activeTab === "approvals") {
            dispatch(fetchFiles());
        } else {
            dispatch(fetchFilteredProjects());
        }
    }, [dispatch, activeTab]);

    const renderApprovalTable = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">File Name / Proposed Work</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Current Holder</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Est. Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {files.length > 0 ? (
                        files.map((f) => (
                            <tr
                                key={f.id}
                                className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                                onClick={() => navigate(`/files/${f.id}`)}
                            >
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-700 group-hover:text-sky-600 transition-colors">
                                        {f.name_of_work}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-0.5">Created by {f.creator_name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                                        {f.project_category}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${f.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                        f.status === 'RETURNED' ? 'bg-rose-100 text-rose-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {f.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-indigo-600">
                                        {f.current_holder_role || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="font-bold text-slate-800">₹ {Number(f.estimated_amount).toLocaleString()} L</div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">
                                No files found in the approval chain.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderActiveWorksTable = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Project Particulars</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Deadline</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Budget (L)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredProjects.length > 0 ? (
                        filteredProjects.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((p) => (
                            <tr
                                key={p.id}
                                className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                                onClick={() => navigate(`/projects/${p.id}`)}
                            >
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                                        {p.name_of_work}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">Agency: {p.name_of_agency || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${p.status === "ONGOING" ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"
                                        }`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center">
                                        <TimelineWarningBadge
                                            status={p.timeline?.work?.status}
                                            icon={p.timeline?.work?.icon}
                                            badge={p.timeline?.work?.badge}
                                            compact={true}
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="font-bold text-slate-800">₹ {Number(p.budget_during_year).toLocaleString()}</div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">
                                No active works found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 font-bold text-xs mb-2 transition-all"
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900">Work Management System</h1>
                    <p className="text-slate-500 mt-1">Manage approvals and monitor active engineering works</p>
                </div>
                <div className="flex gap-3">
                    {(user?.role === 'JE' || user?.role === 'ADMIN') && (
                        <button
                            onClick={() => navigate('/files/new')}
                            className="px-6 py-2.5 bg-sky-600 text-white rounded-xl font-bold shadow-lg hover:shadow-sky-100 transition-all active:scale-95"
                        >
                            + Create New File
                        </button>
                    )}
                    <OfficerOnly>
                        <button
                            onClick={() => navigate('/projects/new')}
                            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:shadow-slate-200 transition-all active:scale-95"
                        >
                            + Immediate Work
                        </button>
                    </OfficerOnly>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="flex border-b border-slate-100 bg-slate-50/50">
                    <button
                        onClick={() => { setActiveTab("approvals"); setCurrentPage(1); }}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === "approvals" ? "bg-white text-sky-600 z-10" : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        Files (Approval Chain)
                        {activeTab === "approvals" && <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500" />}
                    </button>
                    <button
                        onClick={() => { setActiveTab("active"); setCurrentPage(1); }}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === "active" ? "bg-white text-indigo-600 z-10" : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        Active Works (Sanctioned)
                        {activeTab === "active" && <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />}
                    </button>
                </div>

                <div className="p-2">
                    {activeTab === "approvals" ? renderApprovalTable() : renderActiveWorksTable()}
                </div>

                {activeTab === "active" && filteredProjects.length > pageSize && (
                    <div className="p-4 border-t border-slate-50">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredProjects.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilesPage;
