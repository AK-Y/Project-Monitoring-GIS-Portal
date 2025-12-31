import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats, fetchAllProjects } from "../store/slices/projectSlice";
import { BarChart3, Database, TrendingUp, Users, Map as MapIcon, ClipboardList, ChevronRight, ArrowRight, Clock, Activity, Layers, Target, Wallet } from "lucide-react";
import Pagination from "../components/Pagination";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar, Legend
} from 'recharts';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, all, loading } = useSelector((state) => state.projects || { stats: {}, all: [], loading: false });
  const [activeTab, setActiveTab] = useState("overview");
  const [recentWorkPage, setRecentWorkPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchAllProjects());
  }, [dispatch]);

  // Calculations
  const totalProjects = all.length || 0;
  const totalCost = Object.values(stats).reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
  const completedProjects = Object.values(stats).reduce((acc, curr) => acc + (Number(curr.completed) || 0), 0);
  const ongoingProjects = Object.values(stats).reduce((acc, curr) => acc + (Number(curr.ongoing) || 0), 0);

  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  const totalCostCr = totalCost / 100;

  const kpis = [
    { label: "Total Projects", value: totalProjects, sub: "In Repository", icon: Layers, color: "indigo" },
    { label: "Ongoing Work", value: ongoingProjects, sub: "In progress", icon: Activity, color: "emerald" },
    { label: "Finished Work", value: `${completionRate}%`, sub: "Work completed", icon: Target, color: "amber" },
    { label: "Total Budget", value: `₹${totalCostCr.toFixed(2)} Cr`, sub: "Total in Crores", icon: Wallet, color: "sky" }
  ];

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const divisionData = [
    { name: "Infra-I", color: "indigo", ...stats["Infra-I"] },
    { name: "Infra-II", color: "emerald", ...stats["Infra-II"] },
    { name: "Mobility", color: "amber", ...stats["Mobility"] }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const OverviewContent = () => (
    <>
      {/* KPI Grid - Fixed Alignment */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-[-1rem]">
        {kpis.map((kpi, i) => (
          <div key={i} className="group bg-white p-5 rounded-3xl border border-slate-100 shadow-sm transition-all relative overflow-hidden flex items-center hover:border-indigo-100">
            <div className="relative z-10 flex items-center gap-4 w-full">
              <div className={`w-12 h-12 shrink-0 rounded-2xl bg-${kpi.color}-50 text-${kpi.color}-600 flex items-center justify-center border border-${kpi.color}-100/20 group-hover:scale-110 transition-transform`}>
                <kpi.icon size={22} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1.5">{kpi.label}</p>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-slate-900 tracking-tighter leading-tight">{kpi.value}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate opacity-80 mt-0.5">{kpi.sub}</span>
                </div>
              </div>
            </div>
            <div className={`absolute -right-2 -bottom-2 w-20 h-20 bg-${kpi.color}-50/30 rounded-full blur-2xl group-hover:bg-${kpi.color}-50/50 transition-colors dark:hidden`} />
          </div>
        ))}
      </div>

      {/* Section Header */}
      <div className="px-2">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Work by Department</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Current status of projects across different infrastructure areas.</p>
      </div>

      {/* Division Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-[-1rem]">
        {divisionData.map((div, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm transition-all group hover:shadow-2xl hover:shadow-slate-200/50 hover:border-indigo-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <span className={`text-xl font-black uppercase tracking-[0.25em] text-${div.color}-600`}>{div.name}</span>
              <div className={`w-12 h-12 rounded-2xl bg-${div.color}-500/10 text-${div.color}-600 flex items-center justify-center shadow-sm`}>
                <TrendingUp size={28} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Money Spent</p>
                  <p className="text-2xl font-black text-slate-900">₹{Number(div.cost || 0).toLocaleString()}L</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Progress</p>
                  <p className="text-lg font-black text-indigo-600">{div.total > 0 ? Math.round((div.completed / div.total) * 100) : 0}%</p>
                </div>
              </div>

              <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                <div
                  className={`h-full bg-gradient-to-r from-${div.color}-400 to-${div.color}-600 transition-all duration-1000 shadow-sm`}
                  style={{ width: `${div.total > 0 ? (div.completed / div.total) * 100 : 0}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 text-center hover:bg-white transition-colors">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">In Progress</p>
                  <p className="text-xl font-black text-slate-800">{div.ongoing || 0}</p>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 text-center hover:bg-white transition-colors">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Completed</p>
                  <p className="text-xl font-black text-slate-800">{div.completed || 0}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recently Added Table */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <ClipboardList className="text-indigo-600" />
              Recently Added Work
            </h3>
            <button
              onClick={() => navigate("/projects")}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              See All Projects <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {all.slice((recentWorkPage - 1) * pageSize, recentWorkPage * pageSize).map((proj, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-[2rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 italic font-black text-sm">
                    {proj.id}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 truncate max-w-[200px] md:max-w-md">{proj.name_of_work}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{proj.project_category}</p>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{proj.status || 'Active'}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/projects/${proj.id}`)}
                  className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-600 transition-all shadow-sm"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={recentWorkPage}
            totalItems={all.length}
            pageSize={pageSize}
            onPageChange={setRecentWorkPage}
          />
        </div>

        {/* Info Column */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">Last Updated</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Management Hub</p>
              </div>
            </div>

            <div className="space-y-6">
              {all.slice(0, 3).map((proj, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300 group-hover:bg-indigo-500 transition-colors" />
                    {i !== 2 && <div className="w-[1px] flex-1 bg-slate-100 my-2" />}
                  </div>
                  <div className="pb-2 flex-1 min-w-0">
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight leading-none mb-1.5 truncate">
                      {proj.name_of_work}
                    </p>
                    <p className="text-[9px] font-black text-slate-400 uppercase">
                      Added on: {formatDate(proj.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-100 flex-1 flex flex-col justify-center">
            <BarChart3 className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" />
            <div className="relative z-10 text-center">
              <h4 className="text-xs font-black uppercase tracking-widest mb-2 opacity-80 font-mono">Central Database</h4>
              <p className="text-4xl font-black tracking-tighter mb-4">ONLINE</p>
              <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-[.25em]">FMDA Management</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const statusChartData = [
    { name: 'Completed', value: completedProjects, color: '#10b981' }, // Emerald
    { name: 'Ongoing', value: ongoingProjects, color: '#6366f1' },    // Indigo
    { name: 'Pending', value: Math.max(0, totalProjects - completedProjects - ongoingProjects), color: '#f59e0b' } // Amber
  ].filter(d => d.value > 0);

  const categoryChartData = [
    { name: 'Roads', value: all.filter(p => p.work_category?.toLowerCase().includes('road')).length, color: '#6366f1' },    // Indigo
    { name: 'Drainage', value: all.filter(p => p.work_category?.toLowerCase().includes('drain')).length, color: '#0ea5e9' }, // Sky
    { name: 'Sewerage', value: all.filter(p => p.work_category?.toLowerCase().includes('sewer')).length, color: '#10b981' }, // Emerald
    {
      name: 'Others', value: all.filter(p => {
        const cat = p.work_category?.toLowerCase() || '';
        return !cat.includes('road') && !cat.includes('drain') && !cat.includes('sewer');
      }).length, color: '#f43f5e'
    } // Rose for better visibility
  ];

  const deptChartData = divisionData.map(div => ({
    name: div.name,
    budget: Number(div.cost || 0),
    total: div.total || 0,
    color: div.color === 'indigo' ? '#6366f1' : div.color === 'emerald' ? '#10b981' : '#f59e0b'
  }));

  const StatsContent = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Top row: Status Pie and Category Radial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden h-[450px]">
          <h3 className="text-xl font-black text-slate-800 tracking-tight mb-4">Project Status Distribution</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={statusChartData}
                innerRadius={80}
                outerRadius={130}
                paddingAngle={8}
                dataKey="value"
                animationBegin={0}
                animationDuration={1500}
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  borderRadius: '1.5rem',
                  border: 'none',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  fontWeight: 'bold',
                  backgroundColor: '#ffffff',
                  color: '#1e293b'
                }}
                itemStyle={{ color: '#1e293b' }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden h-[450px]">
          <h3 className="text-xl font-black text-slate-800 tracking-tight mb-4 relative z-10">Asset Categories Composition</h3>
          <div className="flex flex-col h-full">
            <div className="flex-1 relative">
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={1500}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  {/* Tooltip removed to prevent overlap with center label */}
                </PieChart>
              </ResponsiveContainer>

              {/* Center Label - Perfectly Centered */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
                <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{totalProjects}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Assets</span>
              </div>
            </div>

            {/* Custom Premium Legend to show all categories including zero-values */}
            <div className="grid grid-cols-2 gap-4 mt-[-2rem] pb-4">
              {categoryChartData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-50 transition-all hover:bg-white hover:border-slate-100 shadow-sm">
                  <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.name}</p>
                    <p className={`text-sm font-black tracking-tight ${item.value > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
                      {item.value} <span className="text-[10px] font-bold text-slate-300 ml-1">WORK{item.value !== 1 ? 'S' : ''}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Middle row: Department Budget Analysis */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Departmental Budget Allocation</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Financial Analysis across Divisions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-200"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Budget</span>
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="barGradientIndigo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="barGradientEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="barGradientAmber" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
                  <stop offset="100%" stopColor="#d97706" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 900 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                tickFormatter={(value) => `₹${value}L`}
              />
              <RechartsTooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)', radius: 20 }}
                contentStyle={{
                  borderRadius: '1.5rem',
                  border: 'none',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  fontWeight: '900',
                  backgroundColor: '#1e293b',
                  color: '#fff',
                  padding: '12px 20px'
                }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
              />
              <Bar dataKey="budget" radius={[20, 20, 0, 0]} barSize={80}>
                {deptChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.color === '#6366f1' ? 'url(#barGradientIndigo)' :
                        entry.color === '#10b981' ? 'url(#barGradientEmerald)' :
                          'url(#barGradientAmber)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Numerical Stats Summary Row - Fixed Alignment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {divisionData.map((div, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all text-center group">
            <div className={`w-12 h-12 rounded-2xl bg-${div.color}-50 text-${div.color}-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
              <Activity size={24} />
            </div>
            <p className={`text-[10px] font-black text-${div.color}-600 uppercase tracking-[0.25em] mb-2`}>{div.name}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{div.total || 0}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live Asset Records</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mx-1">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-indigo-500'}`} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {loading ? "Updating..." : "FMDA Records Connected"}
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
            Main <span className="text-indigo-600">Dashboard</span>
          </h1>
          <p className="text-sm font-medium text-slate-500">Manage and track all city infrastructure projects in one place.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white/50 border border-slate-100 p-1 rounded-2xl shadow-sm">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "overview" ? "bg-white shadow-sm text-indigo-600 border border-indigo-100" : "text-slate-400 hover:text-slate-600"
                }`}>Overview</button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "analytics" ? "bg-white shadow-sm text-indigo-600 border border-indigo-100" : "text-slate-400 hover:text-slate-600"
                }`}>Stats</button>
          </div>
        </div>
      </div>

      {activeTab === "overview" ? <OverviewContent /> : <StatsContent />}
    </div>
  );
};

export default Dashboard;
