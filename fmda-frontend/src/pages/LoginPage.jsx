import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [validationError, setValidationError] = useState(null);

  // Regex Patterns
  const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
  const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Validate Username
    if (!USERNAME_REGEX.test(username)) {
      setValidationError("Username must be 3-20 characters (letters, numbers, underscore).");
      return;
    }

    // 2. Relaxed Password Validation (at least 6 characters)
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters long.");
      return;
    }

    const resultAction = await dispatch(loginUser({ username, password }));
    if (loginUser.fulfilled.match(resultAction)) {
      navigate("/");
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-500/5 rounded-full blur-[100px]" />

      <div className="glass-panel p-10 rounded-3xl shadow-2xl w-full max-w-md animate-fade-in-up relative z-10 border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Welcome Back</h1>
          <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest shrink-0">Project monitoring & GIS Official Portal</p>
        </div>

        {/* Global Error (Backend or Validation) */}
        {(error || validationError) && (
          <div className="bg-rose-50/50 text-rose-600 p-4 rounded-2xl text-xs font-bold mb-8 border border-rose-100 flex items-center gap-3 animate-fade-in shadow-sm">
            <span className="text-lg">⚠️</span>
            <div className="flex flex-col">
              <span>{validationError || error}</span>
              {error === 'Login failed' && <span className="text-[9px] opacity-70 mt-1 uppercase">Please check your internet connection or if the server is offline.</span>}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm text-slate-900 placeholder:text-slate-300"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm text-slate-900 placeholder:text-slate-300 pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-70 disabled:hover:scale-100 active:scale-95"
          >
            {loading ? "Verifying..." : "Sign In to Portal"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
