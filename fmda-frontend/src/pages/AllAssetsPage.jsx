import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchAssets } from "../store/slices/assetSlice";
import { fetchAllProjects } from "../store/slices/projectSlice";
import { useNavigate } from "react-router-dom";
import AssetDetailModal from "../components/AssetDetailModal";
import AddAssetModal from "../components/AddAssetModal";
import ConfirmModal from "../components/ConfirmModal";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { deleteGlobalAsset } from "../store/slices/assetSlice";
import Pagination from "../components/Pagination";

const AllAssetsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { list: assets } = useSelector((s) => s.assets);
    const { all: projects } = useSelector((s) => s.projects);
    const { user } = useSelector((s) => s.auth);

    const [filterType, setFilterType] = useState("");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // Modal State
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [assetToEdit, setAssetToEdit] = useState(null);
    const [assetToDelete, setAssetToDelete] = useState(null);

    const handleDeleteAsset = async () => {
        if (!assetToDelete) return;
        await dispatch(deleteGlobalAsset(assetToDelete.id));
        setAssetToDelete(null);
    };

    useEffect(() => {
        dispatch(fetchAssets());
        dispatch(fetchAllProjects());
    }, [dispatch]);

    useEffect(() => {
        setCurrentPage(1); // Reset to first page when search/filters change
    }, [search, filterType]);

    const handleRowClick = (asset) => {
        setSelectedAsset(asset);
        setShowModal(true);
    };

    // Derived state for filtering
    const filteredAssets = assets.map(asset => {
        const assetProjects = projects.filter(p =>
            (p.asset_ids && p.asset_ids.some(id => String(id) === String(asset.id))) ||
            (p.linked_asset_codes && p.linked_asset_codes.includes(asset.asset_code))
        );
        return { ...asset, linkedProjects: assetProjects };
    }).filter(asset => {
        const matchesType = filterType ? asset.asset_type === filterType : true;

        const searchLower = search.toLowerCase();

        // 1. Match Asset Fields
        const matchesAsset =
            (asset.asset_code?.toLowerCase().includes(searchLower)) ||
            (String(asset.id).includes(searchLower)) ||
            (asset.asset_type?.toLowerCase().includes(searchLower));

        // 2. Match Linked Projects Fields
        const matchesProject = asset.linkedProjects.some(p =>
            (String(p.id).includes(searchLower)) ||
            (p.name_of_work?.toLowerCase().includes(searchLower))
        );

        return matchesType && (matchesAsset || matchesProject);
    });

    return (
        <div className="animate-fade-in space-y-8">

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900">
                        Asset Inventory
                    </h1>
                    <p className="text-slate-500 mt-1">View and filter all infrastructure assets</p>
                </div>
                {user && (
                    <button
                        onClick={() => navigate("/create-asset")}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all active:scale-95"
                    >
                        <Plus size={18} strokeWidth={3} />
                        Add Asset
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
                            placeholder="Search by Asset ID, Code, or Project ID..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-700"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <select
                        className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer font-medium text-slate-700"
                        onChange={(e) => setFilterType(e.target.value)}
                        value={filterType}
                    >
                        <option value="">All Types</option>
                        <option value="Road">Roads</option>
                        <option value="Drain">Drains</option>
                        <option value="Sewer">Sewers</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Asset Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Linked Projects</th>

                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredAssets.length > 0 ? (
                                filteredAssets.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((asset) => (
                                    <tr
                                        key={asset.id}
                                        onClick={() => handleRowClick(asset)}
                                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-6 align-top max-w-[400px]">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-white text-xs font-bold px-3 py-1 bg-[#0ea5e9] rounded-lg shadow-sm shadow-sky-200">
                                                    Asset ID: {asset.asset_code}
                                                </span>
                                            </div>
                                            <div className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors leading-tight mb-1">
                                                {asset.type_of_road || asset.asset_type || "Asset"}
                                            </div>
                                            <div className="text-xs text-slate-500 font-medium pl-1">
                                                {asset.start_point} ➝ {asset.end_point}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 align-top">
                                            <div className="flex flex-col gap-3 items-end">
                                                {/* Type Badge */}
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border px-2 py-1 rounded border-slate-200 bg-slate-50">
                                                    {asset.asset_type} Asset
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 align-top min-w-[300px]" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    {asset.linkedProjects.length > 0 ? (
                                                        <div className="flex flex-col gap-4">
                                                            {asset.linkedProjects.map((p, idx) => (
                                                                <div
                                                                    key={p.id}
                                                                    onClick={() => navigate(`/projects/${p.id}`)}
                                                                    className="flex items-start gap-4 cursor-pointer group/project"
                                                                >
                                                                    <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center bg-sky-100 text-sky-600 rounded font-bold text-[10px] mt-0.5 group-hover/project:bg-sky-500 group-hover/project:text-white transition-colors">
                                                                        {asset.linkedProjects.length}
                                                                    </span>
                                                                    <span className="text-xs font-bold text-slate-700 leading-relaxed group-hover/project:text-sky-600 transition-colors" title={p.name_of_work}>
                                                                        {p.name_of_work}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">No Active Projects</span>
                                                    )}
                                                </div>

                                                {/* Action Buttons (Admin Only) */}
                                                {user && user.role !== 'VIEWER' && (
                                                    <div className="flex gap-3 ml-4">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setAssetToEdit(asset);
                                                            }}
                                                            className="text-sky-500 hover:text-sky-600 transition-all hover:scale-110 p-1"
                                                            title="Edit Asset"
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setAssetToDelete(asset);
                                                            }}
                                                            className="text-rose-500 hover:text-rose-600 transition-all hover:scale-110 p-1"
                                                            title="Delete Asset"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center">
                                        <div className="text-4xl mb-3">📍</div>
                                        <div className="text-slate-500 font-medium">No assets found matching your search.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredAssets.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Asset Detail Modal */}
            {showModal && selectedAsset && (
                <AssetDetailModal
                    asset={selectedAsset}
                    onClose={() => setShowModal(false)}
                    canEdit={false} // View only from this list, editing uses AddAssetModal
                />
            )}

            {/* Edit Asset Modal */}
            {assetToEdit && (
                <AddAssetModal
                    projectId={null} // Global edit
                    initialData={assetToEdit}
                    onClose={() => setAssetToEdit(null)}
                />
            )}

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!assetToDelete}
                title="Delete This Asset?"
                message="This will permanently remove this asset record from the global inventory. This action cannot be undone."
                onConfirm={handleDeleteAsset}
                onCancel={() => setAssetToDelete(null)}
                confirmText="Yes, Delete Asset"
                cancelText="Cancel"
            />
        </div>
    );
};

export default AllAssetsPage;
