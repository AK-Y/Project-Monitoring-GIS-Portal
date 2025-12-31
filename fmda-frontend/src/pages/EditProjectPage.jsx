import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProjectDetail, updateProject } from "../store/slices/projectSlice";
import ConfirmModal from "../components/ConfirmModal";

const EditProjectPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { current } = useSelector((s) => s.projects);
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [wasValidated, setWasValidated] = useState(false);

    const [formData, setFormData] = useState(null);

    useEffect(() => {
        if (!current || current.project.id !== parseInt(id)) {
            dispatch(fetchProjectDetail(id));
        } else {
            // Map project data to form fields
            const p = current.project;
            setFormData({
                project_uid: p.project_uid || "", // Manual Project ID
                project_asset_ids: p.linked_asset_codes?.join(", ") || "", // Asset IDs as string
                name_of_work: p.name_of_work || "",
                type_of_work: p.type_of_work || "New Work",
                work_category: p.work_category || "",
                name_of_agency: p.name_of_agency || "",
                budget_during_year: p.budget_during_year || "",
                aa_amount: p.aa_amount || "",
                aa_date: p.aa_date ? p.aa_date.split('T')[0] : "",
                dnit_amount: p.dnit_amount || "",
                dnit_date: p.dnit_date ? p.dnit_date.split('T')[0] : "",
                tender_date: p.tender_date ? p.tender_date.split('T')[0] : "",
                allotment_date: p.allotment_date ? p.allotment_date.split('T')[0] : "",
                start_date: p.start_date ? p.start_date.split('T')[0] : "",
                completion_date: p.completion_date ? p.completion_date.split('T')[0] : "",
                revised_completion_date: p.revised_completion_date ? p.revised_completion_date.split('T')[0] : "",
                time_limit: p.time_limit || "",
                dlp: p.dlp || "",
                project_monitoring_by: p.project_monitoring_by || "",
                physical_progress: p.physical_progress || "",
                financial_progress: p.financial_progress || "",
                detail_of_payment: p.detail_of_payment || "",
                project_category: p.project_category || "Infra-I"
            });
        }
    }, [dispatch, id, current]);

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
            await dispatch(updateProject({ id, data: formData })).unwrap();
            navigate(`/projects/${id}`);
        } catch (err) {
            console.error(err);
            alert("Failed to update. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    if (!formData) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <>
            <ConfirmModal
                isOpen={showConfirm}
                title="Update Project Details?"
                message="Are you sure you want to save these changes? This will correct the official records."
                onConfirm={handleFinalSubmit}
                onCancel={() => setShowConfirm(false)}
                confirmText="Yes, Update"
                cancelText="Cancel"
            />

            <div className="animate-fade-in max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md py-4">
                    <div>
                        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 text-sm font-bold flex items-center gap-1 mb-1 transition-colors">
                            <span>←</span> Cancel
                        </button>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                            Edit <span className="text-indigo-600">Project Records</span>
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
                                    <Label>Project ID (Manual)</Label>
                                    <input type="text" name="project_uid" className="input-field font-bold text-indigo-600" placeholder="e.g. FMDA-2024-001" value={formData.project_uid} onChange={handleChange} />
                                </div>
                                <div>
                                    <Label>Asset IDs (Comma Separated)</Label>
                                    <input type="text" name="project_asset_ids" className="input-field font-bold text-sky-600" placeholder="e.g. A-101, A-102" value={formData.project_asset_ids} onChange={handleChange} />
                                </div>
                            </div>

                            <div>
                                <Label>Work Name</Label>
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
                                    <Label>Which Work</Label>
                                    <select name="work_category" className="input-field" value={formData.work_category} onChange={handleChange} required>
                                        <option value="">Select Category</option>
                                        <option value="Road">Road</option>
                                        <option value="Drain">Drain</option>
                                        <option value="Sewer">Sewer</option>
                                    </select>
                                </div>
                                <div>
                                    <Label>Agency Name</Label>
                                    <input type="text" name="name_of_agency" className="input-field" placeholder="Name of Contractor" value={formData.name_of_agency} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label>Monitored By</Label>
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
                                        <Label>Approval Amount (Lakh)</Label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                            <input type="number" name="aa_amount" min="0" step="any" className="input-field pl-10" placeholder="0.00" value={formData.aa_amount} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Date of Approval</Label>
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
                                <Label>Yearly Budget (Lakh)</Label>
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
                            <div><Label>Work Start Date</Label><input type="date" name="start_date" className="input-field" value={formData.start_date} onChange={handleChange} required /></div>
                            <div><Label>Target End Date</Label><input type="date" name="completion_date" className="input-field" value={formData.completion_date} onChange={handleChange} required /></div>
                            <div><Label>Revised End Date</Label><input type="date" name="revised_completion_date" className="input-field" value={formData.revised_completion_date} onChange={handleChange} /></div>
                            <div><Label>Total Time</Label><input type="text" name="time_limit" className="input-field" placeholder="e.g. 6 Months" value={formData.time_limit} onChange={handleChange} required /></div>
                            <div><Label>Warranty Time (DLP)</Label><input type="text" name="dlp" className="input-field" placeholder="e.g. 5 Years" value={formData.dlp} onChange={handleChange} required /></div>
                        </div>
                    </section>

                    {/* Section: Status */}
                    <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group hover:border-purple-100 transition-all">
                        <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-lg">04</span>
                            Work Status
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div><Label>Physical Done (%)</Label><input type="text" name="physical_progress" className="input-field" placeholder="e.g. 30%" value={formData.physical_progress} onChange={handleChange} required /></div>
                            <div><Label>Payment Done (%)</Label><input type="text" name="financial_progress" className="input-field" placeholder="e.g. 20%" value={formData.financial_progress} onChange={handleChange} required /></div>
                        </div>
                        <div>
                            <Label>Payment Details</Label>
                            <textarea name="detail_of_payment" rows="3" className="input-field resize-none" placeholder="Write any payment notes..." value={formData.detail_of_payment} onChange={handleChange} required />
                        </div>
                    </section>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-4 pb-12">
                        <button type="button" onClick={() => navigate(-1)} className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Cancel</button>
                        <button type="submit" disabled={loading} className="px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs text-white bg-indigo-600 shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 min-w-[200px]">
                            {loading ? "Updating..." : "Save Changes"}
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

export default EditProjectPage;
