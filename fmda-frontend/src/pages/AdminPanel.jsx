import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers, createAccount, deleteAccount, updateRole } from "../store/slices/userSlice";

const AdminPanel = () => {
    const dispatch = useDispatch();
    const { list: users, loading } = useSelector(state => state.users);
    const [showCreate, setShowCreate] = useState(false);
    const [formData, setFormData] = useState({ username: "", password: "", role: "JE" });

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await dispatch(createAccount(formData)).unwrap();
            setShowCreate(false);
            setFormData({ username: "", password: "", role: "JE" });
        } catch (err) {
            alert("Failed to create user: " + err.msg || err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            dispatch(deleteAccount(id));
        }
    };

    const handleRoleChange = (id, newRole) => {
        dispatch(updateRole({ id, role: newRole }));
    };

    return (
        <div className="animate-fade-in space-y-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Admin Control Panel</h1>
                    <p className="text-slate-500 mt-1">Manage system access and user permissions</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-95"
                >
                    + New Account
                </button>
            </div>

            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-scale-up">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 font-display">Create System User</h2>
                        <form onSubmit={handleCreate} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="e.g. jhon_doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Designation / Role</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="JE">JE (Junior Engineer)</option>
                                    <option value="SDE">SDE (Sub Divisional Engineer)</option>
                                    <option value="XEN">XEN (Executive Engineer)</option>
                                    <option value="ADMIN">ADMIN (Full Access)</option>
                                    <option value="VIEWER">VIEWER (Read Only)</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">User Profile</th>
                            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Designation</th>
                            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                            {user.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800">{user.username}</div>
                                            <div className="text-xs text-slate-400 font-medium">Joined {new Date(user.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <select
                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer ${user.role === 'ADMIN' ? 'bg-red-50 text-red-600' :
                                                user.role === 'XEN' ? 'bg-purple-50 text-purple-600' :
                                                    user.role === 'SDE' ? 'bg-blue-50 text-blue-600' :
                                                        'bg-emerald-50 text-emerald-600'
                                            }`}
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    >
                                        <option value="JE">JE</option>
                                        <option value="SDE">SDE</option>
                                        <option value="XEN">XEN</option>
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="VIEWER">VIEWER</option>
                                    </select>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete Account"
                                    >
                                        <TrashIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && !loading && (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-slate-400 font-medium">
                                    No other users found. Create your team to begin.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

export default AdminPanel;
