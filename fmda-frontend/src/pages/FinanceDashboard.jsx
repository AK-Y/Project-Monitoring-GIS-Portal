import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "../utils/axiosConfig";
import { TrendingUp, IndianRupee, AlertTriangle, Activity, Briefcase } from "lucide-react";
import Pagination from "../components/Pagination";

const FinanceDashboard = () => {
    const { user } = useSelector((s) => s.auth);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [summary, setSummary] = useState(null);
    const [projects, setProjects] = useState([]);
    const [riskProjects, setRiskProjects] = useState([]);
    const [distribution, setDistribution] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // Filters
    const [filters, setFilters] = useState({
        workCategory: "",
        typeOfWork: "",
        status: "",
        riskLevel: ""
    });

    useEffect(() => {
        fetchFinanceData(true);
    }, []);

    useEffect(() => {
        fetchFinanceData(false);
        setCurrentPage(1); // Reset to first page when filters change
    }, [filters]);

    const fetchFinanceData = async (isFirstLoad = false) => {
        if (isFirstLoad) setInitialLoading(true);
        else setIsUpdating(true);

        try {
            const queryParams = new URLSearchParams(filters).toString();

            // Only fetch distribution and risk projects once or if explicitly needed
            // For now, let's keep it simple but prevent the full page flash
            const [summaryRes, projectsRes, riskRes, distRes] = await Promise.all([
                axios.get(`/api/finance/summary?${queryParams}`),
                axios.get(`/api/finance/projects?${queryParams}`),
                isFirstLoad ? axios.get(`/api/finance/risk-projects`) : Promise.resolve({ data: riskProjects }),
                isFirstLoad ? axios.get(`/api/finance/distribution`) : Promise.resolve({ data: distribution })
            ]);

            setSummary(summaryRes.data);
            setProjects(projectsRes.data);
            if (isFirstLoad) {
                setRiskProjects(riskRes.data);
                setDistribution(distRes.data);
            }
        } catch (error) {
            console.error("Error fetching finance data:", error);
        } finally {
            setInitialLoading(false);
            setIsUpdating(false);
        }
    };

    const formatCurrency = (amount) => {
        return `₹ ${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    };

    const getRiskBadgeColor = (level) => {
        switch (level) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-green-100 text-green-700 border-green-200';
        }
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className={`animate-fade-in space-y-8 pb-12 transition-opacity duration-300 ${isUpdating ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="relative">
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-emerald-600 rounded-full shadow-[0_0_15px_rgba(5,150,105,0.5)]"></div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Finance & <span className="text-emerald-600">Payments</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Track project budgets and payment history</p>
                </div>
            </div>

            {/* Filters - More Sleek */}
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white shadow-2xl shadow-slate-200/40 p-2">
                <div className="flex flex-wrap gap-2">
                    <select
                        className="bg-white border border-slate-100 rounded-2xl px-6 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 cursor-pointer font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        value={filters.workCategory}
                        onChange={(e) => setFilters({ ...filters, workCategory: e.target.value })}
                    >
                        <option value="">All Categories</option>
                        <option value="Road">Roads</option>
                        <option value="Drain">Drains</option>
                        <option value="Sewer">Sewers</option>
                    </select>

                    <select
                        className="bg-white border border-slate-100 rounded-2xl px-6 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 cursor-pointer font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        value={filters.typeOfWork}
                        onChange={(e) => setFilters({ ...filters, typeOfWork: e.target.value })}
                    >
                        <option value="">Work Type</option>
                        <option value="New Work">New Construction</option>
                        <option value="Repair">Repair Work</option>
                        <option value="Maintenance">Maintenance</option>
                    </select>

                    <div className="h-10 w-px bg-slate-100 mx-2"></div>

                    <div className="flex bg-slate-100/50 p-1 rounded-2xl">
                        {['', 'high', 'medium', 'low'].map((level) => (
                            <button
                                key={level}
                                onClick={() => setFilters({ ...filters, riskLevel: level })}
                                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filters.riskLevel === level
                                    ? 'bg-white text-emerald-700 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {level || 'All Alerts'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Financial Overview - Large Unified Card */}
            {summary && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32"></div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white/50 text-xs font-black uppercase tracking-[0.2em] mb-4">Financial Status</p>
                                    <h3 className="text-4xl font-black tracking-tight">{formatCurrency(summary.totalApproved)}</h3>
                                    <p className="text-emerald-400 text-xs font-bold mt-2 flex items-center gap-1">
                                        Total Approved Budget
                                    </p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-3xl border border-white/10">
                                    <IndianRupee size={32} className="text-emerald-400" />
                                </div>
                            </div>

                            <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-white/10">
                                <div>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Paid to Date</p>
                                    <p className="text-xl font-black text-emerald-400">{formatCurrency(summary.totalPaid)}</p>
                                    <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: `${summary.overallFinancialProgress}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Pending Payment</p>
                                    <p className="text-xl font-black text-amber-400">{formatCurrency(summary.totalPending)}</p>
                                    <p className="text-[10px] font-bold text-white/30 mt-2 italic">Awaiting clearance</p>
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Budget Spent (%)</p>
                                    <p className="text-xl font-black">{summary.overallFinancialProgress}%</p>
                                    <p className="text-[10px] font-bold text-emerald-500 mt-2 uppercase tracking-wide">Usage: Efficient</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white flex flex-col justify-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="text-center">
                            <p className="text-white/60 text-xs font-black uppercase tracking-[0.2em] mb-2">Total Projects</p>
                            <h4 className="text-6xl font-black tracking-tighter">{summary.ongoingProjects}</h4>
                            <p className="text-emerald-100/70 text-[11px] font-bold mt-4 leading-relaxed px-4">
                                Number of active projects being tracked for payments and budget usage.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Risk Indicators - Redesigned */}
            {riskProjects.length > 0 && (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Payment Alerts</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Projects that need attention regarding pending payments</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {riskProjects.slice(0, 3).map((project) => (
                            <div key={project.id} className="group p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-red-200 hover:bg-red-50/30 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                        Check Payment
                                    </div>
                                    <span className="text-xs font-black text-slate-900">{formatCurrency(project.pending_amount)}</span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-red-900 transition-colors drop-shadow-sm">{project.name_of_work}</h4>
                                <div className="flex flex-wrap gap-1.5 mt-4">
                                    {project.risk_reasons.map((reason, i) => (
                                        <span key={i} className="text-[9px] font-bold text-slate-400 group-hover:text-red-700/50 transition-colors">#{reason}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Project Financial Ledger - Table Redesign */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-0 overflow-hidden">
                <div className="p-8 pb-4 border-b border-slate-50">
                    <h3 className="text-xl font-black text-slate-900">Project Payment Records</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Detailed breakdown of payments for each project</p>
                </div>

                <div className="overflow-x-auto px-4 pb-4">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Project Name</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] text-right">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] text-right">Total Approved</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] text-right">Paid</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] text-right">Pending</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] text-center">Progress</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {projects.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((project, idx) => (
                                <tr key={project.id} className={`group hover:bg-emerald-50/30 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shadow-inner border border-white ${project.work_category === 'Road' ? 'bg-amber-100 text-amber-700' :
                                                project.work_category === 'Drain' ? 'bg-sky-100 text-sky-700' :
                                                    'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                {project.work_category?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm leading-tight max-w-xs">{project.name_of_work}</p>
                                                <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-wider">{project.name_of_agency}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-full border shadow-sm ${getRiskBadgeColor(project.risk_level)}`}>
                                            {project.risk_level.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <p className="text-sm font-black text-slate-900">{formatCurrency(project.approved_amount)}</p>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <p className="text-sm font-black text-emerald-600">{formatCurrency(project.paid_amount)}</p>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <p className="text-sm font-black text-amber-600">{formatCurrency(project.pending_amount)}</p>
                                    </td>
                                    <td className="px-6 py-6 font-bold text-slate-800 text-center">
                                        {project.calculated_financial_progress}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalItems={projects.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    className="p-8 pt-0"
                />
            </div>
        </div>
    );
};

export default FinanceDashboard;
