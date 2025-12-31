const AssetDetailModal = ({ asset, onClose, onEdit, onDelete, canEdit }) => {
  if (!asset) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4 md:pl-[270px] overflow-hidden">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-slate-100 transition-colors duration-300 relative m-auto overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Asset Details</h2>
            <p className="text-slate-300 text-sm mt-1">{asset.type_of_road || "Infrastructure Asset"} • Asset ID: {asset.asset_id || asset.id}</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center transition-all">
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarGutter: 'stable' }}>
          <div className="space-y-6">

            {/* Section 1: Location Details */}
            <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">📍</span>
                Location Details
              </h3>

              {asset.history_of_road && (
                <div className="mb-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">Description</p>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed">{asset.history_of_road}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 shadow-sm transition-colors">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Start Point</p>
                  <p className="text-sm font-black text-slate-900">{asset.start_point || "N/A"}</p>
                </div>
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 shadow-sm transition-colors">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">End Point</p>
                  <p className="text-sm font-black text-slate-900">{asset.end_point || "N/A"}</p>
                </div>
              </div>

              {(asset.start_latitude || asset.end_latitude) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/20 shadow-sm transition-colors">
                    <p className="text-[10px] font-black text-indigo-500/80 uppercase mb-1 tracking-widest">Start Coordinates</p>
                    <p className="text-sm font-black text-slate-900">{asset.start_latitude || "N/A"}, {asset.start_longitude || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-rose-50/30 rounded-2xl border border-rose-100/20 shadow-sm transition-colors">
                    <p className="text-[10px] font-black text-rose-500/80 uppercase mb-1 tracking-widest">End Coordinates</p>
                    <p className="text-sm font-black text-slate-900">{asset.end_latitude || "N/A"}, {asset.end_longitude || "N/A"}</p>
                  </div>
                </div>
              )}
            </section>

            {/* Section 2: Road Dimensions */}
            <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs">📏</span>
                Road Dimensions
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DetailItem label="Length (m)" value={asset.length} />
                <DetailItem label="Carriage Way Width (m)" value={asset.width_of_carriage_way} />
                <DetailItem label="Central Verge Width (m)" value={asset.width_of_central_verge} />
                <DetailItem label="Footpath Width (m)" value={asset.width_of_footpath} />
                <DetailItem label="ROW Width (m)" value={asset.row_width} />
                <DetailItem label="Cross Section" value={asset.cross_section_of_road} />
              </div>
            </section>

            {/* Section 3: Road Specifications */}
            <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-xs">🛣️</span>
                Road Specifications
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DetailItem label="Road Type" value={asset.type_of_road} highlight />
                <DetailItem label="LHS Green Belt (m)" value={asset.lhs_green_belt} />
                <DetailItem label="RHS Green Belt (m)" value={asset.rhs_green_belt} />
                <DetailItem label="Paved Portion (LHS) (m)" value={asset.paved_portion_lhs} />
                <DetailItem label="Paved Portion (RHS) (m)" value={asset.paved_portion_rhs} />
                <DetailItem label="Street Lights" value={asset.street_lights} />
              </div>
            </section>

            {/* Section 4: Drainage */}
            <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center text-xs">💧</span>
                Drainage & Infrastructure
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Storm Water Drain (LHS)" value={asset.storm_water_drain_lhs} />
                <DetailItem label="Storm Water Drain (RHS)" value={asset.storm_water_drain_rhs} />
              </div>
            </section>

            {/* Section 5: Taken Over Details */}
            <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs">🔄</span>
                Taken Over Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Taken Over From" value={asset.road_taken_over_from} />
                <DetailItem label="Year of Taken Over" value={asset.year_of_taken_over} />
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        {/* Footer */}
        <div className="bg-white px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
          {canEdit && (
            <>
              <button
                onClick={() => onDelete(asset)}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl transition-colors border border-rose-100 flex items-center gap-2"
              >
                Delete Asset
              </button>
              <button
                onClick={() => onEdit(asset)}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl transition-colors border border-indigo-100 flex items-center gap-2"
              >
                Edit Details
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, highlight }) => (
  <div className={highlight ? "p-3 bg-indigo-50 border border-indigo-100 rounded-xl" : "p-1"}>
    <p className="text-[10px] text-slate-400 font-black mb-1 uppercase tracking-widest">{label}</p>
    <p className={`font-black text-sm ${highlight ? "text-indigo-600" : "text-slate-800"}`}>
      {value || "N/A"}
    </p>
  </div>
);

export default AssetDetailModal;
