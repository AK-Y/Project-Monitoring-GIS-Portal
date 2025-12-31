import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { createNewProject } from "../store/slices/projectSlice";
import ConfirmModal from "../components/ConfirmModal";

const CreateProjectPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [wasValidated, setWasValidated] = useState(false);
  const [formData, setFormData] = useState({
    project_uid: "", // Manual Project ID
    project_asset_ids: "", // Manual Asset IDs (Comma separated)
    name_of_work: "",
    type_of_work: "New Work",
    work_category: "",
    name_of_agency: "",
    budget_during_year: "",
    aa_amount: "",
    aa_date: "",
    dnit_amount: "",
    dnit_date: "",
    tender_date: "",
    allotment_date: "",
    start_date: "",
    completion_date: "",
    revised_completion_date: "",
    time_limit: "",
    dlp: "",
    project_monitoring_by: "",
    physical_progress: "",
    financial_progress: "",
    detail_of_payment: "",
    project_category: "Infra-I"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      const result = await dispatch(createNewProject(formData)).unwrap();
      navigate(`/projects/${result.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  const LoadingSpinner = () => {
    if (!loading || typeof document === "undefined" || !document.body) return null;
    return createPortal(
      <div className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        <p className="text-white font-bold mt-4 uppercase tracking-[0.2em] text-sm">Saving project...</p>
      </div>,
      document.body
    );
  };

  return (
    <>
      <LoadingSpinner />

      <ConfirmModal
        isOpen={showConfirm}
        title="Add This Project?"
        message="Are you sure you want to save this work? Please check all dates and money details before saying yes."
        onConfirm={handleFinalSubmit}
        onCancel={() => setShowConfirm(false)}
        confirmText="Yes, Add It"
        cancelText="No, Go Back"
      />

      <div className="animate-fade-in max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md py-4">
          <div>
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 text-sm font-bold flex items-center gap-1 mb-1 transition-colors">
              <span>←</span> Back
            </button>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
              Add New <span className="text-indigo-600">Project</span>
            </h1>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`space-y-8 ${wasValidated ? 'was-validated' : ''}`}
          noValidate
        >

          {/* Section: Basic Details */}
          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group hover:border-indigo-100 transition-all">
            <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg">01</span>
              Basic Details
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Project ID (Optional)</Label>
                  <input type="text" name="project_uid" className="input-field text-sm font-bold text-indigo-600" placeholder="e.g. FMDA-2024-001" value={formData.project_uid} onChange={handleChange} />
                </div>
                <div>
                  <Label>Asset IDs (Comma Separated)</Label>
                  <input type="text" name="project_asset_ids" className="input-field text-sm font-bold text-sky-600" placeholder="e.g. A-12345, A-67890" value={formData.project_asset_ids} onChange={handleChange} required />
                </div>
              </div>

              <div>
                <Label>Name of Work</Label>
                <textarea name="name_of_work" className="input-field text-sm w-full" placeholder="What is the name of the project?" value={formData.name_of_work} onChange={handleChange} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label>Type of Work</Label>
                  <select name="type_of_work" className="input-field" value={formData.type_of_work} onChange={handleChange} required>
                    <option value="">Select Type</option>
                    <option value="New Work">New Work</option>
                    <option value="Repair">Repair</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <Label>Work Category</Label>
                  <select name="work_category" className="input-field" value={formData.work_category} onChange={handleChange} required>
                    <option value="">Select Category</option>
                    <option value="Road">Road</option>
                    <option value="Drain">Drain</option>
                    <option value="Sewer">Sewer</option>
                  </select>
                </div>
                <div>
                  <Label>Name of Agency</Label>
                  <input type="text" name="name_of_agency" className="input-field" placeholder="Name of Contractor" value={formData.name_of_agency} onChange={handleChange} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Project Monitoring By</Label>
                  <input type="text" name="project_monitoring_by" className="input-field" placeholder="JE Name or Office Name" value={formData.project_monitoring_by} onChange={handleChange} required />
                </div>
                <div>
                  <Label>Department</Label>
                  <select name="project_category" className="input-field font-bold text-indigo-600" value={formData.project_category} onChange={handleChange} required>
                    <option value="Infra-I">Infra-I</option>
                    <option value="Infra-II">Infra-II</option>
                    <option value="Mobility">Mobility</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Financials */}
          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group hover:border-emerald-100 transition-all">
            <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg">02</span>
              Financial Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-emerald-100 transition-colors">
                <h4 className="text-base font-bold text-slate-500 mb-5 uppercase tracking-wider">Approval (A/A)</h4>
                <div className="space-y-4">
                  <div>
                    <Label>A/A Amount (Lakh)</Label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input type="number" name="aa_amount" min="0" step="any" className="input-field pl-10" placeholder="0.00" value={formData.aa_amount} onChange={handleChange} required />
                    </div>
                  </div>
                  <div>
                    <Label>A/A Date</Label>
                    <input type="date" name="aa_date" className="input-field" value={formData.aa_date} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-emerald-100 transition-colors">
                <h4 className="text-base font-bold text-slate-500 mb-5 uppercase tracking-wider">Papers (DNIT)</h4>
                <div className="space-y-4">
                  <div>
                    <Label>DNIT Amount (Lakh)</Label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input type="number" name="dnit_amount" min="0" step="any" className="input-field pl-10" placeholder="0.00" value={formData.dnit_amount} onChange={handleChange} required />
                    </div>
                  </div>
                  <div>
                    <Label>DNIT Date</Label>
                    <input type="date" name="dnit_date" className="input-field" value={formData.dnit_date} onChange={handleChange} required />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <Label>Budget During Year (Lakh)</Label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input type="number" name="budget_during_year" className="input-field pl-10" placeholder="0.00" value={formData.budget_during_year} onChange={handleChange} required />
                </div>
              </div>
              <div>
                <Label>Tender Date</Label>
                <input type="date" name="tender_date" className="input-field" value={formData.tender_date} onChange={handleChange} required />
              </div>
            </div>
          </section>

          {/* Section: Timeline */}
          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group hover:border-amber-100 transition-all">
            <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-lg">03</span>
              Time & Dates
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div><Label>Allotment Date</Label><input type="date" name="allotment_date" className="input-field" value={formData.allotment_date} onChange={handleChange} required /></div>
              <div><Label>Start Date</Label><input type="date" name="start_date" className="input-field" value={formData.start_date} onChange={handleChange} required /></div>
              <div><Label>Completion Date</Label><input type="date" name="completion_date" className="input-field" value={formData.completion_date} onChange={handleChange} required /></div>
              <div><Label>Revised Completion Date</Label><input type="date" name="revised_completion_date" className="input-field" value={formData.revised_completion_date} onChange={handleChange} /></div>
              <div><Label>Time Limit</Label><input type="text" name="time_limit" className="input-field" placeholder="e.g. 6 Months" value={formData.time_limit} onChange={handleChange} required /></div>
              <div><Label>DLP</Label><input type="text" name="dlp" className="input-field" placeholder="e.g. 5 Years" value={formData.dlp} onChange={handleChange} required /></div>
            </div>
          </section>

          {/* Section: Status */}
          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group hover:border-purple-100 transition-all">
            <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-lg">04</span>
              Work Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div><Label>Physical Work Progress (%)</Label><input type="text" name="physical_progress" className="input-field" placeholder="e.g. 30%" value={formData.physical_progress} onChange={handleChange} required /></div>
              <div><Label>Financial Work Progress (%)</Label><input type="text" name="financial_progress" className="input-field" placeholder="e.g. 20%" value={formData.financial_progress} onChange={handleChange} required /></div>
            </div>
            <div>
              <Label>Detail of Payment</Label>
              <textarea name="detail_of_payment" rows="3" className="input-field resize-none" placeholder="Write any payment notes..." value={formData.detail_of_payment} onChange={handleChange} required />
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 pb-12">
            <button type="button" onClick={() => navigate(-1)} className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs text-white bg-indigo-600 shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 min-w-[200px]">
              {loading ? "Verifying..." : "Save Project"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

const Label = ({ children }) => (
  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">
    {children}
  </label>
);

export default CreateProjectPage;
