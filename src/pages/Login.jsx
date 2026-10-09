import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authenticateUser } from '../authStore';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
          <div className="inline-block p-1 bg-white rounded-2xl shadow-2xl ring-4 ring-blue-500/30 mb-3.5">
            <img
              src="/logo.jpeg"
              alt="VEMU College Logo"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-xl"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-white placeholder-slate-500 transition"
                placeholder="Enter your password"
              />
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
