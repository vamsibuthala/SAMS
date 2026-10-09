import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, addUser, deleteUser } from '../authStore';
import { supabase } from '../supabaseClient';

const Dashboard = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('admin');
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Users by role
  const [allUsers, setAllUsers] = useState([]);

  // Forms for adding users
  const [hodForm, setHodForm] = useState({ name: '', email: '', password: '', department: 'CSE' });
  const [facultyForm, setFacultyForm] = useState({ name: '', email: '', password: '', department: 'CSE', position: 'Assistant Professor' });
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '', roll: '', department: 'CSE-A' });

  // Attendance Records
  const [attendanceRecords, setAttendanceRecords] = useState([
    { id: 'att-1', studentName: 'Rahul Varma', subject: 'Data Structures', date: '2026-10-05', status: 'Present' },
    { id: 'att-2', studentName: 'Sneha Reddy', subject: 'Data Structures', date: '2026-10-05', status: 'Present' },
    { id: 'att-3', studentName: 'Karthik Raju', subject: 'Data Structures', date: '2026-10-05', status: 'Absent' },
    { id: 'att-4', studentName: 'Rahul Varma', subject: 'Web Technologies', date: '2026-10-06', status: 'Present' }
  ]);
  const [attendanceForm, setAttendanceForm] = useState({
    studentName: 'Rahul Varma',
    subject: 'Data Structures',
    date: new Date().toISOString().split('T')[0],
    status: 'Present'
  });

  const [feedbackMsg, setFeedbackMsg] = useState(null);

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') || 'admin';
    const savedUser = localStorage.getItem('currentUser');
    setRole(savedRole);
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        setCurrentUser({ full_name: 'User', email: '' });
      }
    }
    loadData();
  }, []);

  const loadData = async () => {
    // Load local users
    const users = getUsers();
    setAllUsers(users);

    // Try fetching attendance from Supabase
    try {
      const { data, error } = await supabase.from('attendance').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setAttendanceRecords(data.map(d => ({
          id: d.id,
          studentName: d.student_name,
          subject: d.subject,
          date: d.date,
          status: d.status
        })));
      }
    } catch (e) {
      console.warn('Attendance load fallback:', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const showNotification = (msg, isError = false) => {
    setFeedbackMsg({ text: msg, isError });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // 1. ADD HOD (Admin only)
  const handleAddHod = async (e) => {
    e.preventDefault();
    try {
      await addUser({
        full_name: hodForm.name,
        email: hodForm.email,
        password: hodForm.password || 'hod@123',
        role: 'hod',
        department: hodForm.department
      }, role);
      setHodForm({ name: '', email: '', password: '', department: 'CSE' });
      setAllUsers(getUsers());
      showNotification(`HOD "${hodForm.name}" added successfully! They can now log in with their email & password.`);
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  // 2. ADD FACULTY (Admin & HOD)
  const handleAddFaculty = async (e) => {
    e.preventDefault();
    try {
      await addUser({
        full_name: facultyForm.name,
        email: facultyForm.email,
        password: facultyForm.password || 'faculty@123',
        role: 'faculty',
        department: facultyForm.department,
        position: facultyForm.position
      }, role);
      setFacultyForm({ name: '', email: '', password: '', department: 'CSE', position: 'Assistant Professor' });
      setAllUsers(getUsers());
      showNotification(`Faculty "${facultyForm.name}" added successfully!`);
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  // 3. ADD STUDENT (Admin, HOD & Faculty)
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await addUser({
        full_name: studentForm.name,
        email: studentForm.email || `${studentForm.roll.toLowerCase()}@vemu.edu`,
        password: studentForm.password || 'student@123',
        role: 'student',
        roll_number: studentForm.roll,
        department: studentForm.department
      }, role);
      setStudentForm({ name: '', email: '', password: '', roll: '', department: 'CSE-A' });
      setAllUsers(getUsers());
      showNotification(`Student "${studentForm.name}" added successfully!`);
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  // DELETE USER
  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id, role);
      setAllUsers(getUsers());
      showNotification('User deleted successfully.');
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  // MARK ATTENDANCE (Faculty & Admin)
  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    const newRecord = {
      ...attendanceForm,
      id: `att-${Date.now()}`
    };

    setAttendanceRecords([newRecord, ...attendanceRecords]);

    try {
      await supabase.from('attendance').insert([{
        student_name: attendanceForm.studentName,
        subject: attendanceForm.subject,
        date: attendanceForm.date,
        status: attendanceForm.status
      }]);
    } catch (err) {
      console.warn('Supabase attendance sync:', err);
    }

    showNotification(`Attendance for "${attendanceForm.studentName}" marked as ${attendanceForm.status}!`);
  };

  // Filter users by role
  const hodsList = allUsers.filter(u => u.role === 'hod');
  const facultiesList = allUsers.filter(u => u.role === 'faculty');
  const studentsList = allUsers.filter(u => u.role === 'student');

  // Hierarchy Permissions Check
  const canManageHods = role === 'admin';
  const canManageFaculty = role === 'admin' || role === 'hod';
  const canManageStudents = role === 'admin' || role === 'hod' || role === 'faculty';
  const canMarkAttendance = role === 'admin' || role === 'hod' || role === 'faculty';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2.5">
              <div className="h-10 w-10 rounded-full bg-white p-0.5 shadow-sm border border-slate-700 flex items-center justify-center">
                <img
                  src="/logo.jpeg"
                  alt="VEMU Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-blue-400">VEMU</span>
              <span className="text-sm font-semibold tracking-wider text-slate-300 hidden sm:inline">
                | ATTENDANCE MANAGEMENT SYSTEM
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white">{currentUser?.full_name || 'Logged In'}</p>
              <p className="text-[10px] text-slate-400 font-mono">{currentUser?.email || ''}</p>
            </div>
            <span className="text-xs uppercase px-2.5 py-1 rounded-full font-bold bg-blue-600/30 text-blue-300 border border-blue-500/30">
              {role}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-3.5 rounded-lg transition shadow"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {feedbackMsg && (
        <div className={`p-3 text-center text-xs font-bold transition-all ${feedbackMsg.isError ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {feedbackMsg.text}
        </div>
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 border-r border-slate-800 flex flex-col justify-between py-6">
            <nav className="space-y-1 px-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                  activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                📊 Dashboard Overview
              </button>

              {/* Role-based User Management Tab */}
              {(canManageHods || canManageFaculty || canManageStudents) && (
                <button
                  onClick={() => setActiveTab('manage-users')}
                  className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                    activeTab === 'manage-users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  👥 {role === 'faculty' ? 'Manage Students' : 'User Management'}
                </button>
              )}

              {/* Mark Attendance Tab */}
              {canMarkAttendance && (
                <button
                  onClick={() => setActiveTab('mark-attendance')}
                  className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                    activeTab === 'mark-attendance' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  ✍️ Mark Attendance
                </button>
              )}

              {/* Reports Tab */}
              <button
                onClick={() => setActiveTab('attendance-records')}
                className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                  activeTab === 'attendance-records' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                📋 Attendance Reports
              </button>
            </nav>

            <div className="px-4 py-3 mx-3 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400">
              <p className="font-semibold text-slate-300">Hierarchy Scope</p>
              <p className="mt-0.5 text-slate-400 text-[11px]">
                {role === 'admin' && 'Full Access: Can add HODs, Faculty & Students'}
                {role === 'hod' && 'HOD Access: Can add Faculty & Students'}
                {role === 'faculty' && 'Faculty Access: Can add Students & Mark Attendance'}
                {role === 'student' && 'Student Access: Read-only attendance reports'}
              </p>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 capitalize">{role} Dashboard</h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Logged in as <strong>{currentUser?.full_name || role.toUpperCase()}</strong> ({role})
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Registered Students</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{studentsList.length}</p>
                  </div>
                  <span className="p-3 bg-blue-50 text-blue-600 rounded-lg text-xl">🎓</span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Faculty Members</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{facultiesList.length}</p>
                  </div>
                  <span className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-xl">👨‍🏫</span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Departments / HODs</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">{hodsList.length}</p>
                  </div>
                  <span className="p-3 bg-purple-50 text-purple-600 rounded-lg text-xl">🏛️</span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Total Records</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{attendanceRecords.length}</p>
                  </div>
                  <span className="p-3 bg-amber-50 text-amber-600 rounded-lg text-xl">📑</span>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Latest Attendance Records</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 text-left">
                        <th className="py-3 px-4 font-semibold">Student Name</th>
                        <th className="py-3 px-4 font-semibold">Subject</th>
                        <th className="py-3 px-4 font-semibold">Date</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attendanceRecords.slice(0, 6).map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-medium text-slate-800">{record.studentName}</td>
                          <td className="py-3 px-4 text-slate-600">{record.subject}</td>
                          <td className="py-3 px-4 text-slate-600">{record.date}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                record.status === 'Present'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROLE-BASED USER MANAGEMENT */}
          {activeTab === 'manage-users' && (
            <div className="space-y-8">
              {/* 1. HOD MANAGEMENT (Admin only) */}
              {canManageHods && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Manage Head of Departments (HOD)</h2>
                      <p className="text-xs text-slate-500">Only Admin can add or remove HODs.</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-bold">Admin Only</span>
                  </div>

                  <form onSubmit={handleAddHod} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      placeholder="HOD Full Name"
                      value={hodForm.name}
                      onChange={(e) => setHodForm({ ...hodForm, name: e.target.value })}
                      className="px-3.5 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="email"
                      placeholder="HOD Email"
                      value={hodForm.email}
                      onChange={(e) => setHodForm({ ...hodForm, email: e.target.value })}
                      className="px-3.5 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Password (default: hod@123)"
                      value={hodForm.password}
                      onChange={(e) => setHodForm({ ...hodForm, password: e.target.value })}
                      className="px-3.5 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition"
                    >
                      + Add HOD
                    </button>
                  </form>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 text-left">
                          <th className="py-2.5 px-4">Name</th>
                          <th className="py-2.5 px-4">Email</th>
                          <th className="py-2.5 px-4">Department</th>
                          <th className="py-2.5 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {hodsList.map((h) => (
                          <tr key={h.id}>
                            <td className="py-2.5 px-4 font-medium text-slate-800">{h.full_name}</td>
                            <td className="py-2.5 px-4 text-slate-600 font-mono text-xs">{h.email}</td>
                            <td className="py-2.5 px-4 text-slate-600">{h.department || 'CSE'}</td>
                            <td className="py-2.5 px-4 text-right">
                              <button
                                onClick={() => handleDeleteUser(h.id)}
                                className="text-red-500 hover:text-red-700 font-medium text-xs"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. FACULTY MANAGEMENT (Admin & HOD) */}
              {canManageFaculty && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Manage Faculty Members</h2>
                      <p className="text-xs text-slate-500">Admin and HOD can add or remove faculty.</p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">Admin & HOD</span>
                  </div>

                  <form onSubmit={handleAddFaculty} className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      placeholder="Faculty Full Name"
                      value={facultyForm.name}
                      onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                      className="px-3.5 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Faculty Email"
                      value={facultyForm.email}
                      onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                      className="px-3.5 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Password (default: faculty@123)"
                      value={facultyForm.password}
                      onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                      className="px-3.5 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={facultyForm.position}
                      onChange={(e) => setFacultyForm({ ...facultyForm, position: e.target.value })}
                      className="px-3.5 py-2 border rounded-lg text-sm bg-white outline-none"
                    >
                      <option>Assistant Professor</option>
                      <option>Professor</option>
                      <option>Lab Instructor</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition"
                    >
                      + Add Faculty
                    </button>
                  </form>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 text-left">
                          <th className="py-2.5 px-4">Name</th>
                          <th className="py-2.5 px-4">Email</th>
                          <th className="py-2.5 px-4">Position</th>
                          <th className="py-2.5 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {facultiesList.map((f) => (
                          <tr key={f.id}>
                            <td className="py-2.5 px-4 font-medium text-slate-800">{f.full_name}</td>
                            <td className="py-2.5 px-4 text-slate-600 font-mono text-xs">{f.email}</td>
                            <td className="py-2.5 px-4 text-slate-600">{f.position || 'Professor'}</td>
                            <td className="py-2.5 px-4 text-right">
                              <button
                                onClick={() => handleDeleteUser(f.id)}
                                className="text-red-500 hover:text-red-700 font-medium text-xs"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. STUDENT MANAGEMENT (Admin, HOD & Faculty) */}
              {canManageStudents && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Manage Students</h2>
                      <p className="text-xs text-slate-500">Admin, HOD, and Faculty can add or remove students.</p>
                    </div>
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full font-bold">Admin, HOD & Faculty</span>
                  </div>

                  <form onSubmit={handleAddStudent} className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      placeholder="Roll Number (e.g. 2023CS01)"
                      value={studentForm.roll}
                      onChange={(e) => setStudentForm({ ...studentForm, roll: e.target.value })}
                      className="px-3.5 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Student Full Name"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      className="px-3.5 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Student Email"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      className="px-3.5 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Password (default: student@123)"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                      className="px-3.5 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition"
                    >
                      + Add Student
                    </button>
                  </form>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 text-left">
                          <th className="py-2.5 px-4">Roll Number</th>
                          <th className="py-2.5 px-4">Name</th>
                          <th className="py-2.5 px-4">Email</th>
                          <th className="py-2.5 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentsList.map((s) => (
                          <tr key={s.id}>
                            <td className="py-2.5 px-4 font-mono text-xs font-bold text-slate-800">{s.roll_number || s.roll}</td>
                            <td className="py-2.5 px-4 font-medium text-slate-800">{s.full_name}</td>
                            <td className="py-2.5 px-4 text-slate-600 font-mono text-xs">{s.email}</td>
                            <td className="py-2.5 px-4 text-right">
                              <button
                                onClick={() => handleDeleteUser(s.id)}
                                className="text-red-500 hover:text-red-700 font-medium text-xs"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MARK ATTENDANCE (Faculty & Admin) */}
          {activeTab === 'mark-attendance' && canMarkAttendance && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Mark Student Attendance</h2>
              <p className="text-sm text-slate-500 mb-6">Select student, subject, date, and status to record attendance into Supabase.</p>

              <form onSubmit={handleMarkAttendance} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Student</label>
                  <select
                    value={attendanceForm.studentName}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, studentName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {studentsList.map((s) => (
                      <option key={s.id} value={s.full_name}>
                        {s.full_name} ({s.roll_number || s.roll || 'Student'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <select
                    value={attendanceForm.subject}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>Data Structures & Algorithms</option>
                    <option>Web Technologies & Cloud</option>
                    <option>Operating Systems</option>
                    <option>Database Management Systems</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={attendanceForm.date}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                      className="w-full px-3.5 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Attendance Status</label>
                    <select
                      value={attendanceForm.status}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                      className="w-full px-3.5 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition shadow"
                  >
                    Save Attendance to Supabase
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: ATTENDANCE RECORDS */}
          {activeTab === 'attendance-records' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Attendance Register & Reports</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {role === 'student' ? 'Viewing your personal attendance record' : 'Filter, review and export attendance logs'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => alert('Exporting attendance report as PDF...')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    📥 Export PDF
                  </button>
                  <button
                    onClick={() => alert('Exporting attendance report as Excel...')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    📊 Export Excel
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-left">
                      <th className="py-3 px-4 font-semibold">Student Name</th>
                      <th className="py-3 px-4 font-semibold">Subject</th>
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceRecords
                      .filter(r => role !== 'student' || !currentUser?.full_name || r.studentName.toLowerCase().includes(currentUser.full_name.toLowerCase()))
                      .map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-medium text-slate-800">{record.studentName}</td>
                          <td className="py-3 px-4 text-slate-600">{record.subject}</td>
                          <td className="py-3 px-4 text-slate-600">{record.date}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                record.status === 'Present'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Dashboard Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 py-4 px-6 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} VEMU SAMS • Student Attendance Management System</p>
        <p className="text-[11px] text-slate-400">
          Developed by <strong className="text-blue-400 font-semibold">VAMSI BUTHALA</strong>, C . BHARATH, C. GANESH KUMAR RAJU, C. BALAJI
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
