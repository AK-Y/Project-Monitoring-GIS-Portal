import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFileDetail, forwardFile, approveFile, returnFile, updateEstimate, updateFileMetadata, deleteFile } from "../store/slices/fileSlice";
import { Hammer, IndianRupee, Map as MapIcon, Send, RotateCcw, CheckCircle2, Plus, Trash2, ArrowLeft, Edit } from "lucide-react";
import MapView from "../components/MapView";

const FileDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { current: data, loading } = useSelector((s) => s.files);
    const { user } = useSelector((s) => s.auth);

    const [estimateItems, setEstimateItems] = useState([]);
    const [isEditingEstimate, setIsEditingEstimate] = useState(false);
    const [isEditingMetadata, setIsEditingMetadata] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [forwardData, setForwardData] = useState({ to_role: "", to_user_id: "" });
    const [metadata, setMetadata] = useState({
        name_of_work: "",
        type_of_work: "",
        work_category: "",
        project_category: ""
    });

    useEffect(() => {
        dispatch(fetchFileDetail(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (data?.estimate?.items) {
            setEstimateItems(data.estimate.items);
        } else {
            setEstimateItems([]);
        }
    }, [data]);

    useEffect(() => {
        if (data?.file) {
            setMetadata({
                name_of_work: data.file.name_of_work,
                type_of_work: data.file.type_of_work,
                work_category: data.file.work_category,
                project_category: data.file.project_category
            });
        }
    }, [data]);

    if (loading || !data) return <div className="p-10 text-center">Loading File Details...</div>;

    const { file, estimate, assets, timeline } = data;

    const canAction = file.current_holder_id === user?.id || (file.current_holder_role === user?.role && !file.current_holder_id);
    const isJE = user?.role === 'JE';
    const isCEO = user?.role === 'CEO' || user?.role === 'ADMIN';

    // Estimate Logic
    const handleAddItem = () => {
        setEstimateItems([...estimateItems, { description: "", quantity: 0, unit: "Nos", rate: 0, amount: 0 }]);
    };

    const handleRemoveItem = (idx) => {
        setEstimateItems(estimateItems.filter((_, i) => i !== idx));
    };

    const handleUpdateItem = (idx, field, val) => {
        const newItems = [...estimateItems];
        newItems[idx][field] = val;
        if (field === 'quantity' || field === 'rate') {
            newItems[idx].amount = (parseFloat(newItems[idx].quantity) || 0) * (parseFloat(newItems[idx].rate) || 0);
        }
        setEstimateItems(newItems);
    };

    const saveEstimate = () => {
        dispatch(updateEstimate({ id, items: estimateItems }));
        setIsEditingEstimate(false);
    };

    // Workflow Logic
    const handleForward = () => {
        if (!forwardData.to_role) return alert("Please select a role to forward to");
        if (file.estimated_amount <= 0) return alert("Financial estimate is blank. Please save an estimate first.");
        if (assets.length === 0) return alert("No proposed assets found. Please mark assets on the map.");

        dispatch(forwardFile({ id, data: { ...forwardData, remarks } }));
        setRemarks("");
    };

    const handleApprove = () => {
        if (file.estimated_amount <= 0) return alert("Cannot approve a file with zero estimate.");
        if (assets.length === 0) return alert("Cannot approve a file without mapped assets.");

        if (window.confirm("Are you sure you want to approve this file and create an Active Work?")) {
            dispatch(approveFile({ id, data: { remarks } }));
            setRemarks("");
        }
    };

    const handleReturn = () => {
        dispatch(returnFile({ id, data: { to_role: 'JE', remarks } })); // Return to JE by default
        setRemarks("");
    };

    const handleDelete = () => {
        if (window.confirm("CRITICAL: Are you sure you want to PERMANENTLY DELETE this file and all its records?")) {
            dispatch(deleteFile(id)).then(() => navigate('/files'));
        }
    };

    const handleUpdateMetadata = () => {
        dispatch(updateFileMetadata({ id, data: metadata }));
        setIsEditingMetadata(false);
    };

    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="animate-fade-in max-w-6xl mx-auto space-y-6 pb-20">
            {/* TOP NAVIGATION & ADMIN ACTIONS */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => navigate('/files')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs transition-all group"
                >
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-slate-50 shadow-sm">
                        <ArrowLeft size={14} />
                    </div>
                    Back to File list
                </button>

                {isAdmin && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditingMetadata(!isEditingMetadata)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-[10px] uppercase tracking-wider transition-all shadow-sm ${isEditingMetadata ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Edit size={14} /> {isEditingMetadata ? 'Cancel Edit' : 'Edit File'}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-rose-100 transition-all shadow-sm"
                        >
                            <Trash2 size={14} /> Delete File
                        </button>
                    </div>
                )}
            </div>

            {/* HEADER */}
            <div className="flex justify-between items-start bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex-1">
                    {isEditingMetadata ? (
                        <div className="grid grid-cols-2 gap-4 max-w-2xl">
                            <div className="col-span-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Name of Work</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    value={metadata.name_of_work}
                                    onChange={(e) => setMetadata({ ...metadata, name_of_work: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Work Type</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    value={metadata.type_of_work}
                                    onChange={(e) => setMetadata({ ...metadata, type_of_work: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Category</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    value={metadata.project_category}
                                    onChange={(e) => setMetadata({ ...metadata, project_category: e.target.value })}
                                >
                                    <option value="Infra-I">Infra-I</option>
                                    <option value="Infra-II">Infra-II</option>
                                    <option value="Mobility">Mobility</option>
                                </select>
                            </div>
                            <div className="col-span-2 flex justify-end">
                                <button
                                    onClick={handleUpdateMetadata}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{file.project_category}</span>
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${file.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                    file.status === 'RETURNED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {file.status}
                                </span>
                            </div>
                            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{file.name_of_work}</h1>
                            <p className="text-sm text-slate-500 mt-1">
                                Current Holder: <span className="font-bold text-indigo-600">{file.current_holder_role || 'Approved'}</span>
                            </p>
                        </>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Amount</p>
                    <div className="flex flex-col items-end">
                        <p className="text-2xl font-black text-slate-900">₹ {Number(file.estimated_amount).toLocaleString()} L</p>
                        {Number(file.estimated_amount) <= 0 && (
                            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-1 animate-pulse">
                                [ ! ] Estimate Blank
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: Estimate & Workflow */}
                <div className="lg:col-span-2 space-y-6">
                    {/* ESTIMATE TABLE */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 text-sm">
                                <IndianRupee size={16} /> Financial Estimate
                            </h3>
                            {isJE && canAction && !isEditingEstimate && (
                                <button
                                    onClick={() => setIsEditingEstimate(true)}
                                    className="text-xs font-bold text-sky-600 hover:text-sky-700"
                                >
                                    Edit Estimate
                                </button>
                            )}
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Rate (in Lakh)</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                        {isEditingEstimate && <th className="px-4 py-3"></th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {estimateItems.map((item, idx) => (
                                        <tr key={idx} className="group">
                                            <td className="px-4 py-3">
                                                {isEditingEstimate ? (
                                                    <input
                                                        type="text"
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-sky-500/20"
                                                        value={item.description}
                                                        onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                                                    />
                                                ) : (
                                                    <div className="text-xs text-slate-700 font-medium">{item.description}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {isEditingEstimate ? (
                                                    <input
                                                        type="text"
                                                        className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center focus:ring-2 focus:ring-sky-500/20"
                                                        value={item.quantity}
                                                        onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                                                    />
                                                ) : (
                                                    <div className="text-xs font-bold text-slate-600">{item.quantity} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span></div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {isEditingEstimate ? (
                                                    <input
                                                        type="text"
                                                        className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center focus:ring-2 focus:ring-sky-500/20"
                                                        value={item.rate}
                                                        onChange={(e) => handleUpdateItem(idx, 'rate', e.target.value)}
                                                    />
                                                ) : (
                                                    <div className="text-xs font-bold text-slate-600">₹{item.rate}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="text-xs font-black text-slate-900">₹ {Number(item.amount).toLocaleString()}</div>
                                            </td>
                                            {isEditingEstimate && (
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => handleRemoveItem(idx)} className="text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {isEditingEstimate && (
                                        <tr>
                                            <td colSpan="5" className="p-4">
                                                <button
                                                    onClick={handleAddItem}
                                                    className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-sky-300 hover:text-sky-600 transition-all"
                                                >
                                                    + Add New Line Item
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-900 text-white">
                                        <td colSpan="3" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest opacity-70">Total Estimated Sum</td>
                                        <td className="px-4 py-3 text-right font-black text-xs">₹ {estimateItems.reduce((acc, cur) => acc + (cur.amount || 0), 0).toLocaleString()}</td>
                                        {isEditingEstimate && <td />}
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        {isEditingEstimate && (
                            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                                <button
                                    onClick={() => setIsEditingEstimate(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveEstimate}
                                    className="px-6 py-2 bg-sky-600 text-white text-xs font-black rounded-xl shadow-lg hover:bg-sky-700 transition-all"
                                >
                                    Save Estimate
                                </button>
                            </div>
                        )}
                    </div>

                    {/* MOVEMENT LOG */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-6">
                        <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 text-sm mb-6">
                            <RotateCcw size={16} /> File Movement History
                        </h3>
                        <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                            {timeline.map((log, i) => (
                                <div key={i} className="relative pl-10">
                                    <div className={`absolute left-0 top-1 w-6.5 h-6.5 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${log.action === 'APPROVE' ? 'bg-emerald-500' :
                                        log.action === 'RETURN' ? 'bg-rose-500' : 'bg-sky-500'
                                        }`}>
                                        {log.action === 'APPROVE' ? <CheckCircle2 size={12} className="text-white" /> : <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                    </div>
                                    <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
                                                {log.action} <span className="text-slate-400 mx-2">→</span> {log.to_role || 'Approved'}
                                            </div>
                                            <div className="text-[9px] font-bold text-slate-400">{new Date(log.created_at).toLocaleString()}</div>
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-bold mb-2">By {log.from_user} ({log.from_role})</div>
                                        {log.remarks && (
                                            <div className="text-xs text-slate-600 italic mt-2 border-l-2 border-slate-200 pl-3 py-1">
                                                "{log.remarks}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Status & Map Actions */}
                <div className="space-y-6">
                    {/* ACTION CARD */}
                    {canAction && file.status !== 'APPROVED' && (
                        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-900/30 border border-indigo-500/10 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <h3 className="font-black uppercase tracking-widest text-[10px] text-indigo-300 mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                                Action Required
                            </h3>

                            <textarea
                                className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-xs placeholder:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all mb-4"
                                placeholder="Add your remarks here..."
                                rows={3}
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />

                            <div className="space-y-3">
                                {!isCEO && (
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-indigo-300 uppercase ml-2">Forward To</label>
                                        <select
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-white/30 transition-all text-white appearance-none cursor-pointer mb-4"
                                            value={forwardData.to_role}
                                            onChange={(e) => setForwardData({ ...forwardData, to_role: e.target.value })}
                                        >
                                            <option value="" className="text-slate-900">Select Next Role</option>
                                            <option value="SDE" className="text-slate-900">SDE</option>
                                            <option value="XEN" className="text-slate-900">XEN</option>
                                            <option value="CE" className="text-slate-900">CE</option>
                                            <option value="CEO" className="text-slate-900">CEO</option>
                                        </select>
                                        <button
                                            onClick={handleForward}
                                            className="w-full py-3.5 bg-white text-indigo-600 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.15em] hover:bg-indigo-50 transition-all active:scale-95 shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-2"
                                        >
                                            <Send size={14} /> Forward for Review
                                        </button>
                                    </div>
                                )}

                                {isCEO && (
                                    <button
                                        onClick={handleApprove}
                                        className="w-full py-3.5 bg-emerald-400 text-emerald-950 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.15em] hover:bg-emerald-300 transition-all active:scale-95 shadow-xl shadow-emerald-950/20 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={14} /> Final Approve & Create Work
                                    </button>
                                )}

                                <button
                                    onClick={handleReturn}
                                    className="w-full py-3 bg-rose-500/30 text-rose-100 rounded-[1.25rem] font-bold text-[10px] uppercase tracking-[0.15em] hover:bg-rose-500/50 transition-all active:scale-95 border border-rose-500/20 flex items-center justify-center gap-2"
                                >
                                    <RotateCcw size={14} /> Return to JE
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ASSET MAP MINI */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden group">
                        <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                <MapIcon size={14} className="text-sky-500" /> Proposed Geometry
                            </h4>
                            <div className="flex items-center gap-2">
                                {assets.length === 0 && (
                                    <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full animate-pulse">Missing Assets</span>
                                )}
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{assets.length} Links</span>
                            </div>
                        </div>
                        <div className="h-[400px] relative">
                            <MapView
                                height="100%"
                                interactive={false}
                                showLegend={true}
                                compact={true}
                            />
                            {isJE && canAction && (
                                <button
                                    className="absolute bottom-4 right-4 bg-sky-600 text-white p-3 rounded-2xl shadow-xl hover:scale-110 active:scale-90 transition-all z-[1000]"
                                    title="Edit Proposed Assets on Map"
                                >
                                    <Plus size={20} />
                                </button>
                            )}
                        </div>
                        <div className="p-4 bg-slate-50/50">
                            <div className="space-y-2">
                                {assets.map((a, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200/50 shadow-sm">
                                        <div className="w-1.5 h-8 bg-sky-400 rounded-full" />
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-bold text-slate-700 truncate">{a.asset_id || "New Asset Link"}</p>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Proposed Spatial Data Linked</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileDetail;
