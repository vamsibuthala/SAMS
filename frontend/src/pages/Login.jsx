import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authenticateUser } from '../authStore';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await authenticateUser(role, email, password);
      if (result.success) {
        localStorage.setItem('userRole', role);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        navigate('/dashboard');
      } else {
        setError(result.error || 'Authentication failed. Please verify your email and password.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 font-sans overflow-hidden">
      {/* College Campus Background with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/campas1.jpg"
          alt="VEMU Campus"
          className="w-full h-full object-cover object-center filter brightness-40 blur-[2px] scale-105"
        />
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[3px]"></div>
      </div>

      {/* Floating Back to Home button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-md text-xs font-semibold transition"
      >
        <span>←</span>
        <span>Back to College Home</span>
      </Link>

      {/* Login Card */}
      <div className="relative z-10 bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-700/70 text-slate-100">
        {/* College Branding Header with Logo */}
        <div className="pt-8 pb-6 px-8 text-center border-b border-slate-800">
          <div className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white shadow-2xl ring-4 ring-blue-500/40 p-0.5 mb-3.5 overflow-hidden">
            <img
              src="/vemu_emblem.png"
              alt="VEMU College Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">
            VEMU INSTITUTE OF TECHNOLOGY
          </h1>
          <p className="text-xs font-semibold text-blue-400 mt-1 uppercase tracking-wider">
            Student Attendance Management System (SAMS)
          </p>
        </div>

        {/* Form Container */}
        <div className="p-8 pt-6">
          {error && (
            <div className="bg-red-950/80 border border-red-500/50 text-red-200 p-3 rounded-xl mb-5 text-xs font-medium flex items-center">
              <span className="mr-2 text-base">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Select Your Role
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                {['admin', 'hod', 'faculty', 'student'].map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setError(null);
                    }}
                    className={`py-2 text-xs rounded-lg capitalize font-bold transition-all ${
                      role === r
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Institutional Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-white placeholder-slate-500 transition"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-white placeholder-slate-500 transition"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition focus:outline-none cursor-pointer"
                  title={showPassword ? 'Hide password' : 'View password'}
                  aria-label={showPassword ? 'Hide password' : 'View password'}
                >
                  {showPassword ? (
                    // Eye Slash Icon (Hide)
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    // Eye Icon (View)
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition duration-150 shadow-lg shadow-blue-600/30 text-sm mt-3 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Authenticating...' : `Sign In as ${role.toUpperCase()}`}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-400">
              Affiliated to JNTUA • Approved by AICTE • NAAC Accredited
            </p>
            <p className="text-[10px] text-slate-500 mt-2">
              Developed by <strong className="text-blue-400 font-semibold">VAMSI BUTHALA</strong>, C . BHARATH, C. GANESH KUMAR RAJU, C. BALAJI (Computer Science & Engineering)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
