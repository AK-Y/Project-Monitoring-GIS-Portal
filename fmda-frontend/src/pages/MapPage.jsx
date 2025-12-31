import { useState } from "react";
import MapView from "../components/MapView";
import RoadDetailPanel from "../components/RoadDetailPanel";
import AssetDetailModal from "../components/AssetDetailModal";
import { useSelector } from "react-redux";

const MapPage = () => {
  const [showModal, setShowModal] = useState(false);
  const { selectedAssetId, list: assets } = useSelector((s) => s.assets);
  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  return (
    <div className="h-[calc(100vh-theme(spacing.24))] w-full relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
      <MapView />
      <RoadDetailPanel onShowSpecs={() => setShowModal(true)} />

      {showModal && selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={() => setShowModal(false)}
          canEdit={false}
        />
      )}
    </div>
  );
};

export default MapPage;
