import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchFilteredProjects } from "../store/slices/projectSlice";
import ProjectCard from "../components/ProjectCard";
import { FileText, Search, Filter, Clock } from "lucide-react";
import Pagination from "../components/Pagination";
import AssetDetailModal from "../components/AssetDetailModal";
import WorkHistoryModal from "../components/WorkHistoryModal";
import { fetchAssets } from "../store/slices/assetSlice";

const ReportsPage = () => {
    const dispatch = useDispatch();
    const filteredProjects = useSelector((s) => s.projects.filtered);
    const { list: allAssets } = useSelector((s) => s.assets);

    const [status, setStatus] = useState("");
    const [workType, setWorkType] = useState("");
    const [search, setSearch] = useState("");
    const [workCategory, setWorkCategory] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // Modal states
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [selectedProjectForHistory, setSelectedProjectForHistory] = useState(null);

    useEffect(() => {
        dispatch(fetchAssets());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchFilteredProjects({
            status,
            typeOfWork: workType,
            search
        }));
        setCurrentPage(1); // Reset to first page when search/filters change
    }, [dispatch, status, workType, search]);

    useEffect(() => {
        setCurrentPage(1);
    }, [workCategory]);

    // Filter by work category on frontend (if not already handled by backend)
    const displayedProjects = workCategory
        ? filteredProjects.filter(p => p.work_category === workCategory)
        : filteredProjects;

    return (
        <div className="animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                            <FileText size={24} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900">
                            Project Reports
                        </h1>
                    </div>
                    <p className="text-slate-500 mt-1">Card-based overview of all engineering projects</p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={16} className="text-slate-400" />
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Filters & Search</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <Search size={16} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by project name..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer font-medium text-slate-700"
                        onChange={(e) => setStatus(e.target.value)}
                        value={status}
                    >
                        <option value="">All Statuses</option>
                        <option value="ONGOING">Ongoing</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="PENDING">Pending</option>
                    </select>

                    {/* Work Type Filter */}
                    <select
                        className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer font-medium text-slate-700"
                        onChange={(e) => setWorkType(e.target.value)}
                        value={workType}
                    >
                        <option value="">All Work Types</option>
                        <option value="New Work">New Work</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Repair">Repair</option>
                    </select>

                    {/* Work Category Filter */}
                    <select
                        className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer font-medium text-slate-700"
                        onChange={(e) => setWorkCategory(e.target.value)}
                        value={workCategory}
                    >
                        <option value="">All Categories</option>
                        <option value="Road">Road</option>
                        <option value="Drain">Drain</option>
                        <option value="Sewer">Sewer</option>
                    </select>
                </div>

                {/* Results Count */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-600">
                        <span className="font-bold text-indigo-600">{displayedProjects.length}</span> project{displayedProjects.length !== 1 ? 's' : ''} found
                    </p>
                </div>
            </div>

            {/* Project Cards */}
            {displayedProjects.length > 0 ? (
                <div className="space-y-4">
                    {displayedProjects.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onAssetClick={(assetId) => {
                                const asset = allAssets.find(a =>
                                    String(a.id) === String(assetId) ||
                                    String(a.asset_code) === String(assetId)
                                );
                                if (asset) {
                                    setSelectedAsset(asset);
                                } else {
                                    // Fallback if asset not in cache
                                    console.warn("Asset not found in local state", assetId);
                                }
                            }}
                            onHistoryClick={(proj) => setSelectedProjectForHistory(proj)}
                        />
                    ))}
                    <Pagination
                        currentPage={currentPage}
                        totalItems={displayedProjects.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                    />
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-12 text-center">
                    <div className="text-6xl mb-4">📂</div>
                    <div className="text-slate-500 font-medium text-lg mb-2">No projects found</div>
                    <div className="text-slate-400 text-sm">Try adjusting your filters or search terms</div>
                </div>
            )}

            {/* Modals */}
            {selectedAsset && (
                <AssetDetailModal
                    asset={selectedAsset}
                    onClose={() => setSelectedAsset(null)}
                    canEdit={false}
                />
            )}

            {selectedProjectForHistory && (
                <WorkHistoryModal
                    projectId={selectedProjectForHistory.id}
                    projectName={selectedProjectForHistory.name_of_work}
                    onClose={() => setSelectedProjectForHistory(null)}
                />
            )}
        </div>
    );
};

export default ReportsPage;
