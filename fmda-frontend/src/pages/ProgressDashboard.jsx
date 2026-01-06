import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosConfig";
import { TrendingUp, CheckCircle, Clock, AlertTriangle, Activity, Calendar } from "lucide-react";
import Pagination from "../components/Pagination";

const ProgressDashboard = () => {
    const navigate = useNavigate();
    const [initialLoading, setInitialLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [summary, setSummary] = useState(null);
    const [projects, setProjects] = useState([]);
    const [delayedProjects, setDelayedProjects] = useState([]);
    const [distribution, setDistribution] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // Filters
    const [filters, setFilters] = useState({
        workCategory: "",
        typeOfWork: "",
        status: "",
        progressRange: "",
        timelineStatus: ""
    });

    useEffect(() => {
        fetchProgressData(true);
    }, []);

    useEffect(() => {
        fetchProgressData(false);
        setCurrentPage(1); // Reset to first page when filters change
    }, [filters]);

    const fetchProgressData = async (isFirstLoad = false) => {
        if (isFirstLoad) setInitialLoading(true);
        else setIsUpdating(true);

        try {
            const queryParams = new URLSearchParams({
                workCategory: filters.workCategory,
                typeOfWork: filters.typeOfWork,
                status: filters.status
            }).toString();

            const projectParams = new URLSearchParams(filters).toString();

            const [summaryRes, projectsRes, delayedRes, distRes] = await Promise.all([
                axios.get(`/api/progress/summary?${queryParams}`),
                axios.get(`/api/progress/projects?${projectParams}`),
                isFirstLoad ? axios.get(`/api/progress/delayed`) : Promise.resolve({ data: delayedProjects }),
                isFirstLoad ? axios.get(`/api/progress/distribution`) : Promise.resolve({ data: distribution })
            ]);

            setSummary(summaryRes.data);
            setProjects(projectsRes.data);
            if (isFirstLoad) {
                setDelayedProjects(delayedRes.data);
                setDistribution(distRes.data);
            }
        } catch (error) {
            console.error("Error fetching progress data:", error);
        } finally {
            setInitialLoading(false);
            setIsUpdating(false);
        }
    };

    const getTimelineStatusColor = (status) => {
        switch (status) {
            case 'delayed': return 'bg-red-100 text-red-700 border-red-200';
            case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
            case 'at-risk': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-green-100 text-green-700 border-green-200';
        }
    };

    const getProgressColor = (progress) => {
        if (progress < 25) return 'from-red-500 to-red-600';
        if (progress < 50) return 'from-orange-500 to-orange-600';
        if (progress < 75) return 'from-blue-500 to-blue-600';
        return 'from-emerald-500 to-emerald-600';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
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
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-900">
                        Work Progress Dashboard
                    </h1>
                    <p className="text-slate-500 mt-1">Track physical progress and project timelines</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6">
                <div className="flex flex-wrap gap-4">
                    <select
                        className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer font-medium text-slate-700"
                        value={filters.workCategory}
                        onChange={(e) => setFilters({ ...filters, workCategory: e.target.value })}
                    >
                        <option value="">All Categories</option>
                        <option value="Road">Road</option>
                        <option value="Drain">Drain</option>
                        <option value="Sewer">Sewer</option>
                    </select>

                    <select
                        className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer font-medium text-slate-700"
                        value={filters.typeOfWork}
                        onChange={(e) => setFilters({ ...filters, typeOfWork: e.target.value })}
                    >
                        <option value="">All Work Types</option>
                        <option value="New Work">New Work</option>
                        <option value="Repair">Repair</option>
                        <option value="Maintenance">Maintenance</option>
                    </select>

                    <select
                        className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer font-medium text-slate-700"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="">All Statuses</option>
                        <option value="ONGOING">Ongoing</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="PENDING">Pending</option>
                    </select>

                    <select
                        className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer font-medium text-slate-700"
                        value={filters.timelineStatus}
                        onChange={(e) => setFilters({ ...filters, timelineStatus: e.target.value })}
                    >
                        <option value="">All Timeline Status</option>
                        <option value="on-time">On Time</option>
                        <option value="at-risk">At Risk</option>
                        <option value="delayed">Delayed</option>
                        <option value="overdue">Overdue</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <KPICard
                        title="Total Projects"
                        value={summary.totalProjects}
                        subtitle="All projects"
                        icon={Activity}
                        color="bg-gradient-to-br from-slate-500 to-slate-600"
                    />
                    <KPICard
                        title="Completed"
                        value={`${summary.completionRate}%`}
                        subtitle={`${summary.completedProjects} projects`}
                        icon={CheckCircle}
                        color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                    />
                    <KPICard
                        title="Ongoing"
                        value={summary.ongoingProjects}
                        subtitle="In progress"
                        icon={TrendingUp}
                        color="bg-gradient-to-br from-blue-500 to-blue-600"
                    />
                    <KPICard
                        title="Average Progress"
                        value={`${summary.averageProgress}%`}
                        subtitle="Overall"
                        icon={Activity}
                        color="bg-gradient-to-br from-purple-500 to-purple-600"
                    />
                    <KPICard
                        title="Delayed"
                        value={summary.delayedProjects}
                        subtitle="Need attention"
                        icon={AlertTriangle}
                        color="bg-gradient-to-br from-red-500 to-red-600"
                    />
                </div>
            )}

            {/* Delayed Projects Alert */}
            {delayedProjects.length > 0 && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-red-900 mb-2">Delayed/At-Risk Projects</h3>
                            <p className="text-sm text-red-700 mb-4">
                                {delayedProjects.length} project(s) require immediate attention
                            </p>
                            <div className="space-y-2">
                                {delayedProjects.slice(0, 3).map((project) => (
                                    <div
                                        key={project.id}
                                        className="bg-white rounded-lg p-3 border border-red-100 cursor-pointer hover:border-red-300 transition-colors"
                                        onClick={() => navigate(`/projects/${project.id}`)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800 text-sm">{project.name_of_work}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {project.delay_reasons.join(" • ")}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                                                    {project.physical_progress_num}% complete
                                                </span>
                                                {project.days_remaining !== null && (
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {project.days_remaining > 0
                                                            ? `${project.days_remaining} days left`
                                                            : `${Math.abs(project.days_remaining)} days overdue`
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Progress Distribution */}
            {distribution && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Progress Ranges */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Progress Distribution</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <ProgressCard range="0-25%" count={distribution.progressRanges['0-25']} color="bg-red-100 text-red-700" />
                            <ProgressCard range="26-50%" count={distribution.progressRanges['26-50']} color="bg-amber-100 text-amber-700" />
                            <ProgressCard range="51-75%" count={distribution.progressRanges['51-75']} color="bg-blue-100 text-blue-700" />
                            <ProgressCard range="76-100%" count={distribution.progressRanges['76-100']} color="bg-emerald-100 text-emerald-700" />
                        </div>
                    </div>

                    {/* Status Distribution */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Status Distribution</h3>
                        <div className="space-y-4">
                            <StatusBar
                                label="Ongoing"
                                count={distribution.statusCounts.ONGOING || 0}
                                total={summary.totalProjects}
                                color="bg-blue-500"
                            />
                            <StatusBar
                                label="Completed"
                                count={distribution.statusCounts.COMPLETED || 0}
                                total={summary.totalProjects}
                                color="bg-emerald-500"
                            />
                            <StatusBar
                                label="Pending"
                                count={distribution.statusCounts.PENDING || 0}
                                total={summary.totalProjects}
                                color="bg-amber-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Project Timeline Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Project Timeline & Progress</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Project</th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Start Date</th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Target Date</th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Progress</th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Days Left</th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {projects.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((project) => (
                                <tr
                                    key={project.id}
                                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                >
                                    <td className="px-4 py-4">
                                        <div className="font-bold text-slate-700 text-sm leading-tight max-w-xs">
                                            {project.name_of_work}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">{project.name_of_agency}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded ${project.work_category === 'Road' ? 'bg-red-50 text-red-600' :
                                            project.work_category === 'Drain' ? 'bg-cyan-50 text-cyan-600' :
                                                'bg-green-50 text-green-600'
                                            }`}>
                                            {project.work_category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="text-sm text-slate-600">{formatDate(project.start_date)}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="text-sm text-slate-600">{formatDate(project.completion_date)}</div>
                                        {project.revised_completion_date && (
                                            <div className="text-xs text-red-600 mt-1">
                                                Revised: {formatDate(project.revised_completion_date)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="text-sm font-bold text-slate-700">
                                                {project.physical_progress_num}%
                                            </div>
                                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${getProgressColor(project.physical_progress_num)}`}
                                                    style={{ width: `${Math.min(project.physical_progress_num, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        {project.days_remaining !== null ? (
                                            <div className={`text-sm font-bold ${project.days_remaining < 0 ? 'text-red-600' :
                                                project.days_remaining < 30 ? 'text-amber-600' :
                                                    'text-slate-600'
                                                }`}>
                                                {project.days_remaining > 0
                                                    ? `${project.days_remaining}d`
                                                    : `${Math.abs(project.days_remaining)}d overdue`
                                                }
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getTimelineStatusColor(project.timeline_status)}`}>
                                            {project.timeline_status.toUpperCase().replace('-', ' ')}
                                        </span>
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
                />
            </div>
        </div>
    );
};

// KPI Card Component
const KPICard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
        <div className={`${color} p-4 flex justify-between items-start`}>
            <div className="flex-1">
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider">{title}</p>
                <p className="text-white text-2xl font-black mt-2">{value}</p>
                <p className="text-white/70 text-xs mt-1">{subtitle}</p>
            </div>
            <Icon className="text-white/30" size={32} />
        </div>
    </div>
);

// Progress Card Component
const ProgressCard = ({ range, count, color }) => (
    <div className={`${color} rounded-xl p-4 text-center`}>
        <p className="text-3xl font-black">{count}</p>
        <p className="text-xs font-bold mt-1 uppercase tracking-wider">{range}</p>
        <p className="text-xs opacity-70 mt-1">Projects</p>
    </div>
);

// Status Bar Component
const StatusBar = ({ label, count, total, color }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-700">{label}</span>
                <span className="text-sm font-bold text-slate-600">{count}</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressDashboard;
