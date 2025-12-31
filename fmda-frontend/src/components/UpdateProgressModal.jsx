import { useState } from "react";
import { useDispatch } from "react-redux";
import { addProgressLog, updateProgressLog } from "../store/slices/projectSlice";
import ConfirmModal from "./ConfirmModal";

const UpdateProgressModal = ({ project, currentProgress = 0, onClose, initialData = null }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [wasValidated, setWasValidated] = useState(false);
  const [formData, setFormData] = useState({
    updated_on: initialData?.updated_on ? initialData.updated_on.split('T')[0] : new Date().toISOString().split("T")[0],
    physical_progress_percent: initialData?.physical_progress_percent || currentProgress,
    financial_progress_percent: initialData?.financial_progress_percent || 0,
    remarks: initialData?.remarks || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setWasValidated(true);
    if (e.currentTarget.checkValidity()) {
      setShowConfirm(true);
    }
  };

  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      if (initialData) {
        await dispatch(updateProgressLog({ projectId: project.id, progressId: initialData.id, data: formData })).unwrap();
      } else {
        await dispatch(addProgressLog({ id: project.id, data: formData })).unwrap();
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update progress");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">{initialData ? "Edit Progress Log" : "Update Progress"}</h2>

        <form
          onSubmit={handleSubmit}
          className={`space-y-4 ${wasValidated ? 'was-validated' : ''}`}
          noValidate
        >
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Date of Inspection</label>
            <input
              type="date"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
              value={formData.updated_on}
              onChange={(e) => setFormData({ ...formData, updated_on: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Physical Progress (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
                value={formData.physical_progress_percent}
                onChange={(e) => setFormData({ ...formData, physical_progress_percent: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Financial Progress (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
                value={formData.financial_progress_percent}
                onChange={(e) => setFormData({ ...formData, financial_progress_percent: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Remarks / Work Status</label>
            <textarea
              rows="3"
              required
              placeholder="e.g. Earth work completed, Base course started..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/30 disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : (initialData ? "Update Log" : "Save Log")}
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title={initialData ? "Update Progress Log?" : "Update Project Progress?"}
        message={initialData ? "Are you sure you want to correct this progress entry?" : `Are you sure you want to record ${formData.physical_progress_percent}% physical completion? Progress logs are permanent records of the site inspection.`}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirm(false)}
        confirmText="Yes, Save Progress"
      />

      <style>{`
        .was-validated input:invalid, 
        .was-validated textarea:invalid {
          border-color: #ef4444 !important;
          background-color: #fef2f2 !important;
        }
      `}</style>
    </div>
  );
};

export default UpdateProgressModal;
