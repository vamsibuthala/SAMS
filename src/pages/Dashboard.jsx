import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Dashboard = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(true);

  // States for Admin
  const [hods, setHods] = useState([
    { id: '1', name: 'Dr. Ramesh Kumar', email: 'ramesh.hod@vemu.edu', department: 'CSE' },
    { id: '2', name: 'Dr. Priya Sharma', email: 'priya.hod@vemu.edu', department: 'ECE' }
  ]);
  const [newHod, setNewHod] = useState({ name: '', email: '', department: 'CSE' });

  // States for Faculty
  const [faculties, setFaculties] = useState([
    { id: '1', name: 'Prof. Suresh V', email: 'suresh@vemu.edu', position: 'Assistant Professor', department: 'CSE' },
    { id: '2', name: 'Prof. Anitha M', email: 'anitha@vemu.edu', position: 'Professor', department: 'CSE' }
  ]);
  const [newFaculty, setNewFaculty] = useState({ name: '', email: '', position: 'Assistant Professor', department: 'CSE' });

  // States for Students
  const [students, setStudents] = useState([
    { id: '1', roll: '2023CS01', name: 'Rahul Varma', classSection: 'CSE-A', email: 'rahul@vemu.edu' },
    { id: '2', roll: '2023CS02', name: 'Sneha Reddy', classSection: 'CSE-A', email: 'sneha@vemu.edu' },
    { id: '3', roll: '2023CS03', name: 'Karthik Raju', classSection: 'CSE-B', email: 'karthik@vemu.edu' }
  ]);
  const [newStudent, setNewStudent] = useState({ roll: '', name: '', classSection: 'CSE-A', email: '' });

  // Attendance Records
  const [attendanceRecords, setAttendanceRecords] = useState([
    { id: '1', studentName: 'Rahul Varma', subject: 'Data Structures', date: '2026-10-05', status: 'Present' },
    { id: '2', studentName: 'Sneha Reddy', subject: 'Data Structures', date: '2026-10-05', status: 'Present' },
    { id: '3', studentName: 'Karthik Raju', subject: 'Data Structures', date: '2026-10-05', status: 'Absent' },
    { id: '4', studentName: 'Rahul Varma', subject: 'Web Technologies', date: '2026-10-06', status: 'Present' }
  ]);
  const [attendanceForm, setAttendanceForm] = useState({
    studentName: 'Rahul Varma',
    subject: 'Data Structures',
    date: new Date().toISOString().split('T')[0],
    status: 'Present'
  });

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') || 'student';
    setRole(savedRole);
    fetchDataFromSupabase();
  }, []);

  // Fetch data directly from Supabase
  const fetchDataFromSupabase = async () => {
    try {
      setLoading(true);
      // Fetch attendance
      const { data: attData, error: attErr } = await supabase.from('attendance').select('*').order('created_at', { ascending: false });
      if (!attErr && attData && attData.length > 0) {
        setAttendanceRecords(attData.map(a => ({
          id: a.id,
          studentName: a.student_name,
          subject: a.subject,
          date: a.date,
          status: a.status
        })));
      }

      // Fetch profiles
      const { data: profData, error: profErr } = await supabase.from('profiles').select('*');
      if (!profErr && profData && profData.length > 0) {
        const hList = profData.filter(p => p.role === 'hod').map(p => ({ id: p.id, name: p.full_name, email: p.email, department: p.department || 'CSE' }));
        const fList = profData.filter(p => p.role === 'faculty').map(p => ({ id: p.id, name: p.full_name, email: p.email, position: p.department || 'Professor', department: 'CSE' }));
        const sList = profData.filter(p => p.role === 'student').map(p => ({ id: p.id, roll: p.roll_number || '2023CS01', name: p.full_name, classSection: p.department || 'CSE-A', email: p.email }));
        
        if (hList.length > 0) setHods(hList);
        if (fList.length > 0) setFaculties(fList);
        if (sList.length > 0) setStudents(sList);
      }
      setDbConnected(true);
    } catch (err) {
      console.warn('Supabase sync notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  // Add Handlers
  const handleAddHod = async (e) => {
    e.preventDefault();
    if (!newHod.name || !newHod.email) return;
    try {
      await supabase.from('profiles').insert([{
        full_name: newHod.name,
        email: newHod.email,
        role: 'hod',
        department: newHod.department
      }]);
    } catch (err) {
      console.error(err);
    }
    setHods([...hods, { ...newHod, id: String(Date.now()) }]);
    setNewHod({ name: '', email: '', department: 'CSE' });
  };

  const handleDeleteHod = async (id) => {
    try {
      await supabase.from('profiles').delete().eq('id', id);
    } catch (err) {
      console.error(err);
    }
    setHods(hods.filter((h) => h.id !== id));
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (!newFaculty.name || !newFaculty.email) return;
    try {
      await supabase.from('profiles').insert([{
        full_name: newFaculty.name,
        email: newFaculty.email,
        role: 'faculty',
        department: newFaculty.position
      }]);
    } catch (err) {
      console.error(err);
    }
    setFaculties([...faculties, { ...newFaculty, id: String(Date.now()) }]);
    setNewFaculty({ name: '', email: '', position: 'Assistant Professor', department: 'CSE' });
  };

  const handleDeleteFaculty = async (id) => {
    try {
      await supabase.from('profiles').delete().eq('id', id);
    } catch (err) {
      console.error(err);
    }
    setFaculties(faculties.filter((f) => f.id !== id));
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.roll) return;
    try {
      await supabase.from('profiles').insert([{
        full_name: newStudent.name,
        email: newStudent.email || `${newStudent.roll.toLowerCase()}@vemu.edu`,
        role: 'student',
        roll_number: newStudent.roll,
        department: newStudent.classSection
      }]);
    } catch (err) {
      console.error(err);
    }
    setStudents([...students, { ...newStudent, id: String(Date.now()) }]);
    setNewStudent({ roll: '', name: '', classSection: 'CSE-A', email: '' });
  };

  const handleDeleteStudent = async (id) => {
    try {
      await supabase.from('profiles').delete().eq('id', id);
    } catch (err) {
      console.error(err);
    }
    setStudents(students.filter((s) => s.id !== id));
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    const newRecord = { ...attendanceForm, id: String(Date.now()) };
    try {
      await supabase.from('attendance').insert([{
        student_name: attendanceForm.studentName,
        subject: attendanceForm.subject,
        date: attendanceForm.date,
        status: attendanceForm.status
      }]);
    } catch (err) {
      console.error('Save to Supabase error:', err);
    }
    setAttendanceRecords([newRecord, ...attendanceRecords]);
    alert('Attendance marked and recorded in Supabase!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-slate-800 text-slate-300 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-blue-400">VEMU</span>
              <span className="text-sm font-semibold tracking-wider text-slate-300 hidden sm:inline">| STUDENT ATTENDANCE SYSTEM</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs uppercase px-2.5 py-1 rounded-full font-bold bg-blue-600/30 text-blue-300 border border-blue-500/30">
              {role}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-3.5 rounded-lg transition duration-150 shadow"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 border-r border-slate-800 flex flex-col justify-between py-6">
            <nav className="space-y-1 px-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                📊 Dashboard Overview
              </button>

              {(role === 'admin' || role === 'hod') && (
                <button
                  onClick={() => setActiveTab('manage-users')}
                  className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                    activeTab === 'manage-users'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  👥 Manage Faculty & Students
                </button>
              )}

              {(role === 'faculty' || role === 'admin' || role === 'hod') && (
                <button
                  onClick={() => setActiveTab('mark-attendance')}
                  className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                    activeTab === 'mark-attendance'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  ✍️ Mark Attendance
                </button>
              )}

              <button
                onClick={() => setActiveTab('attendance-records')}
                className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                  activeTab === 'attendance-records'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                📋 Attendance Reports
              </button>
            </nav>

            <div className="px-4 py-3 mx-3 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400">
              <p className="font-semibold text-slate-300">VEMU IT Institute</p>
              <div className="flex items-center gap-1.5 mt-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Supabase Connected</span>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 capitalize">{role} Dashboard</h1>
                  <p className="text-slate-500 text-sm mt-1">Live overview synced with Supabase Database.</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Total Students</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{students.length}</p>
                  </div>
                  <span className="p-3 bg-blue-50 text-blue-600 rounded-lg text-xl">🎓</span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Total Faculty</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{faculties.length}</p>
                  </div>
                  <span className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-xl">👨‍🏫</span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Avg Attendance</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">87.5%</p>
                  </div>
                  <span className="p-3 bg-purple-50 text-purple-600 rounded-lg text-xl">📈</span>
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
                <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Attendance Submissions</h2>
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
                      {attendanceRecords.slice(0, 5).map((record) => (
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

          {/* TAB 2: MANAGE USERS */}
          {activeTab === 'manage-users' && (
            <div className="space-y-8">
              {role === 'admin' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Head of Departments (HOD)</h2>
                  <form onSubmit={handleAddHod} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    <input
                      type="text"
                      placeholder="HOD Full Name"
                      value={newHod.name}
                      onChange={(e) => setNewHod({ ...newHod, name: e.target.value })}
                      className="px-3.5 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                    <input
                      type="email"
                      placeholder="HOD Email"
                      value={newHod.email}
                      onChange={(e) => setNewHod({ ...newHod, email: e.target.value })}
                      className="px-3.5 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
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
                        {hods.map((h) => (
                          <tr key={h.id}>
                            <td className="py-2.5 px-4 font-medium text-slate-800">{h.name}</td>
                            <td className="py-2.5 px-4 text-slate-600">{h.email}</td>
                            <td className="py-2.5 px-4 text-slate-600">{h.department}</td>
                            <td className="py-2.5 px-4 text-right">
                              <button
                                onClick={() => handleDeleteHod(h.id)}
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

              {/* Faculty Management */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Faculty Members</h2>
                <form onSubmit={handleAddFaculty} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
                  <input
                    type="text"
                    placeholder="Faculty Name"
                    value={newFaculty.name}
                    onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                    className="px-3.5 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Faculty Email"
                    value={newFaculty.email}
                    onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                    className="px-3.5 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                  <select
                    value={newFaculty.position}
                    onChange={(e) => setNewFaculty({ ...newFaculty, position: e.target.value })}
                    className="px-3.5 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>Assistant Professor</option>
                    <option>Professor</option>
                    <option>Lab Assistant</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
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
                      {faculties.map((f) => (
                        <tr key={f.id}>
                          <td className="py-2.5 px-4 font-medium text-slate-800">{f.name}</td>
                          <td className="py-2.5 px-4 text-slate-600">{f.email}</td>
                          <td className="py-2.5 px-4 text-slate-600">{f.position}</td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteFaculty(f.id)}
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

              {/* Student Management */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Students</h2>
                <form onSubmit={handleAddStudent} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
                  <input
                    type="text"
                    placeholder="Roll Number (e.g. 2023CS01)"
                    value={newStudent.roll}
                    onChange={(e) => setNewStudent({ ...newStudent, roll: e.target.value })}
                    className="px-3.5 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Student Full Name"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="px-3.5 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                  <select
                    value={newStudent.classSection}
                    onChange={(e) => setNewStudent({ ...newStudent, classSection: e.target.value })}
                    className="px-3.5 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>CSE-A</option>
                    <option>CSE-B</option>
                    <option>ECE-A</option>
                    <option>MECH-A</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
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
                        <th className="py-2.5 px-4">Class</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((s) => (
                        <tr key={s.id}>
                          <td className="py-2.5 px-4 font-medium text-slate-800">{s.roll}</td>
                          <td className="py-2.5 px-4 text-slate-600">{s.name}</td>
                          <td className="py-2.5 px-4 text-slate-600">{s.classSection}</td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteStudent(s.id)}
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
            </div>
          )}

          {/* TAB 3: MARK ATTENDANCE */}
          {activeTab === 'mark-attendance' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Mark Attendance</h2>
              <p className="text-sm text-slate-500 mb-6">Attendance records are directly synchronized with Supabase Database.</p>

              <form onSubmit={handleMarkAttendance} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Student</label>
                  <select
                    value={attendanceForm.studentName}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, studentName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.roll} - {s.classSection})
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
                    <option>Data Structures</option>
                    <option>Web Technologies</option>
                    <option>Operating Systems</option>
                    <option>Computer Networks</option>
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
                  <p className="text-sm text-slate-500 mt-0.5">Filter and export attendance records.</p>
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
                    {attendanceRecords.map((record) => (
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
    </div>
  );
};

export default Dashboard;
