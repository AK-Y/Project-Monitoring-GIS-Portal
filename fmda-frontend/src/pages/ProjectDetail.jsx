import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjectDetail, deleteProjectAsset, deletePayment, deleteProgressLog } from "../store/slices/projectSlice";
import UpdateProgressModal from "../components/UpdateProgressModal";
import AddAssetModal from "../components/AddAssetModal";
import AssetDetailModal from "../components/AssetDetailModal";
import AddPaymentModal from "../components/AddPaymentModal";
import ConfirmModal from "../components/ConfirmModal";
import { deleteProject } from "../store/slices/projectSlice";
import { Edit3, Trash2, Pencil, Calendar, IndianRupee, Hammer, FileText, Banknote, Clock } from "lucide-react";
import TimelineWarningBadge from "../components/TimelineWarningBadge";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { current: data } = useSelector((s) => s.projects);
  const { user } = useSelector((s) => s.auth);
  const mode = useSelector((s) => s.theme?.mode || 'light');
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      if (mode === 'system') {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light';
      }
    }
    return mode;
  });

  useEffect(() => {
    if (mode === 'system') {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const updateTheme = () => setTheme(mediaQuery.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    } else {
      setTheme(mode);
    }
  }, [mode]);

  const [activeTab, setActiveTab] = useState("overview");
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [assetToEdit, setAssetToEdit] = useState(null);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [paymentToEdit, setPaymentToEdit] = useState(null);
  const [progressToDelete, setProgressToDelete] = useState(null);
  const [progressToEdit, setProgressToEdit] = useState(null);

  useEffect(() => {
    dispatch(fetchProjectDetail(id));
  }, [dispatch, id]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteProject(id)).unwrap();
      navigate("/projects");
    } catch (err) {
      alert("Failed to delete project");
    }
  };

  const handleDeleteAsset = async () => {
    if (!assetToDelete) return;
    try {
      await dispatch(deleteProjectAsset({ projectId: id, assetId: assetToDelete.id })).unwrap();
      setAssetToDelete(null);
    } catch (err) {
      alert("Failed to delete asset");
    }
  };

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    try {
      await dispatch(deletePayment({ projectId: id, paymentId: paymentToDelete.id })).unwrap();
      setPaymentToDelete(null);
    } catch (err) {
      alert("Failed to delete payment: " + (err.error || err.message || err));
    }
  };

  const handleDeleteProgress = async () => {
    if (!progressToDelete) return;
    try {
      await dispatch(deleteProgressLog({ projectId: id, progressId: progressToDelete.id })).unwrap();
      setProgressToDelete(null);
    } catch (err) {
      alert("Failed to delete progress log: " + (err.error || err.message || err));
    }
  };

  if (!data) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
    </div>
  );

  const { project, payments, progress, assets = [] } = data;

  const totalPaid = payments.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);

  // Robust Number Parsing for Government Figures
  const getNum = (val) => {
    if (!val) return 0;
    const cleaned = val.toString().replace(/[^0-9.-]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const aaAmount = getNum(project.aa_amount);
  const dnitAmount = getNum(project.dnit_amount);
  const yearlyBudget = getNum(project.budget_during_year);

  const paymentRatio = dnitAmount > 0 ? (totalPaid / dnitAmount) * 100 : 0;
  const budgetUtilization = yearlyBudget > 0 ? (totalPaid / yearlyBudget) * 100 : 0;

  const parsePercent = (val) => {
    if (!val) return 0;
    // Extract the first sequence of numbers/dots
    const match = val.toString().match(/[0-9.]+/);
    if (!match) return 0;
    const num = parseFloat(match[0]);
    return isNaN(num) ? 0 : num;
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A";
  const formatMoney = (m) => {
    if (m === null || m === undefined || m === "") return "N/A";
    const num = typeof m === 'number' ? m : getNum(m);
    return `₹ ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6 pb-12">
      {/* HEADER */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-slate-500 hover:text-sky-600 flex items-center gap-1 transition-colors"
      >
        <span>←</span> Back
      </button>

      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-start">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{project.type_of_work}</span>
              <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${project.status === "ONGOING" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                }`}>
                {project.status || "Ongoing"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2">{project.name_of_work}</h1>
            <div className="text-sm text-slate-500 grid grid-cols-2 gap-x-8 gap-y-1">
              <p>Agency: <span className="font-semibold text-slate-700">{project.name_of_agency || "N/A"}</span></p>
              <p>Project ID: <span className="font-semibold text-indigo-600 font-mono tracking-wide">{project.project_uid || `#${project.id}`}</span></p>
              <p className="col-span-2 mt-1">Asset IDs: <span className="font-semibold text-sky-600 font-mono tracking-wide bg-sky-50 px-2 py-0.5 rounded">{project.linked_asset_codes?.length > 0 ? project.linked_asset_codes.join(", ") : "N/A"}</span></p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-500 font-bold tracking-wider mb-1">Budget During Year (in Lakh)</p>
              <p className="text-2xl font-bold text-slate-800">
                {formatMoney(project.budget_during_year)}
              </p>
            </div>

            {user?.role === 'ADMIN' && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => navigate(`/projects/${id}/edit`)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm"
                >
                  <Edit3 size={14} /> Edit Data
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100 shadow-sm"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-400/10 to-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* TABS */}
      <div className="flex gap-1 border-b border-slate-200/50 pb-px overflow-x-auto">
        {["overview", "assets", "payments", "progress"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-8 py-3 text-sm font-bold uppercase tracking-wider rounded-t-xl transition-all relative whitespace-nowrap ${activeTab === t
              ? "text-sky-600 bg-white shadow-sm z-10"
              : "text-slate-400 hover:text-slate-600 hover:bg-white/40"
              }`}
          >
            {t}
            {activeTab === t && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-sky-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="glass-panel p-8 rounded-b-2xl rounded-tr-2xl min-h-[400px]">
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* Financial Section */}
            <section className="bg-white/50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">💰</span>
                Financial Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-500 mb-4 tracking-wider">Approval (A/A)</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-bold text-slate-700 mb-1">A/A Amount (in Lakh)</p>
                      <p className="text-lg font-semibold text-slate-900">{formatMoney(project.aa_amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 mb-1">A/A Date</p>
                      <p className="text-sm text-slate-600">{formatDate(project.aa_date)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-500 mb-4 tracking-wider">DNIT</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-bold text-slate-700 mb-1">DNIT Amount (in Lakh)</p>
                      <p className="text-lg font-semibold text-slate-900">{formatMoney(project.dnit_amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 mb-1">DNIT Date</p>
                      <p className="text-sm text-slate-600">{formatDate(project.dnit_date)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Timeline Section */}
            <section className="bg-white/50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-sm">📅</span>
                Timeline
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-2">Allotment Date</p>
                  <p className="text-sm text-slate-600">{formatDate(project.allotment_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-2">Start Date</p>
                  <p className="text-sm text-slate-600">{formatDate(project.start_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-2">Completion Date</p>
                  <p className="text-sm text-slate-600">{formatDate(project.completion_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-2">Revised Completion Date</p>
                  <p className="text-sm text-slate-600">{formatDate(project.revised_completion_date)}</p>
                  {project.revised_completion_date && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">Revised</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-2">Tender Date</p>
                  <p className="text-sm text-slate-600">{formatDate(project.tender_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-2">Time Limit</p>
                  <p className="text-sm text-slate-600">{project.time_limit || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-2">DLP</p>
                  <p className="text-sm text-slate-600">{project.dlp || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-2">Project Monitoring By</p>
                  <p className="text-sm text-slate-600">{project.project_monitoring_by || "N/A"}</p>
                </div>
              </div>
            </section>

            {/* Work Timeline & DLP Warning Panels */}
            {project.timeline && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Work Timeline Panel */}
                <section className="bg-white/50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">
                      <Clock size={18} />
                    </span>
                    Work Timeline
                  </h3>

                  <div className="space-y-4">
                    {/* Status Badge */}
                    <div className="flex justify-center">
                      <TimelineWarningBadge
                        status={project.timeline.work.status}
                        message={project.timeline.work.message}
                        icon={project.timeline.work.icon}
                        badge={project.timeline.work.badge}
                      />
                    </div>

                    {/* Timeline Details */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-bold text-slate-600">Start Date</span>
                        <span className="text-sm text-slate-800 font-semibold">{formatDate(project.start_date)}</span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-bold text-slate-600">Target Date</span>
                        <div className="text-right">
                          <span className="text-sm text-slate-800 font-semibold">
                            {formatDate(project.timeline.work.finalDate)}
                          </span>
                          {project.timeline.work.isRevised && (
                            <span className="block text-xs text-red-600 font-bold mt-1">Revised</span>
                          )}
                        </div>
                      </div>

                      {project.timeline.work.daysRemaining !== null && (
                        <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                          <span className="text-sm font-bold text-indigo-700">Days Remaining</span>
                          <span className="text-2xl font-black text-indigo-600">
                            {project.timeline.work.daysRemaining > 0
                              ? `${project.timeline.work.daysRemaining}d`
                              : project.timeline.work.daysRemaining === 0
                                ? 'Due Today'
                                : `${Math.abs(project.timeline.work.daysRemaining)}d overdue`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* DLP Panel */}
                <section className="bg-white/50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm">🛡️</span>
                    DLP (Defect Liability Period)
                  </h3>

                  {project.timeline.dlp.status !== 'not-applicable' && project.timeline.dlp.status !== 'no-dlp' ? (
                    <div className="space-y-4">
                      {/* Status Badge */}
                      <div className="flex justify-center">
                        <TimelineWarningBadge
                          status={project.timeline.dlp.status}
                          message={project.timeline.dlp.message}
                          icon={project.timeline.dlp.icon}
                          badge={project.timeline.dlp.badge}
                        />
                      </div>

                      {/* DLP Details */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm font-bold text-slate-600">DLP Duration</span>
                          <span className="text-sm text-slate-800 font-semibold">{project.dlp || 'N/A'}</span>
                        </div>

                        {project.timeline.dlp.dlpStartDate && (
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm font-bold text-slate-600">
                              {project.timeline.dlp.status === 'preview' ? 'Will Start' : 'Started'}
                            </span>
                            <span className="text-sm text-slate-800 font-semibold">
                              {formatDate(project.timeline.dlp.dlpStartDate)}
                            </span>
                          </div>
                        )}

                        {project.timeline.dlp.dlpEndDate && (
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm font-bold text-slate-600">
                              {project.timeline.dlp.status === 'preview' ? 'Will End' : 'Ends'}
                            </span>
                            <span className="text-sm text-slate-800 font-semibold">
                              {formatDate(project.timeline.dlp.dlpEndDate)}
                            </span>
                          </div>
                        )}

                        {project.timeline.dlp.daysRemaining !== null && project.timeline.dlp.status !== 'preview' && (
                          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <span className="text-sm font-bold text-purple-700">Days Remaining</span>
                            <span className="text-2xl font-black text-purple-600">
                              {project.timeline.dlp.daysRemaining > 0
                                ? `${project.timeline.dlp.daysRemaining}d`
                                : project.timeline.dlp.daysRemaining === 0
                                  ? 'Ends Today'
                                  : `Expired ${Math.abs(project.timeline.dlp.daysRemaining)}d ago`
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400 text-sm">No DLP information available</p>
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* Progress & Financial Audit Section */}
            <section className="bg-white/50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm">📊</span>
                Project Progress & Financial Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-2">Physical Work Progress</p>
                  <p className="text-2xl font-black text-indigo-600">{project.physical_progress || "0%"}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Work Done (Physical)</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-2">Financial Work Progress</p>
                  <p className="text-2xl font-black text-sky-600">{project.financial_progress || "0%"}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Work Certified (Bills)</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-2">Total Paid Ratio</p>
                  <p className="text-2xl font-black text-emerald-600">{paymentRatio.toFixed(2)}%</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Actual Cash Release</p>
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <div
                    className={`p-8 rounded-[2.5rem] relative overflow-hidden transition-all duration-300 ${theme === 'dark'
                      ? 'bg-black/20'
                      : 'bg-[#f1f5f9] border border-[#e2e8f0]'
                      }`}
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className={`p-5 rounded-3xl border transition-all duration-300 hover:shadow-md ${theme === 'dark' ? 'bg-violet-500/15 border-violet-500/20' : 'bg-white border-[#e2e8f0]'
                        }`}>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${theme === 'dark' ? 'text-violet-400' : 'text-violet-600/70'}`}>A/A Approval</p>
                        <p className={`text-2xl font-black mb-1 ${theme === 'dark' ? 'text-violet-300' : 'text-violet-600'}`}>{formatMoney(project.aa_amount)}</p>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full bg-violet-400 ${theme === 'dark' ? 'opacity-80' : ''}`}></span>
                          <p className={`text-[10px] font-bold uppercase ${theme === 'dark' ? 'text-violet-400/80' : 'text-violet-600/70'}`}>Admin Approval</p>
                        </div>
                      </div>

                      <div className={`p-5 rounded-3xl border transition-all duration-300 hover:shadow-md ${theme === 'dark' ? 'bg-indigo-500/15 border-indigo-500/20' : 'bg-white border-[#e2e8f0]'
                        }`}>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600/70'}`}>DNIT Amount</p>
                        <p className={`text-2xl font-black mb-1 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}`}>{formatMoney(project.dnit_amount)}</p>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full bg-indigo-400 ${theme === 'dark' ? 'opacity-80' : ''}`}></span>
                          <p className={`text-[10px] font-bold uppercase ${theme === 'dark' ? 'text-indigo-400/80' : 'text-indigo-600/70'}`}>Contract Value</p>
                        </div>
                      </div>

                      <div className={`p-5 rounded-3xl border transition-all duration-300 hover:shadow-md ${theme === 'dark' ? 'bg-emerald-500/15 border-emerald-500/20' : 'bg-white border-[#e2e8f0]'
                        }`}>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600/70'}`}>Cumulative Payment</p>
                        <p className={`text-2xl font-black mb-1 ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'}`}>{formatMoney(totalPaid)}</p>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${theme === 'dark' ? 'opacity-80' : ''}`}></span>
                          <p className={`text-[10px] font-bold uppercase ${theme === 'dark' ? 'text-emerald-400/80' : 'text-emerald-600/70'}`}>{paymentRatio.toFixed(1)}% Released</p>
                        </div>
                      </div>

                      <div className={`p-5 rounded-3xl border transition-all duration-300 hover:shadow-md ${theme === 'dark' ? 'bg-sky-500/15 border-sky-500/20' : 'bg-white border-[#e2e8f0]'
                        }`}>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${theme === 'dark' ? 'text-sky-400' : 'text-sky-600/70'}`}>Budget During Year</p>
                        <p className={`text-2xl font-black mb-1 ${theme === 'dark' ? 'text-sky-300' : 'text-sky-600'}`}>{formatMoney(project.budget_during_year)}</p>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full bg-sky-400 ${theme === 'dark' ? 'opacity-80' : ''}`}></span>
                          <p className={`text-[10px] font-bold uppercase ${theme === 'dark' ? 'text-sky-400/80' : 'text-sky-600/70'}`}>{budgetUtilization.toFixed(1)}% Utilized</p>
                        </div>
                      </div>

                      <div className={`p-5 rounded-3xl border transition-all duration-300 hover:shadow-md ${theme === 'dark' ? 'bg-amber-500/15 border-amber-500/20' : 'bg-white border-[#e2e8f0]'
                        }`}>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600/70'}`}>Balance Amount</p>
                        <p className={`text-2xl font-black mb-1 ${theme === 'dark' ? 'text-amber-300' : 'text-amber-600'}`}>{formatMoney(dnitAmount - totalPaid)}</p>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full bg-amber-400 ${theme === 'dark' ? 'opacity-80' : ''}`}></span>
                          <p className={`text-[10px] font-bold uppercase ${theme === 'dark' ? 'text-amber-400/80' : 'text-amber-600/70'}`}>Pending Liability</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {project.detail_of_payment && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <p className={`text-sm font-bold mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>Detail of Payment</p>
                    <p className={`text-sm leading-relaxed italic border-l-4 border-indigo-400 pl-4 py-3 rounded-r-2xl ${theme === 'dark' ? 'bg-black/20 text-slate-300' : 'bg-slate-50 text-slate-600'
                      }`}>
                      {project.detail_of_payment}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === "assets" && (
          <div className="space-y-6 animate-fade-in">
            {assets.length > 0 ? (
              assets.map((asset, idx) => (
                <div
                  key={asset.id || idx}
                  onClick={() => setSelectedAsset(asset)}
                  className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition-all group flex flex-col gap-6 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-[#0ea5e9] text-white text-sm font-bold rounded-lg shadow-sm shadow-sky-200">
                          Asset ID: {asset.asset_code || asset.asset_id || `#${asset.id}`}
                        </span>
                        <h4 className="font-bold text-lg text-slate-800">
                          {asset.type_of_road || asset.asset_type || "Asset"}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 pl-1">
                        {asset.start_point || "Start N/A"} ➝ {asset.end_point || "End N/A"}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border px-2 py-1 rounded border-slate-200 bg-slate-50">
                        {asset.asset_type || "Road Asset"}
                      </span>
                      {user && user.role !== 'VIEWER' && asset.id && (
                        <div className="flex gap-3 mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssetToEdit(asset);
                            }}
                            className="text-sky-500 hover:text-sky-600 transition-all hover:scale-110"
                            title="Edit Asset"
                          >
                            <Pencil size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-8 pt-4 border-t border-slate-50">
                    <div>
                      <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1">Carriage Way (m)</p>
                      <p className="font-bold text-slate-800">{asset.width_of_carriage_way || "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1">ROW (m)</p>
                      <p className="font-bold text-slate-800">{asset.row_width || "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1">Taken Over</p>
                      <p className="font-bold text-slate-800">
                        {asset.road_taken_over_from || "N/A"} {asset.year_of_taken_over && <span className="text-slate-400 font-normal">({asset.year_of_taken_over})</span>}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1">Length (m)</p>
                      <p className="font-black text-slate-800 text-lg">{asset.length || "0"}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
                <p className="text-slate-400 italic">No asset details linked to this project.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-6 animate-fade-in">
            {/* Payment Summary Cards */}
            {/* Payment Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-5 rounded-3xl shadow-xl shadow-emerald-900/20 border border-emerald-400/20 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-1 opacity-80">Total Paid Amount</p>
                  <p className="text-2xl font-black text-white tracking-tight leading-none mb-3">{formatMoney(totalPaid)}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-400/20 flex items-center justify-center text-xs text-emerald-100">Rs</div>
                    <p className="text-[9px] text-emerald-100/70 font-bold uppercase tracking-wide">Sum of all bills</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-indigo-700 p-5 rounded-3xl shadow-xl shadow-blue-900/20 border border-blue-400/20 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1 opacity-80">Official Payment Done</p>
                  <p className="text-2xl font-black text-white tracking-tight leading-none mb-3">{project.financial_progress || "N/A"}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-400/20 flex items-center justify-center text-xs text-blue-100">%</div>
                    <p className="text-[9px] text-blue-100/70 font-bold uppercase tracking-wide">As per project record</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-5 rounded-3xl shadow-xl shadow-slate-900/20 border border-slate-600/20 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 opacity-80">DNIT Amount</p>
                  <p className="text-2xl font-black text-white tracking-tight leading-none mb-3">{formatMoney(project.dnit_amount)}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-slate-500/20 flex items-center justify-center text-xs text-slate-300">#</div>
                    <p className="text-[9px] text-slate-400/70 font-bold uppercase tracking-wide">Total Approved Budget</p>
                  </div>
                </div>
              </div>
            </div>

            {project.detail_of_payment && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">📝</span> Payment Details & Notes
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed italic border-l-4 border-indigo-400 pl-4 py-1 bg-slate-50/50 rounded-r-lg">
                  {project.detail_of_payment}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100">
              <h4 className="text-lg font-bold text-slate-800">Payment History</h4>
              {user && user.role !== 'VIEWER' && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-md transition-colors flex items-center gap-2"
                >
                  <span>+</span> Add Payment
                </button>
              )}
            </div>

            {payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((pay) => (
                  <div key={pay.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xl">
                          💰
                        </div>
                        <div>
                          <p className="font-bold text-lg text-slate-800">{pay.bill_no || "Bill payment"}</p>
                          <p className="text-sm text-slate-500">{formatDate(pay.payment_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-bold text-2xl text-emerald-600">{formatMoney(pay.amount)}</p>
                          <p className="text-xs text-slate-400 font-bold">Paid (in Lakh)</p>
                        </div>
                        {user && user.role !== 'VIEWER' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setPaymentToEdit(pay)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit Payment"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setPaymentToDelete(pay)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Payment"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 italic">No payments recorded yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "progress" && (
          <div className="space-y-8 animate-fade-in">
            {/* Current Status Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Physical Progress */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-sm border border-sky-200">
                      <Hammer size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-500 tracking-wider text-[10px]">Physical Work Progress</h3>
                      <p className="text-lg font-black text-slate-800">{project.physical_progress || (progress?.[0]?.physical_progress_percent + '%') || "0%"}</p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200/50 rounded-full h-3 overflow-hidden border border-white shadow-inner mb-2">
                    <div
                      className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
                      style={{ width: `${parsePercent(project.physical_progress) || progress?.[0]?.physical_progress_percent || 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Official Status: {project.physical_progress || "N/A"}</p>
                </div>

                {/* Financial Progress (Work Certified) */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-200">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-500 tracking-wider text-[10px]">Financial Work Progress (Certified)</h3>
                      <p className="text-lg font-black text-slate-800">
                        {project.financial_progress || (progress?.[0]?.financial_progress_percent + '%') || "0%"}
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200/50 rounded-full h-3 overflow-hidden border border-white shadow-inner mb-2">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
                      style={{ width: `${parsePercent(project.financial_progress) || progress?.[0]?.financial_progress_percent || 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Progress as per latest site inspection/bills</p>
                </div>

                {/* Actual Payment Ratio */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-200">
                      <Banknote size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-500 tracking-wider text-[10px]">Actual Payment Ratio</h3>
                      <p className="text-lg font-black text-emerald-600">{paymentRatio.toFixed(2)}% Paid</p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200/50 rounded-full h-3 overflow-hidden border border-white shadow-inner mb-2">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
                      style={{ width: `${paymentRatio}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Cumulative Payment vs Contract Amount</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-center gap-3 min-w-[200px]">
                  {user && user.role !== 'VIEWER' && (
                    <button
                      onClick={() => setShowProgressModal(true)}
                      className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span>⚡</span> Update Progress
                    </button>
                  )}
                  <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-tighter">Maintain regular updates</p>
                </div>
              </div>
            </div>

            <div className="relative pl-4 border-l border-slate-200 ml-4">
              {progress.length > 0 ? (
                progress.map((log) => (
                  <div key={log.id} className="relative pl-8">
                    <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-sky-400 ring-4 ring-white shadow-sm" />
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-bold text-slate-700">
                        {formatDate(log.updated_on || log.created_at)}
                      </h4>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-sky-600">{log.physical_progress_percent}% Completed</span>
                        {user && user.role !== 'VIEWER' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => setProgressToEdit(log)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit Log"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setProgressToDelete(log)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Log"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                      <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${log.physical_progress_percent}%` }} />
                    </div>
                    <p className="text-slate-500 text-sm">{log.remarks}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic pl-8">No progress logged yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .label-text { @apply text-xs text-slate-400 font-bold mb-1; }
        .value-text { @apply font-medium text-slate-700; }
        .sub-text { @apply text-xs text-slate-400 mt-0.5; }
      `}</style>

      {(showProgressModal || progressToEdit) && (
        <UpdateProgressModal
          project={project}
          initialData={progressToEdit}
          currentProgress={progress?.[0]?.physical_progress_percent || 0}
          onClose={() => {
            setShowProgressModal(false);
            setProgressToEdit(null);
          }}
        />
      )}

      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onEdit={(asset) => {
            setSelectedAsset(null);
            setAssetToEdit(asset);
          }}
          onDelete={(asset) => {
            setSelectedAsset(null);
            setAssetToDelete(asset);
          }}
          canEdit={user && user.role !== 'VIEWER'}
        />
      )}

      {(showAssetModal || assetToEdit) && (
        <AddAssetModal
          projectId={project.id}
          initialData={assetToEdit}
          onClose={() => {
            setShowAssetModal(false);
            setAssetToEdit(null);
          }}
        />
      )}

      {(showPaymentModal || paymentToEdit) && (
        <AddPaymentModal
          projectId={project.id}
          initialData={paymentToEdit}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentToEdit(null);
          }}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete This Project?"
        message="This will permanently remove the project and all its linked records from the database. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmText="Yes, Delete Permanently"
        cancelText="Cancel"
      />

      <ConfirmModal
        isOpen={!!assetToDelete}
        title="Delete This Asset?"
        message="This will permanently remove this asset record. This action cannot be undone."
        onConfirm={handleDeleteAsset}
        onCancel={() => setAssetToDelete(null)}
        confirmText="Yes, Delete Asset"
        cancelText="Cancel"
      />

      <ConfirmModal
        isOpen={!!paymentToDelete}
        title="Delete Payment Record?"
        message="This will permanently remove this payment entry. Financial totals will be updated. This action cannot be undone."
        onConfirm={handleDeletePayment}
        onCancel={() => setPaymentToDelete(null)}
        confirmText="Yes, Delete Payment"
        cancelText="Cancel"
      />

      <ConfirmModal
        isOpen={!!progressToDelete}
        title="Delete Progress Entry?"
        message="This will remove this site inspection record. This action cannot be undone."
        onConfirm={handleDeleteProgress}
        onCancel={() => setProgressToDelete(null)}
        confirmText="Yes, Delete Entry"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ProjectDetail;
