import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateUser, DEFAULT_ADMIN } from '../authStore';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Quick fill Admin credentials
  const fillAdminCredentials = () => {
    setRole('admin');
    setEmail(DEFAULT_ADMIN.email);
    setPassword(DEFAULT_ADMIN.password);
    setError(null);
  };

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
        setError(result.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white text-center">
          <div className="inline-flex p-3 bg-white/10 rounded-2xl mb-3 backdrop-blur-sm">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">VEMU SAMS</h1>
          <p className="text-blue-200 text-xs mt-1 uppercase tracking-wider font-semibold">
            Student Attendance Management System
          </p>
        </div>

        {/* Fresh Admin Credentials Alert */}
        <div className="mx-6 mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                🔑 Default Admin Credentials
              </p>
              <p className="text-xs text-blue-800 mt-1 font-mono">
                Email: <span className="font-semibold text-blue-950">admin@vemu.edu</span>
              </p>
              <p className="text-xs text-blue-800 font-mono">
                Password: <span className="font-semibold text-blue-950">admin@123</span>
              </p>
            </div>
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3 rounded-lg shadow-sm transition"
            >
              Auto Fill
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-6 pt-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-4 text-xs font-medium flex items-center">
              <span className="mr-2 text-base">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Select Your Role
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl">
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
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
                placeholder={`${role}@vemu.edu`}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
                placeholder="Enter password"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition duration-150 shadow-md text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : `Login as ${role.toUpperCase()}`}
            </button>
          </form>

          {/* Role Hierarchy Note */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Role Hierarchy: <span className="font-semibold text-slate-600">Admin</span> ➔{' '}
              <span className="font-semibold text-slate-600">HOD</span> ➔{' '}
              <span className="font-semibold text-slate-600">Faculty</span> ➔{' '}
              <span className="font-semibold text-slate-600">Student</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
