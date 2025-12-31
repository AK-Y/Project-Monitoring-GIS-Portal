import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { fetchAssets } from "../store/slices/assetSlice";
import ConfirmModal from "../components/ConfirmModal";
import { ArrowLeft } from "lucide-react";

const AddAssetPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [wasValidated, setWasValidated] = useState(false);

    // Form State matching AddAssetModal.jsx
    const [formData, setFormData] = useState({
        asset_id: "",
        type_of_road: "Bituminous",
        start_point: "",
        start_latitude: "",
        start_longitude: "",
        end_point: "",
        end_latitude: "",
        end_longitude: "",
        length: "",
        width_of_carriage_way: "",
        width_of_central_verge: "",
        width_of_footpath: "",
        lhs_green_belt: "",
        rhs_green_belt: "",
        street_lights: "",
        row_width: "",
        paved_portion_lhs: "",
        paved_portion_rhs: "",
        cross_section_of_road: "",
        storm_water_drain_lhs: "",
        storm_water_drain_rhs: "",
        road_taken_over_from: "",
        year_of_taken_over: "",
        history_of_road: "",
        vertices: []
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addVertex = () => {
        setFormData({
            ...formData,
            vertices: [...formData.vertices, ["", ""]]
        });
    };

    const updateVertex = (index, subIndex, value) => {
        const newVertices = [...formData.vertices];
        newVertices[index][subIndex] = value;
        setFormData({ ...formData, vertices: newVertices });
    };

    const removeVertex = (index) => {
        const newVertices = formData.vertices.filter((_, i) => i !== index);
        setFormData({ ...formData, vertices: newVertices });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setWasValidated(true);
        if (e.currentTarget.checkValidity()) {
            setShowConfirm(true);
        }
    };

    const handleFinalSubmit = async () => {
        setShowConfirm(false);
        setLoading(true);
        try {
            // Mapping to backend schema if needed, or sending as is
            // Assuming backend accepts this structure or needs simple mapping
            // Ideally should match what 'addAssetToProject' does but for a standalone asset
            // Backend endpoint: POST /api/assets

            // Construct payload compatible with backend assetsController
            const payload = {
                asset_code: formData.asset_id, // Map ID to Code
                asset_type: formData.type_of_road || "Road",
                length: formData.length,
                width: formData.row_width,
                start_point: formData.start_point,
                end_point: formData.end_point,
                // Passing all other fields as 'properties' or extra fields if backend supports
                // For now, mapping core fields. 
                // Note: The user wants the UI. The backend mapping might need adjustment if these fields aren't in 'assets' table.
                // Assuming 'assets' table has JSONB 'properties' or similar, OR we map what we can.
                // Re-using the logic from the modal:
                ...formData
            };

            await axios.post(`${import.meta.env.VITE_API_URL}/api/assets`, payload);
            dispatch(fetchAssets());
            navigate("/assets");
        } catch (error) {
            console.error("Error creating asset:", error);
            alert("Failed to create asset. Check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in max-w-5xl mx-auto space-y-6 pb-20">
            <div>
                <button
                    onClick={() => navigate("/assets")}
                    className="mb-4 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm"
                >
                    <ArrowLeft size={16} />
                    Back to Assets
                </button>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-emerald-900">
                    CREATE NEW ASSET
                </h1>
                <p className="text-slate-500 mt-1">Register a new physical asset in the GIS system.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <form
                    onSubmit={handleSubmit}
                    className={`p-8 space-y-8 ${wasValidated ? 'was-validated' : ''}`}
                    noValidate
                >

                    {/* Section 1: Location Details */}
                    <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">📍</span>
                            Location Details
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <Label>Asset ID</Label>
                                <input
                                    type="text"
                                    name="asset_id"
                                    className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2"
                                    placeholder="e.g. RD-001 or ASSET123"
                                    value={formData.asset_id}
                                    onChange={handleChange}
                                    required
                                />
                                <p className="text-xs text-slate-400 mt-1 ml-1">Leave empty to auto-generate new ID</p>
                            </div>

                            <div className="md:col-span-2">
                                <Label>History / Description</Label>
                                <textarea
                                    name="history_of_road"
                                    rows="2"
                                    className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2"
                                    placeholder="Brief description of road segment..."
                                    value={formData.history_of_road}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Label>Start Point</Label>
                                    <input type="text" name="start_point" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="e.g. Sector 10" required value={formData.start_point} onChange={handleChange} />
                                </div>
                                <div>
                                    <Label>End Point</Label>
                                    <input type="text" name="end_point" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="e.g. Sector 15" required value={formData.end_point} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Label>Start Coordinates (Lat, Long)</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" name="start_latitude" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="Latitude" value={formData.start_latitude} onChange={handleChange} required />
                                        <input type="text" name="start_longitude" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="Longitude" value={formData.start_longitude} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div>
                                    <Label>End Coordinates (Lat, Long)</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" name="end_latitude" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="Latitude" value={formData.end_latitude} onChange={handleChange} required />
                                        <input type="text" name="end_longitude" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="Longitude" value={formData.end_longitude} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>

                            {/* Curve Waypoints Logic */}
                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-700">Detailed Curve Points (Optional)</h4>
                                        <p className="text-[10px] text-slate-400">Add extra points to show road curves and zig-zags on the map.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addVertex}
                                        className="text-[10px] px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-black uppercase tracking-wider hover:bg-blue-100 transition-colors border border-blue-100"
                                    >
                                        + Add Curve Point
                                    </button>
                                </div>

                                {formData.vertices.length > 0 && (
                                    <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200">
                                        {formData.vertices.map((v, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-slate-300 w-4">{idx + 1}.</span>
                                                <div className="grid grid-cols-2 gap-2 flex-1">
                                                    <input
                                                        type="text"
                                                        className="input-field text-[11px] w-full outline-none border border-slate-200 rounded-lg px-2 py-1"
                                                        placeholder="Longitude"
                                                        value={v[0]}
                                                        onChange={(e) => updateVertex(idx, 0, e.target.value)}
                                                        required
                                                    />
                                                    <input
                                                        type="text"
                                                        className="input-field text-[11px] w-full outline-none border border-slate-200 rounded-lg px-2 py-1"
                                                        placeholder="Latitude"
                                                        value={v[1]}
                                                        onChange={(e) => updateVertex(idx, 1, e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeVertex(idx)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Road Dimensions */}
                    <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">📏</span>
                            Road Dimensions
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <Label>Length (m)</Label>
                                <input type="text" name="length" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="e.g. 1.2" value={formData.length} onChange={handleChange} required />
                            </div>

                            <div>
                                <Label>Carriage Way Width (m)</Label>
                                <input type="text" name="width_of_carriage_way" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="e.g. 7" value={formData.width_of_carriage_way} onChange={handleChange} required />
                            </div>

                            <div>
                                <Label>Central Verge Width (m)</Label>
                                <input type="text" name="width_of_central_verge" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="e.g. 1.5" value={formData.width_of_central_verge} onChange={handleChange} required />
                            </div>

                            <div>
                                <Label>Footpath Width (m)</Label>
                                <input type="text" name="width_of_footpath" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="e.g. 2" value={formData.width_of_footpath} onChange={handleChange} required />
                            </div>

                            <div>
                                <Label>ROW Width (m)</Label>
                                <input type="text" name="row_width" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="e.g. 30" value={formData.row_width} onChange={handleChange} required />
                            </div>

                            <div>
                                <Label>Cross Section</Label>
                                <input type="text" name="cross_section_of_road" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="e.g. 2-lane" value={formData.cross_section_of_road} onChange={handleChange} required />
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Road Specifications */}
                    <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm">🛣️</span>
                            Road Specifications
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <Label>Road Type</Label>
                                <div className="relative">
                                    <select name="type_of_road" className="input-field text-sm appearance-none cursor-pointer w-full outline-none border border-slate-200 rounded-lg p-2" value={formData.type_of_road} onChange={handleChange} required>
                                        <option value="">Select Road Type</option>
                                        <option value="Bituminous">Bituminous</option>
                                        <option value="Concrete">Concrete</option>
                                        <option value="WBM">WBM</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <ChevronDownIcon />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label>LHS Green Belt (m)</Label>
                                <input type="text" name="lhs_green_belt" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="e.g. 3" value={formData.lhs_green_belt} onChange={handleChange} required />
                            </div>

                            <div>
                                <Label>RHS Green Belt (m)</Label>
                                <input type="text" name="rhs_green_belt" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="e.g. 3" value={formData.rhs_green_belt} onChange={handleChange} required />
                            </div>

                            <div>
                                <Label>Paved Portion (LHS) (m)</Label>
                                <input type="text" name="paved_portion_lhs" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="e.g. 1.5" value={formData.paved_portion_lhs} onChange={handleChange} required />
                            </div>

                            <div>
                                <Label>Paved Portion (RHS) (m)</Label>
                                <input type="text" name="paved_portion_rhs" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="e.g. 1.5" value={formData.paved_portion_rhs} onChange={handleChange} required />
                            </div>

                            <div>
                                <Label>Street Lights</Label>
                                <input type="text" name="street_lights" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="e.g. Yes / 50 units" value={formData.street_lights} onChange={handleChange} required />
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Drainage */}
                    <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center text-sm">💧</span>
                            Drainage & Infrastructure
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <Label>Storm Water Drain (LHS)</Label>
                                <input type="text" name="storm_water_drain_lhs" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="e.g. Covered / Open" value={formData.storm_water_drain_lhs} onChange={handleChange} required />
                            </div>

                            <div>
                                <Label>Storm Water Drain (RHS)</Label>
                                <input type="text" name="storm_water_drain_rhs" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="e.g. Covered / Open" value={formData.storm_water_drain_rhs} onChange={handleChange} required />
                            </div>
                        </div>
                    </section>

                    {/* Section 5: Taken Over Details */}
                    <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm">🔄</span>
                            Taken Over Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <Label>Taken Over From</Label>
                                <input type="text" name="road_taken_over_from" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="e.g. HSVP" value={formData.road_taken_over_from} onChange={handleChange} required />
                            </div>

                            <div>
                                <Label>Year of Taken Over</Label>
                                <input type="text" name="year_of_taken_over" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-2" placeholder="2024" value={formData.year_of_taken_over} onChange={handleChange} required />
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => navigate("/assets")}
                            className="px-6 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 font-bold text-sm transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95 flex items-center gap-2 ${loading ? "opacity-75 cursor-not-allowed" : ""}`}
                        >
                            {loading ? "Saving..." : "Create Asset"}
                        </button>
                    </div>
                </form>
            </div>

            <ConfirmModal
                isOpen={showConfirm}
                title="Add This Asset?"
                message="Verify road dimensions and coordinates before saving. Accuracy is critical for GIS mapping. Are you sure you want to add this asset details?"
                onConfirm={handleFinalSubmit}
                onCancel={() => setShowConfirm(false)}
                confirmText="Yes, Add Asset"
            />

            <style>{`
                .was-validated .input-field:invalid {
                    border-color: #ef4444 !important;
                    background-color: rgba(239, 68, 68, 0.05) !important;
                }
            `}</style>
        </div>
    );
};

const Label = ({ children }) => (
    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
        {children}
    </label>
);

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

export default AddAssetPage;
