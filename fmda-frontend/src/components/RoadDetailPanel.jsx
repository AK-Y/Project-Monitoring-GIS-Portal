import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectAsset } from "../store/slices/assetSlice";

const RoadDetailPanel = ({ onShowSpecs }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedAssetId } = useSelector((s) => s.assets);
  // Rename 'selectedAsset' to 'asset' because the JSX below uses 'asset.length', 'asset.ward' etc.
  const asset = useSelector(s => s.assets.list.find(a => String(a.id) === String(selectedAssetId)));
  // Ensure we safeguard against projects being undefined
  const projects = useSelector(s => s.projects.byAsset || []);

  const handleShowProjectSpecs = (p) => {
    // Normalize data: map pa_ prefixed fields to generic names for the Modal
    const merged = {
      ...asset,
      ...p,
      id: asset.id, // Keep the original asset ID for reference
      asset_id: p.project_asset_id,
      start_point: p.pa_start_point || asset.start_point,
      end_point: p.pa_end_point || asset.end_point,
      length: p.pa_length || asset.length,
      // Ensure specific fields from p are used if available (they are already in ...p if not aliased)
      width_of_carriage_way: p.width_of_carriage_way || asset.width_of_carriage_way,
      width_of_central_verge: p.width_of_central_verge || asset.width_of_central_verge,
      width_of_footpath: p.width_of_footpath || asset.width_of_footpath,
      lhs_green_belt: p.lhs_green_belt || asset.lhs_green_belt,
      rhs_green_belt: p.rhs_green_belt || asset.rhs_green_belt,
      street_lights: p.street_lights || asset.street_lights,
      row_width: p.row_width || asset.row_width,
      type_of_road: p.type_of_road || asset.type_of_road,
      paved_portion_lhs: p.paved_portion_lhs || asset.paved_portion_lhs,
      paved_portion_rhs: p.paved_portion_rhs || asset.paved_portion_rhs,
      cross_section_of_road: p.cross_section_of_road || asset.cross_section_of_road,
      storm_water_drain_lhs: p.storm_water_drain_lhs || asset.storm_water_drain_lhs,
      storm_water_drain_rhs: p.storm_water_drain_rhs || asset.storm_water_drain_rhs,
    };
    onShowSpecs(merged);
  };

  // If no asset selected, don't render
  if (!selectedAssetId) return null;

  return (
    <div className="absolute top-4 right-4 bottom-4 w-80 z-[400] glass-card flex flex-col animate-fade-in shadow-2xl rounded-[2.5rem]">
      <div className="p-4 border-b border-white/40 bg-white/40 backdrop-blur-md rounded-t-[2.5rem]">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{asset?.asset_code || "Unknown Asset"}</h3>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wide mt-1">{asset?.asset_type} Infrastructure</p>
          </div>
          <button
            onClick={() => dispatch(selectAsset(null))}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-4 overflow-y-auto flex-1 space-y-6">
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="bg-white/50 p-4 rounded-xl border border-white/60 flex justify-between items-center shadow-sm">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total Length</p>
              <p className="text-xl font-bold text-slate-800">{asset.length || "0"} m</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/50 p-3 rounded-xl border border-white/60 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Start Point</p>
                <p className="text-xs font-bold text-slate-700 leading-tight">{asset.start_point || "N/A"}</p>
              </div>
              <div className="bg-white/50 p-3 rounded-xl border border-white/60 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">End Point</p>
                <p className="text-xs font-bold text-slate-700 leading-tight">{asset.end_point || "N/A"}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onShowSpecs(asset)}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-slate-200 shadow-sm"
          >
            📋 Base Asset Specs
          </button>
        </div>

        <div>
          <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
            <span>🚧</span> Projects ({projects.length})
          </h4>

          <div className="space-y-3">
            {projects.length > 0 ? (
              projects.map(p => (
                <div
                  key={p.id}
                  className="bg-white/60 hover:bg-white/90 p-4 rounded-xl border border-white/50 transition-all hover:shadow-md group"
                >
                  <div className="cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                    <p className="font-semibold text-slate-800 text-sm group-hover:text-sky-600 transition-colors">
                      {p.name_of_work}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${p.status === "ONGOING" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                        }`}>
                        {p.status}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        ₹ {parseFloat(p.budget_during_year || p.aa_amount || 0).toFixed(1)}L
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/50 flex justify-end">
                    <button
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="text-[10px] font-black text-sky-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                      <span>📊</span> VIEW FULL WORK DETAILS
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 italic text-center py-4 bg-slate-50/50 rounded-lg">
                No active projects
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadDetailPanel;
