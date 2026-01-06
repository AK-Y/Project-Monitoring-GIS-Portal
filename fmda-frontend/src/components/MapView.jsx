import { MapContainer, TileLayer, GeoJSON, LayersControl, ZoomControl } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchAssets, selectAsset } from "../store/slices/assetSlice";
import { fetchProjectsByAsset } from "../store/slices/projectSlice";

const { BaseLayer, Overlay } = LayersControl;

const MapView = ({ showLegend = true, compact = false }) => {
  const dispatch = useDispatch();
  const assets = useSelector((s) => s.assets.list);

  // Visibility State
  const [filters, setFilters] = useState({
    Road: true,
    Drain: true,
    Sewer: true
  });

  useEffect(() => {
    dispatch(fetchAssets());
  }, [dispatch]);

  // Filter Assets
  const filteredAssets = assets.filter(a => filters[a.asset_type] !== false && a.geometry);

  console.log("DEBUG: Total Assets from DB:", assets.length);
  console.log("DEBUG: Filtered Assets for Map:", filteredAssets.length);

  const geojson = {
    type: "FeatureCollection",
    features: filteredAssets.map((a) => {
      try {
        const feature = {
          type: "Feature",
          geometry: JSON.parse(a.geometry),
          properties: {
            id: a.id,
            code: a.asset_code,
            type: a.asset_type,
            project_count: parseInt(a.project_count || 0),
            is_synthetic: a.is_synthetic
          },
        };
        return feature;
      } catch (e) {
        console.error("DEBUG: Invalid geometry for asset:", a.asset_code, e);
        return null;
      }
    }).filter(f => f !== null),
  };

  console.log("DEBUG: Final GeoJSON Features:", geojson.features.length);

  // Style Function
  // Style Function
  const getStyle = (feature) => {
    const { type, project_count, is_synthetic } = feature.properties;
    const hasProjects = project_count > 0;

    const baseColor = hasProjects ?
      (type === "Road" ? "#ff0000" : // Pure Red
        type === "Drain" ? "#00ffff" : // Pure Cyan
          "#00ff00") : // Pure Lime (Sewer)
      (type === "Road" ? "#94a3b8" : // Brighter Slate
        type === "Drain" ? "#38bdf8" : // Brighter Sky
          "#4ade80"); // Brighter Green (Sewer)

    return {
      color: baseColor,
      weight: is_synthetic ? 12 : (hasProjects ? 8 : 5),
      opacity: is_synthetic ? 1 : (hasProjects ? 1 : 0.8),
    };
  };

  const onEach = (f, layer) => {
    // Add Permanent Text Label (Asset Code)
    layer.bindTooltip(`${f.properties.code}`, {
      permanent: true,
      direction: "center",
      className: "asset-label",
      opacity: 0.9
    });

    // Determine Icon and Colors based on state
    const typeIcon = f.properties.type === 'Road' ? '🛣️' : f.properties.type === 'Drain' ? '💧' : '🕳️';
    const hasProjects = f.properties.project_count > 0;

    layer.bindPopup(`
      <div class="flex items-start gap-3 min-w-[200px] p-1 font-sans">
        <div class="mt-0.5 w-10 h-10 rounded-xl ${hasProjects ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'} flex items-center justify-center text-xl shadow-sm ring-1 ring-inset ${hasProjects ? 'ring-emerald-100' : 'ring-slate-100'}">
           ${typeIcon}
        </div>
        <div class="flex-1 min-w-0">
           
           <div class="flex flex-col">
             <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">${f.properties.type}</span>
             <h3 class="font-black text-slate-800 text-lg leading-none tracking-tight">${f.properties.code}</h3>
           </div>
           
           <div class="flex items-center gap-1.5 mt-2 bg-slate-50/50 rounded-md py-1 px-1.5 -ml-1.5 w-fit">
             <span class="relative flex h-1.5 w-1.5">
               ${hasProjects ? '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>' : ''}
               <span class="relative inline-flex rounded-full h-1.5 w-1.5 ${hasProjects ? 'bg-emerald-500' : 'bg-slate-300'}"></span>
             </span>
             <p class="text-[10px] font-bold ${hasProjects ? 'text-emerald-700' : 'text-slate-500'} uppercase tracking-wide leading-none">
               ${f.properties.project_count} Active Project${f.properties.project_count !== 1 ? 's' : ''}
             </p>
           </div>
        </div>
      </div>
    `, {
      minWidth: 200,
      maxWidth: 260,
      closeButton: true,
      className: 'modern-popup-widget'
    });

    layer.on("click", () => {
      dispatch(selectAsset(f.properties.id));
      dispatch(fetchProjectsByAsset(f.properties.id));
    });
  };

  return (
    <div className="relative h-full w-full">
      {/* Custom Legend / Filter Control */}
      {showLegend && (
        <div className={`absolute z-[1000] glass-panel rounded-xl shadow-lg transition-all animate-fade-in ${compact ? 'top-2 right-2 w-32 p-2' : 'top-4 left-16 w-52 p-4'
          }`}>
          <h4 className={`font-black text-slate-500 uppercase tracking-widest ${compact ? 'text-[8px] mb-1.5' : 'text-xs mb-3'
            }`}>Asset Layers</h4>
          <div className={compact ? "space-y-1" : "space-y-2"}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.Road}
                onChange={(e) => setFilters(prev => ({ ...prev, Road: e.target.checked }))}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span className={`${compact ? 'w-2 h-2' : 'w-3 h-3'} rounded-full`} style={{ backgroundColor: "#ff0000" }}></span>
              <span className={`${compact ? 'text-[10px]' : 'text-sm'} font-bold text-slate-700`}>Roads</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.Drain}
                onChange={(e) => setFilters(prev => ({ ...prev, Drain: e.target.checked }))}
                className="rounded text-cyan-500 focus:ring-cyan-500"
              />
              <span className={`${compact ? 'w-2 h-2' : 'w-3 h-3'} rounded-full`} style={{ backgroundColor: "#00ffff" }}></span>
              <span className={`${compact ? 'text-[10px]' : 'text-sm'} font-bold text-slate-700`}>Drains</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.Sewer}
                onChange={(e) => setFilters(prev => ({ ...prev, Sewer: e.target.checked }))}
                className="rounded text-green-500 focus:ring-green-500"
              />
              <span className={`${compact ? 'w-2 h-2' : 'w-3 h-3'} rounded-full`} style={{ backgroundColor: "#00ff00" }}></span>
              <span className={`${compact ? 'text-[10px]' : 'text-sm'} font-bold text-slate-700`}>Sewers</span>
            </label>
          </div>
        </div>
      )}

      <MapContainer center={[28.45, 77.3]} zoom={12} className="h-full w-full z-0" zoomControl={false}>
        <ZoomControl position="bottomright" />

        <LayersControl position="bottomleft">
          <BaseLayer checked name="Street Map">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
          </BaseLayer>
          <BaseLayer name="Dark Mode">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
          </BaseLayer>
          <BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            />
          </BaseLayer>
        </LayersControl>

        {/* Use key to force re-render when filters change, ensuring clean layer updates */}
        <GeoJSON
          key={JSON.stringify(filters)}
          data={geojson}
          style={getStyle}
          onEachFeature={onEach}
        />
      </MapContainer>
    </div>
  );
};

export default MapView;
