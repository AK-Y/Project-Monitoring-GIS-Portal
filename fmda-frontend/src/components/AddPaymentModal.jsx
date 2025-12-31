import { useState } from "react";
import { useDispatch } from "react-redux";
import { updatePayment, addPaymentToProject } from "../store/slices/projectSlice";
import ConfirmModal from "./ConfirmModal";

const AddPaymentModal = ({ projectId, onClose, initialData = null }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [wasValidated, setWasValidated] = useState(false);
    const [formData, setFormData] = useState({
        bill_no: initialData?.bill_no || "",
        payment_date: initialData?.payment_date ? initialData.payment_date.split('T')[0] : "",
        amount: initialData?.amount || ""
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

    const handleConfirmSubmit = async () => {
        setShowConfirm(false);
        setLoading(true);
        try {
            if (initialData) {
                await dispatch(updatePayment({ projectId, paymentId: initialData.id, data: formData })).unwrap();
            } else {
                await dispatch(addPaymentToProject({ id: projectId, data: formData })).unwrap();
            }
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to add payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className={`${initialData ? 'bg-indigo-600' : 'bg-emerald-600'} px-6 py-5 flex justify-between items-center transition-colors`}>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{initialData ? "Edit Payment" : "Add Payment"}</h2>
                        <p className="text-white/80 text-sm mt-1">{initialData ? "Update this payment record" : "Record a new payment transaction"}</p>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center transition-all">
                        <span className="text-2xl leading-none">&times;</span>
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className={`p-6 space-y-5 ${wasValidated ? 'was-validated' : ''}`}
                    noValidate
                >
                    <div>
                        <Label>Bill Number</Label>
                        <input
                            type="text"
                            name="bill_no"
                            className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1"
                            placeholder="e.g. BILL-2024-001"
                            required
                            value={formData.bill_no}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <Label>Payment Date</Label>
                        <input
                            type="date"
                            name="payment_date"
                            className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg px-2 py-1"
                            required
                            value={formData.payment_date}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <Label>Amount (in Lakh)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="amount"
                                className="input-field text-sm w-full outline-none border border-slate-200 rounded-lg pl-8 pr-2 py-1 font-mono"
                                placeholder="0.00"
                                required
                                value={formData.amount}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
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
                            className={`px-8 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${initialData ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                        >
                            {loading ? (initialData ? "Updating..." : "Adding...") : (initialData ? "Update Payment" : "Add Payment")}
                        </button>
                    </div>
                </form>
            </div>

            <ConfirmModal
                isOpen={showConfirm}
                title={initialData ? "Update Payment?" : "Add New Payment?"}
                message={initialData ? "Are you sure you want to update this payment record? This will correct the financial history." : `Are you sure you want to record this payment of ₹${formData.amount} Lakh? Accurate financial records are essential. Once saved, payment logs should be reviewed carefully.`}
                onConfirm={handleConfirmSubmit}
                onCancel={() => setShowConfirm(false)}
                confirmText="Yes, Add Payment"
            />
        </div>
    );
};

const Label = ({ children }) => (
    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
        {children}
    </label>
);

const styles = `
    .was-validated .input-field:invalid {
        border-color: #ef4444 !important;
        background-color: #fef2f2 !important;
    }
`;

if (typeof document !== 'undefined' && !document.getElementById('form-validation-styles')) {
    const styleTag = document.createElement('style');
    styleTag.id = 'form-validation-styles';
    styleTag.innerHTML = styles;
    document.head.appendChild(styleTag);
}

export default AddPaymentModal;
