import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createNewFile } from "../store/slices/fileSlice";

const CreateFile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name_of_work: "",
        type_of_work: "New Work",
        work_category: "Road",
        project_category: "Infra-I"
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await dispatch(createNewFile(formData)).unwrap();
            navigate(`/files/${res.id}`);
        } catch (err) {
            alert("Failed to create file: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
            <button
                onClick={() => navigate(-1)}
                className="text-sm text-slate-500 hover:text-sky-600 transition-colors"
            >
                ← Back
            </button>

            <div className="glass-panel p-8 rounded-[2.5rem]">
                <h1 className="text-2xl font-black text-slate-800 mb-2">Create New File</h1>
                <p className="text-sm text-slate-500 mb-8">Initiate approval flow for a new work proposal</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Name of Work</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g., Construction of Master Road Dividers..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                            value={formData.name_of_work}
                            onChange={(e) => setFormData({ ...formData, name_of_work: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Work Category</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-sky-500/20 outline-none cursor-pointer"
                                value={formData.work_category}
                                onChange={(e) => setFormData({ ...formData, work_category: e.target.value })}
                            >
                                <option value="Road">Road</option>
                                <option value="Drain">Drain</option>
                                <option value="Sewer">Sewer</option>
                                <option value="Horticulture">Horticulture</option>
                                <option value="Electrical">Electrical</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Type of Work</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-sky-500/20 outline-none cursor-pointer"
                                value={formData.type_of_work}
                                onChange={(e) => setFormData({ ...formData, type_of_work: e.target.value })}
                            >
                                <option value="New Work">New Work</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Repair">Repair</option>
                                <option value="Expansion">Expansion</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Project Category</label>
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-sky-500/20 outline-none cursor-pointer"
                            value={formData.project_category}
                            onChange={(e) => setFormData({ ...formData, project_category: e.target.value })}
                        >
                            <option value="Infra-I">Infra-I</option>
                            <option value="Infra-II">Infra-II</option>
                            <option value="Mobility">Mobility</option>
                        </select>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full py-4 bg-sky-600 text-white rounded-[1.5rem] font-bold shadow-lg shadow-sky-200 hover:bg-sky-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create File & Proceed to Estimate"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateFile;
