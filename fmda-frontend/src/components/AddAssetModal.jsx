import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addAssetToProject, updateProjectAsset } from "../store/slices/projectSlice";
import { updateGlobalAsset } from "../store/slices/assetSlice";
import ConfirmModal from "./ConfirmModal";

const AddAssetModal = ({ projectId, onClose, initialData = null }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [wasValidated, setWasValidated] = useState(false);
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
    vertices: [] // Array of [lng, lat] pairs
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        asset_id: initialData.asset_id || "",
        type_of_road: initialData.type_of_road || "Bituminous",
        start_point: initialData.start_point || "",
        start_latitude: initialData.start_latitude || "",
        start_longitude: initialData.start_longitude || "",
        end_point: initialData.end_point || "",
        end_latitude: initialData.end_latitude || "",
        end_longitude: initialData.end_longitude || "",
        length: initialData.length || "",
        width_of_carriage_way: initialData.width_of_carriage_way || "",
        width_of_central_verge: initialData.width_of_central_verge || "",
        width_of_footpath: initialData.width_of_footpath || "",
        lhs_green_belt: initialData.lhs_green_belt || "",
        rhs_green_belt: initialData.rhs_green_belt || "",
        street_lights: initialData.street_lights || "",
        row_width: initialData.row_width || "",
        paved_portion_lhs: initialData.paved_portion_lhs || "",
        paved_portion_rhs: initialData.paved_portion_rhs || "",
        cross_section_of_road: initialData.cross_section_of_road || "",
        storm_water_drain_lhs: initialData.storm_water_drain_lhs || "",
        storm_water_drain_rhs: initialData.storm_water_drain_rhs || "",
        road_taken_over_from: initialData.road_taken_over_from || "",
        year_of_taken_over: initialData.year_of_taken_over || "",
        history_of_road: initialData.history_of_road || "",
        vertices: initialData.vertices || []
      });
    }
  }, [initialData]);

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
      if (initialData) {
        if (projectId) {
          await dispatch(updateProjectAsset({ projectId, assetId: initialData.id, data: formData })).unwrap();
        } else {
          await dispatch(updateGlobalAsset({ assetId: initialData.id, data: formData })).unwrap();
        }
      } else {
        // Adding new asset - requires project context for now, or could act globally if needed
        if (projectId) {
          await dispatch(addAssetToProject({ id: projectId, data: formData })).unwrap();
        } else {
          // If we ever need to add global assets via modal without project linkage
          console.warn("Adding global asset not fully implemented in modal yet");
        }
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert(`Failed to ${initialData ? "update" : "add"} asset`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 transition-colors duration-300">
        {/* Header */}
        <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900">
              {initialData ? "Edit Asset Details" : "Add Asset Details"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {initialData ? "Update asset information" : "Add road/infrastructure asset to this project"}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full w-10 h-10 flex items-center justify-center transition-all">
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <form
            onSubmit={handleSubmit}
            className={`space-y-6 ${wasValidated ? 'was-validated' : ''}`}
            noValidate
          >

            {/* Section 1: Location Details */}
            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md">
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
                    className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1"
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
                    className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1"
                    placeholder="Brief description of road segment..."
                    value={formData.history_of_road}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label>Start Point</Label>
                    <input type="text" name="start_point" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="e.g. Sector 10" required value={formData.start_point} onChange={handleChange} />
                  </div>
                  <div>
                    <Label>End Point</Label>
                    <input type="text" name="end_point" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="e.g. Sector 15" required value={formData.end_point} onChange={handleChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label>Start Coordinates (Lat, Long)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" name="start_latitude" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="Latitude" value={formData.start_latitude} onChange={handleChange} required />
                      <input type="text" name="start_longitude" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="Longitude" value={formData.start_longitude} onChange={handleChange} required />
                    </div>
                  </div>
                  <div>
                    <Label>End Coordinates (Lat, Long)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" name="end_latitude" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="Latitude" value={formData.end_latitude} onChange={handleChange} required />
                      <input type="text" name="end_longitude" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="Longitude" value={formData.end_longitude} onChange={handleChange} required />
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
                      <p className="text-[9px] text-slate-400 font-medium italic mt-2">
                        * Note: If you add detailed points, they will be used to draw the road path instead of just the start/end markers.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Section 2: Road Dimensions */}
            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">📏</span>
                Road Dimensions
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <Label>Length (m)</Label>
                  <input type="text" name="length" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="e.g. 1.2 or (nil)" value={formData.length} onChange={handleChange} required />
                </div>

                <div>
                  <Label>Carriage Way Width (m)</Label>
                  <input type="text" name="width_of_carriage_way" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="e.g. 7 or (nil)" value={formData.width_of_carriage_way} onChange={handleChange} required />
                </div>

                <div>
                  <Label>Central Verge Width (m)</Label>
                  <input type="text" name="width_of_central_verge" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="e.g. 1.5 or (nil)" value={formData.width_of_central_verge} onChange={handleChange} required />
                </div>

                <div>
                  <Label>Footpath Width (m)</Label>
                  <input type="text" name="width_of_footpath" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="e.g. 2 or (nil)" value={formData.width_of_footpath} onChange={handleChange} required />
                </div>

                <div>
                  <Label>ROW Width (m)</Label>
                  <input type="text" name="row_width" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="e.g. 30 or (nil)" value={formData.row_width} onChange={handleChange} required />
                </div>

                <div>
                  <Label>Cross Section</Label>
                  <input type="text" name="cross_section_of_road" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="e.g. 2-lane" value={formData.cross_section_of_road} onChange={handleChange} required />
                </div>
              </div>
            </section>

            {/* Section 3: Road Specifications */}
            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm">🛣️</span>
                Road Specifications
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <Label>Road Type</Label>
                  <div className="relative">
                    <select name="type_of_road" className="input-field text-sm appearance-none cursor-pointer w-full outline-none border border-slate-200 rounded-lg p-1" value={formData.type_of_road} onChange={handleChange} required>
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
                  <input type="text" name="lhs_green_belt" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="e.g. 3 or (nil)" value={formData.lhs_green_belt} onChange={handleChange} required />
                </div>

                <div>
                  <Label>RHS Green Belt (m)</Label>
                  <input type="text" name="rhs_green_belt" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="e.g. 3 or (nil)" value={formData.rhs_green_belt} onChange={handleChange} required />
                </div>

                <div>
                  <Label>Paved Portion (LHS) (m)</Label>
                  <input type="text" name="paved_portion_lhs" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="e.g. 1.5 or (nil)" value={formData.paved_portion_lhs} onChange={handleChange} required />
                </div>

                <div>
                  <Label>Paved Portion (RHS) (m)</Label>
                  <input type="text" name="paved_portion_rhs" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="e.g. 1.5 or (nil)" value={formData.paved_portion_rhs} onChange={handleChange} required />
                </div>

                <div>
                  <Label>Street Lights</Label>
                  <input type="text" name="street_lights" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="e.g. Yes / 50 units" value={formData.street_lights} onChange={handleChange} required />
                </div>
              </div>
            </section>

            {/* Section 4: Drainage */}
            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center text-sm">💧</span>
                Drainage & Infrastructure
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Storm Water Drain (LHS)</Label>
                  <input type="text" name="storm_water_drain_lhs" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="e.g. Covered / Open" value={formData.storm_water_drain_lhs} onChange={handleChange} required />
                </div>

                <div>
                  <Label>Storm Water Drain (RHS)</Label>
                  <input type="text" name="storm_water_drain_rhs" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="e.g. Covered / Open" value={formData.storm_water_drain_rhs} onChange={handleChange} required />
                </div>
              </div>
            </section>

            {/* Section 5: Taken Over Details */}
            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm">🔄</span>
                Taken Over Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Taken Over From</Label>
                  <input type="text" name="road_taken_over_from" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="e.g. HSVP" value={formData.road_taken_over_from} onChange={handleChange} required />
                </div>

                <div>
                  <Label>Year of Taken Over</Label>
                  <input type="text" name="year_of_taken_over" className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1" placeholder="2024" value={formData.year_of_taken_over} onChange={handleChange} required />
                </div>
              </div>
            </section>

            {/* Footer Buttons - Moved inside form for validation */}
            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10 py-4 px-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (initialData ? "Updating..." : "Adding...") : (initialData ? "Update Asset" : "Add Asset Details")}
              </button>
            </div>
          </form>
        </div>

        <ConfirmModal
          isOpen={showConfirm}
          title={initialData ? "Update This Asset?" : "Add This Asset?"}
          message={initialData ? "Are you sure you want to update these asset details?" : "Verify road dimensions and coordinates before saving. Accuracy is critical for GIS mapping. Are you sure you want to add this asset details?"}
          onConfirm={handleFinalSubmit}
          onCancel={() => setShowConfirm(false)}
          confirmText={initialData ? "Yes, Update Asset" : "Yes, Add Asset"}
        />
      </div>

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

export default AddAssetModal;
