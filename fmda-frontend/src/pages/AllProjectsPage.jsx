import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchFilteredProjects } from "../store/slices/projectSlice";
import { useNavigate } from "react-router-dom";
import TimelineWarningBadge from "../components/TimelineWarningBadge";
import Pagination from "../components/Pagination";

const AllProjectsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const filteredProjects = useSelector((s) => s.projects.filtered);
    const { user } = useSelector((s) => s.auth);

    const [status, setStatus] = useState("");
    const [workType, setWorkType] = useState("");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    useEffect(() => {
        dispatch(fetchFilteredProjects({
            status,
            typeOfWork: workType,
            search
        }));
        setCurrentPage(1); // Reset to first page when search/filters change
    }, [dispatch, status, workType, search]);

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900">
                        Project Management
                    </h1>
                    <p className="text-slate-500 mt-1">View and filter all engineering projects</p>
                </div>
                {user && user.role !== 'VIEWER' && (
                    <button
                        onClick={() => navigate('/projects/new')}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:shadow-slate-200 transition-all active:scale-95"
                    >
                        + Create Project
                    </button>
                )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6">
                <div className="flex flex-wrap gap-4 mb-8">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[300px]">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by project name..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <select
                        className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer font-medium text-slate-700"
                        onChange={(e) => setStatus(e.target.value)}
                        value={status}
                    >
                        <option value="">All Statuses</option>
                        <option value="ONGOING">Ongoing</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="PENDING">Pending</option>
                    </select>

                    <select
                        className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer font-medium text-slate-700"
                        onChange={(e) => setWorkType(e.target.value)}
                        value={workType}
                    >
                        <option value="">All Work Types</option>
                        <option value="New Work">New Work</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Repair">Repair</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Project Particulars</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Work Deadline</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">DLP Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Budget (Lakh)</th>
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
                                            {/* Display Asset IDs */}
                                            {p.asset_ids && p.asset_ids.length > 0 && (
                                                <div className="mb-2">
                                                    {p.asset_ids.map((assetId, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-block bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded mr-1.5 mb-1"
                                                        >
                                                            Asset ID {assetId}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors leading-tight">
                                                {p.name_of_work}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1 font-medium">Agency: {p.name_of_agency || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-sm font-semibold px-3 py-1 rounded-lg inline-block w-fit ${p.work_category === 'Road' ? 'bg-red-50 text-red-600' :
                                                    p.work_category === 'Drain' ? 'bg-cyan-50 text-cyan-600' :
                                                        p.work_category === 'Sewer' ? 'bg-green-50 text-green-600' :
                                                            'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {p.work_category || 'N/A'}
                                                </span>
                                                <span className="text-xs text-slate-400 font-medium">
                                                    {p.type_of_work}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${p.status === "ONGOING" ? "bg-emerald-100 text-emerald-700" :
                                                p.status === "COMPLETED" ? "bg-indigo-100 text-indigo-700" :
                                                    "bg-amber-100 text-amber-700"
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${p.status === "ONGOING" ? "bg-emerald-500" :
                                                    p.status === "COMPLETED" ? "bg-indigo-500" :
                                                        "bg-amber-500"
                                                    }`}></span>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center align-top">
                                            {p.timeline?.work ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <TimelineWarningBadge
                                                        status={p.timeline.work.status}
                                                        icon={p.timeline.work.icon}
                                                        badge={p.timeline.work.badge}
                                                        compact={true}
                                                    />
                                                    {p.timeline.work.daysRemaining !== null && (
                                                        <span className="text-xs text-slate-500">
                                                            {p.timeline.work.daysRemaining > 0
                                                                ? `${p.timeline.work.daysRemaining}d left`
                                                                : p.timeline.work.daysRemaining === 0
                                                                    ? 'Due today'
                                                                    : `${Math.abs(p.timeline.work.daysRemaining)}d overdue`
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center align-top">
                                            {p.timeline?.dlp && p.timeline.dlp.status !== 'not-applicable' && p.timeline.dlp.status !== 'no-dlp' ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <TimelineWarningBadge
                                                        status={p.timeline.dlp.status}
                                                        icon={p.timeline.dlp.icon}
                                                        badge={p.timeline.dlp.badge}
                                                        compact={true}
                                                    />
                                                    {p.timeline.dlp.status === 'preview' ? (
                                                        <span className="text-xs text-slate-500">
                                                            Starts: {new Date(p.timeline.dlp.dlpStartDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    ) : p.timeline.dlp.daysRemaining !== null && (
                                                        <span className="text-xs text-slate-500">
                                                            {p.timeline.dlp.daysRemaining > 0
                                                                ? `${p.timeline.dlp.daysRemaining}d left`
                                                                : p.timeline.dlp.daysRemaining === 0
                                                                    ? 'Ends today'
                                                                    : `Expired ${Math.abs(p.timeline.dlp.daysRemaining)}d ago`
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right align-top">
                                            <div className="text-sm font-bold text-slate-800">₹ {Number(p.budget_during_year).toLocaleString()}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Lakhs</div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="text-4xl mb-3">📂</div>
                                        <div className="text-slate-500 font-medium">No projects found. Try adjusting filters.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredProjects.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default AllProjectsPage;
