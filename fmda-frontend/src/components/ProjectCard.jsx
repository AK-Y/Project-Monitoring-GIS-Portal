import { useNavigate } from "react-router-dom";
import { TrendingUp, Calendar, Wallet, Clock } from "lucide-react";
import TimelineWarningBadge from "./TimelineWarningBadge";

const ProjectCard = ({ project }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/projects/${project.id}`);
    };

    // Parse progress percentages
    const physicalProgress = project.physical_progress
        ? parseInt(project.physical_progress.replace('%', ''))
        : 0;
    const financialProgress = project.financial_progress
        ? parseInt(project.financial_progress.replace('%', ''))
        : 0;

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div
            onClick={handleCardClick}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 overflow-hidden"
        >
            <div className="flex flex-col lg:flex-row">
                {/* LEFT SECTION - Project Info & Financials */}
                <div className="flex-1 p-5 border-b lg:border-b-0 lg:border-r border-slate-100">
                    {/* Asset IDs */}
                    {project.asset_ids && project.asset_ids.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                            {project.asset_ids.map((assetId, idx) => (
                                <span
                                    key={idx}
                                    className="inline-block bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider"
                                >
                                    Asset ID: {assetId}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Project Name */}
                    <h3 className="font-bold text-slate-800 text-sm leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {project.name_of_work}
                    </h3>

                    {/* Type of Work & Category */}
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-lg ${project.work_category === 'Road' ? 'bg-red-50 text-red-600' :
                            project.work_category === 'Drain' ? 'bg-cyan-50 text-cyan-600' :
                                project.work_category === 'Sewer' ? 'bg-green-50 text-green-600' :
                                    'bg-slate-100 text-slate-600'
                            }`}>
                            {project.work_category || 'N/A'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                            {project.type_of_work}
                        </span>
                    </div>

                    {/* A/A Approval */}
                    <div className="bg-slate-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Wallet size={12} className="text-slate-400" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">A/A Approval</span>
                        </div>
                        <div className="text-xl font-black text-slate-800">
                            ₹ {Number(project.aa_amount || 0).toLocaleString()}
                        </div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Lakhs</div>
                    </div>
                </div>

                {/* CENTER SECTION - Timeline & Progress */}
                <div className="flex-1 p-5 border-b lg:border-b-0 lg:border-r border-slate-100">
                    {/* Timeline */}
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar size={14} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timeline</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-medium">Start</span>
                                <span className="text-slate-700 font-bold">{formatDate(project.start_date)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-medium">Completion</span>
                                <span className="text-slate-700 font-bold">{formatDate(project.completion_date)}</span>
                            </div>
                            {project.revised_completion_date && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400 font-medium">Revised</span>
                                    <span className="text-amber-600 font-bold">{formatDate(project.revised_completion_date)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-medium">DLP Period</span>
                                <span className="text-slate-700 font-bold">
                                    {project.dlp
                                        ? `${project.dlp}${project.dlp.toLowerCase().includes('year') || project.dlp.toLowerCase().includes('month') ? '' : ' months'}`
                                        : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={14} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                        </div>

                        {/* Physical */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs font-bold text-slate-600">Physical</span>
                                <span className="text-sm font-black text-indigo-600">{physicalProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${physicalProgress}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Financial */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs font-bold text-slate-600">Financial</span>
                                <span className="text-sm font-black text-emerald-600">{financialProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${financialProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SECTION - Status Indicators */}
                <div className="w-full lg:w-80 p-5 bg-slate-50/30">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock size={12} className="text-slate-400" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                    </div>

                    <div className="space-y-3">
                        {/* Work Status */}
                        {project.timeline?.work && (
                            <div className="bg-white rounded-lg p-3 border border-slate-100">
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Work Status</div>
                                <div className="flex items-start gap-2">
                                    <TimelineWarningBadge
                                        status={project.timeline.work.status}
                                        icon={project.timeline.work.icon}
                                        badge={project.timeline.work.badge}
                                        compact={false}
                                    />
                                    {project.timeline.work.daysRemaining !== null && (
                                        <span className="text-[10px] text-slate-600 font-medium mt-0.5">
                                            {project.timeline.work.daysRemaining > 0
                                                ? `${project.timeline.work.daysRemaining}d left`
                                                : project.timeline.work.daysRemaining === 0
                                                    ? 'Due today'
                                                    : `${Math.abs(project.timeline.work.daysRemaining)}d overdue`
                                            }
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* DLP Status */}
                        {project.timeline?.dlp && project.timeline.dlp.status !== 'not-applicable' && project.timeline.dlp.status !== 'no-dlp' && (
                            <div className="bg-white rounded-lg p-3 border border-slate-100">
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">DLP Status</div>
                                <div className="flex items-start gap-2">
                                    <TimelineWarningBadge
                                        status={project.timeline.dlp.status}
                                        icon={project.timeline.dlp.icon}
                                        badge={project.timeline.dlp.badge}
                                        compact={false}
                                    />
                                    {project.timeline.dlp.status === 'preview' ? (
                                        <span className="text-[10px] text-slate-600 font-medium mt-0.5">
                                            Starts: {new Date(project.timeline.dlp.dlpStartDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    ) : project.timeline.dlp.daysRemaining !== null && (
                                        <span className="text-[10px] text-slate-600 font-medium mt-0.5">
                                            {project.timeline.dlp.daysRemaining > 0
                                                ? `${project.timeline.dlp.daysRemaining}d left`
                                                : project.timeline.dlp.daysRemaining === 0
                                                    ? 'Ends today'
                                                    : `Expired ${Math.abs(project.timeline.dlp.daysRemaining)}d ago`
                                            }
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
