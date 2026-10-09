import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, addUser, deleteUser } from '../authStore';
import { supabase } from '../supabaseClient';

const Dashboard = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('admin');
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userFilterRole, setUserFilterRole] = useState('all');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportSubjectFilter, setReportSubjectFilter] = useState('all');
  const [reportStatusFilter, setReportStatusFilter] = useState('all');

  // Users by role
  const [allUsers, setAllUsers] = useState([]);

  // Forms for adding users
  const [hodForm, setHodForm] = useState({ name: '', email: '', password: '', department: 'CSE' });
  const [facultyForm, setFacultyForm] = useState({ name: '', email: '', password: '', department: 'CSE', position: 'Assistant Professor' });
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '', roll: '', department: 'CSE-A' });

  // Add User Active Form Tab (for admin/hod)
  const [addUserType, setAddUserType] = useState('student');

  // Attendance Records
  const [attendanceRecords, setAttendanceRecords] = useState([
    { id: 'att-1', studentName: 'Rahul Varma', roll: '22CS01', subject: 'Data Structures & Algorithms', date: '2026-10-08', status: 'Present' },
    { id: 'att-2', studentName: 'Sneha Reddy', roll: '22CS02', subject: 'Data Structures & Algorithms', date: '2026-10-08', status: 'Present' },
    { id: 'att-3', studentName: 'Karthik Raju', roll: '22CS03', subject: 'Data Structures & Algorithms', date: '2026-10-08', status: 'Absent' },
    { id: 'att-4', studentName: 'Rahul Varma', roll: '22CS01', subject: 'Web Technologies & Cloud', date: '2026-10-09', status: 'Present' },
    { id: 'att-5', studentName: 'Priya Sharma', roll: '22CS04', subject: 'Web Technologies & Cloud', date: '2026-10-09', status: 'Present' },
    { id: 'att-6', studentName: 'Anil Kumar', roll: '22CS05', subject: 'Operating Systems', date: '2026-10-09', status: 'Late' },
  ]);

  const [attendanceForm, setAttendanceForm] = useState({
    studentName: 'Rahul Varma',
    subject: 'Data Structures & Algorithms',
    date: new Date().toISOString().split('T')[0],
    status: 'Present'
  });

  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    const users = getUsers();
    setAllUsers(users);

    try {
      const { data, error } = await supabase.from('attendance').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setAttendanceRecords(data.map(d => ({
          id: d.id,
          studentName: d.student_name,
          roll: d.roll_number || 'STU',
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

  // 1. ADD HOD
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
      showNotification(`HOD "${hodForm.name}" added successfully!`);
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  // 2. ADD FACULTY
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

  // 3. ADD STUDENT
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
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id, role);
      setAllUsers(getUsers());
      showNotification('User deleted successfully.');
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  // MARK ATTENDANCE
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

    showNotification(`Attendance for "${attendanceForm.studentName}" recorded as ${attendanceForm.status}!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Student Name', 'Subject', 'Date', 'Status'];
    const rows = attendanceRecords.map(r => [r.id, `"${r.studentName}"`, `"${r.subject}"`, r.date, r.status]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VEMU_SAMS_Attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Attendance register exported as CSV!');
  };

  // Filtered Users
  const hodsList = allUsers.filter(u => u.role === 'hod');
  const facultiesList = allUsers.filter(u => u.role === 'faculty');
  const studentsList = allUsers.filter(u => u.role === 'student');

  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      const matchRole = userFilterRole === 'all' || u.role === userFilterRole;
      const matchSearch = !userSearchTerm || 
        (u.full_name && u.full_name.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
        (u.roll_number && u.roll_number.toLowerCase().includes(userSearchTerm.toLowerCase()));
      return matchRole && matchSearch;
    });
  }, [allUsers, userFilterRole, userSearchTerm]);

  // Filtered Attendance Reports
  const filteredReports = useMemo(() => {
    return attendanceRecords.filter(r => {
      // If student, only see own records
      if (role === 'student' && currentUser?.full_name) {
        if (!r.studentName.toLowerCase().includes(currentUser.full_name.toLowerCase())) {
          return false;
        }
      }
      const matchSearch = !reportSearchTerm || 
        r.studentName.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
        (r.roll && r.roll.toLowerCase().includes(reportSearchTerm.toLowerCase()));
      const matchSubject = reportSubjectFilter === 'all' || r.subject === reportSubjectFilter;
      const matchStatus = reportStatusFilter === 'all' || r.status === reportStatusFilter;
      return matchSearch && matchSubject && matchStatus;
    });
  }, [attendanceRecords, role, currentUser, reportSearchTerm, reportSubjectFilter, reportStatusFilter]);

  // Student specific stats
  const studentRecords = attendanceRecords.filter(r => 
    !currentUser?.full_name || r.studentName.toLowerCase().includes(currentUser.full_name.toLowerCase())
  );
  const studentTotal = studentRecords.length || 1;
  const studentPresents = studentRecords.filter(r => r.status === 'Present').length;
  const studentPercent = Math.round((studentPresents / studentTotal) * 100);

  // Hierarchy Permissions Check
  const canManageHods = role === 'admin';
  const canManageFaculty = role === 'admin' || role === 'hod';
  const canManageStudents = role === 'admin' || role === 'hod' || role === 'faculty';
  const canMarkAttendance = role === 'admin' || role === 'hod' || role === 'faculty';

  // Role Theme Accents
  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return { label: 'Admin Portal', color: 'from-blue-600 to-indigo-600', ring: 'ring-blue-500/30', icon: '👑' };
      case 'hod':
        return { label: 'HOD Portal', color: 'from-emerald-600 to-teal-600', ring: 'ring-emerald-500/30', icon: '🏛️' };
      case 'faculty':
        return { label: 'Faculty Portal', color: 'from-purple-600 to-indigo-600', ring: 'ring-purple-500/30', icon: '👨‍🏫' };
      case 'student':
        return { label: 'Student Portal', color: 'from-cyan-600 to-blue-600', ring: 'ring-cyan-500/30', icon: '🎓' };
      default:
        return { label: 'Portal', color: 'from-blue-600 to-indigo-600', ring: 'ring-blue-500/30', icon: '🏛️' };
    }
  };

  const roleMeta = getRoleBadge();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/50"
              title="Toggle Sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Circular Logo Badge */}
            <div className="flex items-center space-x-3">
              <div className="h-11 w-11 rounded-full bg-white p-0.5 shadow-md ring-2 ring-blue-500/40 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src="/vemu_emblem.png"
                  alt="VEMU Logo"
                  className="h-full w-full object-contain rounded-full"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-xl tracking-tight text-white">VEMU</span>
                  <span className="text-[11px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                    SAMS
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold hidden sm:block">
                  Student Attendance Management System
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Live Clock Pill */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{currentTime}</span>
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${roleMeta.color} flex items-center justify-center text-sm shadow font-bold text-white`}>
                {roleMeta.icon}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">{currentUser?.full_name || 'Authorized User'}</p>
                <p className="text-[10px] text-slate-400 font-mono leading-tight">{currentUser?.email || `${role}@vemu.edu`}</p>
              </div>
              <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-extrabold bg-gradient-to-r ${roleMeta.color} text-white shadow-sm`}>
                {role}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-xs bg-red-600/90 hover:bg-red-600 text-white font-bold py-2 px-3.5 rounded-xl transition shadow-lg shadow-red-600/20 flex items-center gap-1.5 border border-red-500/40"
              title="Logout of session"
            >
              <span>Logout</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Toast */}
      {feedbackMsg && (
        <div className={`py-2.5 px-4 text-center text-xs font-bold tracking-wide transition-all shadow-md ${
          feedbackMsg.isError ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {feedbackMsg.text}
        </div>
      )}

      <div className="flex flex-1">
        {/* Modern Sidebar */}
        {isSidebarOpen && (
          <aside className="w-64 bg-slate-900/95 backdrop-blur-md text-slate-300 flex-shrink-0 border-r border-slate-800 flex flex-col justify-between py-6 px-3">
            <nav className="space-y-1.5">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold rounded-xl transition ${
                  activeTab === 'overview'
                    ? `bg-gradient-to-r ${roleMeta.color} text-white shadow-lg shadow-blue-500/20`
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-base">📊</span>
                  <span>Dashboard Overview</span>
                </div>
              </button>

              {/* Role-based User Management Tab */}
              {(canManageHods || canManageFaculty || canManageStudents) && (
                <button
                  onClick={() => setActiveTab('manage-users')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold rounded-xl transition ${
                    activeTab === 'manage-users'
                      ? `bg-gradient-to-r ${roleMeta.color} text-white shadow-lg shadow-blue-500/20`
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-base">👥</span>
                    <span>{role === 'faculty' ? 'Manage Students' : 'User Management'}</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                    {role === 'faculty' ? studentsList.length : allUsers.length}
                  </span>
                </button>
              )}

              {/* Mark Attendance Tab */}
              {canMarkAttendance && (
                <button
                  onClick={() => setActiveTab('mark-attendance')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold rounded-xl transition ${
                    activeTab === 'mark-attendance'
                      ? `bg-gradient-to-r ${roleMeta.color} text-white shadow-lg shadow-blue-500/20`
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-base">✍️</span>
                    <span>Mark Attendance</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    Live
                  </span>
                </button>
              )}

              {/* Reports Tab */}
              <button
                onClick={() => setActiveTab('attendance-records')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold rounded-xl transition ${
                  activeTab === 'attendance-records'
                    ? `bg-gradient-to-r ${roleMeta.color} text-white shadow-lg shadow-blue-500/20`
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-base">📋</span>
                  <span>{role === 'student' ? 'My Attendance Register' : 'Attendance Reports'}</span>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                  {attendanceRecords.length}
                </span>
              </button>
            </nav>

            {/* Hierarchy Scope Card */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-200">Role Authority</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  {role}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {role === 'admin' && 'Full Administrative Control: Authority over HODs, Faculty, Students & Cloud Registers.'}
                {role === 'hod' && 'Department Leadership: Authority over Faculty staff, Students & Department attendance records.'}
                {role === 'faculty' && 'Academic Instructor: Direct classroom attendance entry and student performance monitoring.'}
                {role === 'student' && 'Transparent Student Portal: Real-time subject eligibility and examination attendance logs.'}
              </p>
              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                <span>Supabase Sync</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Active
                </span>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content Workspace */}
        <main className="flex-1 p-5 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Role Greeting Banner */}
              <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-3">
                      <span>🏛️ VEMU Institute of Technology</span>
                      <span>•</span>
                      <span>Academic Session 2026-27</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">{currentUser?.full_name || role.toUpperCase()}</span>!
                    </h1>
                    <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      {role === 'admin' && 'Master attendance management interface. Monitor college-wide attendance rates, manage institutional accounts, and export registers.'}
                      {role === 'hod' && 'Departmental monitoring suite. Track department faculties, student strengths, and verify daily classroom attendance logs.'}
                      {role === 'faculty' && 'Instructor control desk. Mark real-time attendance for your assigned lectures and generate student eligibility sheets.'}
                      {role === 'student' && 'Personal attendance dashboard. Track your subject-wise presence percentage and verify university examination eligibility.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {canMarkAttendance && (
                      <button
                        onClick={() => setActiveTab('mark-attendance')}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2"
                      >
                        <span>✍️ Take Attendance</span>
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab('attendance-records')}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center gap-2"
                    >
                      <span>📋 View Registers</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* STATS CARDS: Tailored per Role */}
              {role === 'student' ? (
                /* Student Specific Visual KPI Cards */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Attendance Percentage Gauge Card */}
                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Attendance</p>
                      <p className="text-3xl font-black text-white mt-1.5">{studentPercent}%</p>
                      <span className={`inline-block mt-2 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        studentPercent >= 75
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {studentPercent >= 75 ? '✅ Exam Eligible (≥ 75%)' : '⚠️ Below Exam Condonation'}
                      </span>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl shadow-inner border border-slate-700">
                      🎯
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Classes Attended</p>
                      <p className="text-3xl font-black text-emerald-400 mt-1.5">{studentPresents}</p>
                      <p className="text-xs text-slate-400 mt-1">Out of {studentTotal} logged periods</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-emerald-950/60 flex items-center justify-center text-3xl border border-emerald-500/30">
                      ✅
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Missed Sessions</p>
                      <p className="text-3xl font-black text-red-400 mt-1.5">{studentTotal - studentPresents}</p>
                      <p className="text-xs text-slate-400 mt-1">Absent or unexcused</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-red-950/60 flex items-center justify-center text-3xl border border-red-500/30">
                      ⚠️
                    </div>
                  </div>
                </div>
              ) : (
                /* Admin, HOD, Faculty KPI Metric Cards */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between hover:border-slate-700 transition">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Students</p>
                      <p className="text-2xl font-black text-white mt-1">{studentsList.length}</p>
                      <span className="text-[11px] text-blue-400 font-semibold mt-1 inline-block">Active Roster</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-2xl">
                      🎓
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between hover:border-slate-700 transition">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faculty Staff</p>
                      <p className="text-2xl font-black text-white mt-1">{facultiesList.length}</p>
                      <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">Teaching Instructors</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl">
                      👨‍🏫
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between hover:border-slate-700 transition">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Departments & HODs</p>
                      <p className="text-2xl font-black text-white mt-1">{hodsList.length || 6}</p>
                      <span className="text-[11px] text-purple-400 font-semibold mt-1 inline-block">Engineering Core</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-2xl">
                      🏛️
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between hover:border-slate-700 transition">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Logs</p>
                      <p className="text-2xl font-black text-white mt-1">{attendanceRecords.length}</p>
                      <span className="text-[11px] text-cyan-400 font-semibold mt-1 inline-block">Supabase Cloud Sync</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl">
                      📑
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Activity Table */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-white">Recent Attendance Logs</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Real-time classroom presence updates synced from database.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('attendance-records')}
                    className="text-xs text-blue-400 hover:text-blue-300 font-bold transition flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>View Full Register</span>
                    <span>→</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="min-w-full divide-y divide-slate-800 text-sm">
                    <thead>
                      <tr className="bg-slate-950/80 text-slate-400 text-left text-xs font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {attendanceRecords.slice(0, 6).map((record) => (
                        <tr key={record.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs">👤</span>
                            <span>{record.studentName}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 font-medium">{record.subject}</td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">{record.date}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                                record.status === 'Present'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : record.status === 'Late'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
                              }`}
                            >
                              <span>{record.status === 'Present' ? '●' : '●'}</span>
                              <span>{record.status}</span>
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
          {activeTab === 'manage-users' && (canManageHods || canManageFaculty || canManageStudents) && (
            <div className="space-y-6">
              {/* Header & Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
                <div>
                  <h1 className="text-xl font-bold text-white">Institutional User Directory</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage role accounts based on your hierarchy authorization.
                  </p>
                </div>

                {/* Filter and Search */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() => setUserFilterRole('all')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition ${userFilterRole === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      All ({allUsers.length})
                    </button>
                    {canManageHods && (
                      <button
                        onClick={() => setUserFilterRole('hod')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition ${userFilterRole === 'hod' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        HODs ({hodsList.length})
                      </button>
                    )}
                    {canManageFaculty && (
                      <button
                        onClick={() => setUserFilterRole('faculty')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition ${userFilterRole === 'faculty' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        Faculty ({facultiesList.length})
                      </button>
                    )}
                    <button
                      onClick={() => setUserFilterRole('student')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition ${userFilterRole === 'student' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Students ({studentsList.length})
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Search name, email, roll..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Add User Workspace */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <span>➕ Add New User</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Select role type to provision new access credentials.</p>
                  </div>

                  {/* Switcher for which user to add */}
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    {canManageHods && (
                      <button
                        onClick={() => setAddUserType('hod')}
                        className={`px-3 py-1 rounded-lg font-bold transition ${addUserType === 'hod' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                      >
                        + HOD
                      </button>
                    )}
                    {canManageFaculty && (
                      <button
                        onClick={() => setAddUserType('faculty')}
                        className={`px-3 py-1 rounded-lg font-bold transition ${addUserType === 'faculty' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                      >
                        + Faculty
                      </button>
                    )}
                    <button
                      onClick={() => setAddUserType('student')}
                      className={`px-3 py-1 rounded-lg font-bold transition ${addUserType === 'student' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                    >
                      + Student
                    </button>
                  </div>
                </div>

                {/* 1. Add HOD Form */}
                {addUserType === 'hod' && canManageHods && (
                  <form onSubmit={handleAddHod} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <input
                      type="text"
                      placeholder="HOD Full Name"
                      value={hodForm.name}
                      onChange={(e) => setHodForm({ ...hodForm, name: e.target.value })}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                      required
                    />
                    <input
                      type="email"
                      placeholder="HOD Institutional Email"
                      value={hodForm.email}
                      onChange={(e) => setHodForm({ ...hodForm, email: e.target.value })}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Password (default: hod@123)"
                      value={hodForm.password}
                      onChange={(e) => setHodForm({ ...hodForm, password: e.target.value })}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-lg shadow-blue-600/20"
                    >
                      Save HOD Account
                    </button>
                  </form>
                )}

                {/* 2. Add Faculty Form */}
                {addUserType === 'faculty' && canManageFaculty && (
                  <form onSubmit={handleAddFaculty} className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <input
                      type="text"
                      placeholder="Faculty Full Name"
                      value={facultyForm.name}
                      onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Faculty Email"
                      value={facultyForm.email}
                      onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Password (default: faculty@123)"
                      value={facultyForm.password}
                      onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                    />
                    <select
                      value={facultyForm.position}
                      onChange={(e) => setFacultyForm({ ...facultyForm, position: e.target.value })}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-300 outline-none"
                    >
                      <option>Assistant Professor</option>
                      <option>Associate Professor</option>
                      <option>Professor & Head</option>
                      <option>Lab Instructor</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-lg shadow-emerald-600/20"
                    >
                      Save Faculty
                    </button>
                  </form>
                )}

                {/* 3. Add Student Form */}
                {addUserType === 'student' && canManageStudents && (
                  <form onSubmit={handleAddStudent} className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <input
                      type="text"
                      placeholder="Roll Number (e.g. 23CS01)"
                      value={studentForm.roll}
                      onChange={(e) => setStudentForm({ ...studentForm, roll: e.target.value })}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Student Full Name"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Student Email (optional)"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Password (default: student@123)"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-lg shadow-indigo-600/20"
                    >
                      Save Student
                    </button>
                  </form>
                )}
              </div>

              {/* Users Directory Table */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
                <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Showing {filteredUsers.length} Users
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800 text-sm">
                    <thead>
                      <tr className="bg-slate-950/80 text-slate-400 text-left text-xs font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Department / Identifier</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300">
                                {u.full_name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-white text-xs">{u.full_name}</p>
                                <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                              u.role === 'admin'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : u.role === 'hod'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : u.role === 'faculty'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-300">
                            {u.roll_number ? (
                              <span className="font-mono font-bold bg-slate-800 px-2 py-0.5 rounded text-blue-300">
                                {u.roll_number}
                              </span>
                            ) : (
                              <span>{u.department || 'CSE'}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 text-xs font-bold transition"
                              >
                                Delete
                              </button>
                            )}
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
          {activeTab === 'mark-attendance' && canMarkAttendance && (
            <div className="max-w-2xl mx-auto rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-2">
                  <span>✍️ Real-Time Attendance Entry</span>
                </div>
                <h2 className="text-xl font-black text-white">Record Student Attendance</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Entries are synchronized immediately with Supabase cloud database.
                </p>
              </div>

              <form onSubmit={handleMarkAttendance} className="space-y-5">
                {/* Select Student */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Student
                  </label>
                  <select
                    value={attendanceForm.studentName}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, studentName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-blue-500 outline-none"
                  >
                    {studentsList.map((s) => (
                      <option key={s.id} value={s.full_name}>
                        {s.full_name} ({s.roll_number || s.roll || 'Student'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Subject */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Subject Course
                  </label>
                  <select
                    value={attendanceForm.subject}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-blue-500 outline-none"
                  >
                    <option>Data Structures & Algorithms</option>
                    <option>Web Technologies & Cloud</option>
                    <option>Operating Systems</option>
                    <option>Database Management Systems</option>
                    <option>Artificial Intelligence & ML</option>
                    <option>Computer Networks</option>
                  </select>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Attendance Date
                  </label>
                  <input
                    type="date"
                    value={attendanceForm.date}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                {/* Interactive Status Buttons */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Attendance Status
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setAttendanceForm({ ...attendanceForm, status: 'Present' })}
                      className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition ${
                        attendanceForm.status === 'Present'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span>✅</span>
                      <span>Present</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttendanceForm({ ...attendanceForm, status: 'Absent' })}
                      className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition ${
                        attendanceForm.status === 'Absent'
                          ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span>❌</span>
                      <span>Absent</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttendanceForm({ ...attendanceForm, status: 'Late' })}
                      className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition ${
                        attendanceForm.status === 'Late'
                          ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/30'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span>⏳</span>
                      <span>Late</span>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm transition shadow-xl shadow-emerald-600/20"
                  >
                    Confirm & Save to Cloud →
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: ATTENDANCE RECORDS */}
          {activeTab === 'attendance-records' && (
            <div className="space-y-6">
              {/* Header and Filter Bar */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-white">Attendance Register & Reports</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    {role === 'student' ? 'Personal attendance log and subject-wise lecture presence.' : 'Review, filter, and export classroom attendance registers.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>📊 Export CSV</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>🖨️ Print / PDF</span>
                  </button>
                </div>
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <input
                  type="text"
                  placeholder="Filter student or roll..."
                  value={reportSearchTerm}
                  onChange={(e) => setReportSearchTerm(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />

                <select
                  value={reportSubjectFilter}
                  onChange={(e) => setReportSubjectFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none"
                >
                  <option value="all">All Subjects</option>
                  <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                  <option value="Web Technologies & Cloud">Web Technologies & Cloud</option>
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Database Management Systems">Database Management Systems</option>
                </select>

                <select
                  value={reportStatusFilter}
                  onChange={(e) => setReportStatusFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Present">Present Only</option>
                  <option value="Absent">Absent Only</option>
                  <option value="Late">Late Only</option>
                </select>
              </div>

              {/* Attendance Table */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
                <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Showing {filteredReports.length} Record Entries</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800 text-sm">
                    <thead>
                      <tr className="bg-slate-950/80 text-slate-400 text-left text-xs font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredReports.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs">👤</span>
                            <span>{record.studentName}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 font-medium">{record.subject}</td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">{record.date}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                                record.status === 'Present'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : record.status === 'Late'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
                              }`}
                            >
                              <span>{record.status === 'Present' ? '●' : '●'}</span>
                              <span>{record.status}</span>
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
        </main>
      </div>

      {/* Dashboard Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 text-slate-500 py-4 px-6 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} VEMU SAMS • Student Attendance Management System</p>
        <p className="text-[11px] text-slate-400">
          Developed by <strong className="text-blue-400 font-semibold">VAMSI BUTHALA</strong> (Lead), C . BHARATH, C. GANESH KUMAR RAJU, C. BALAJI • B.Tech Computer Science & Engineering
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
