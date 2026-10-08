import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('');

  useEffect(() => {
    // TEMPORARY: Read from local storage. Later this will come from Supabase auth.
    const savedRole = localStorage.getItem('userRole');
    if (!savedRole) {
      navigate('/login');
    } else {
      setRole(savedRole);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-blue-800 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">VEMU SAMS</h1>
        <div className="flex items-center gap-4">
          <span className="capitalize font-semibold bg-blue-700 px-3 py-1 rounded">Role: {role}</span>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 capitalize">
            {role} Dashboard
          </h2>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <p className="text-gray-600">
              Welcome to the unified dashboard! Based on your role (<strong>{role}</strong>), you will see different controls here once connected to Supabase.
            </p>
            
            {role === 'student' && (
              <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded">
                You can view your attendance records here.
              </div>
            )}
            
            {role === 'faculty' && (
              <div className="mt-4 p-4 bg-green-50 text-green-800 rounded">
                You can mark attendance for your subjects here.
              </div>
            )}
            
            {(role === 'admin' || role === 'hod') && (
              <div className="mt-4 p-4 bg-purple-50 text-purple-800 rounded">
                You have administrative access to view overall statistics and manage users.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
