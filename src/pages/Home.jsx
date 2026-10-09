import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const departments = [
    { code: 'CSE', name: 'Computer Science & Engineering', icon: '💻', students: '360+', desc: 'AI, Cloud & Full-Stack Systems', highlight: true },
    { code: 'MECH', name: 'Mechanical Engineering', icon: '⚙️', students: '180+', desc: 'Robotics, Thermal & CAD/CAM Labs' },
    { code: 'ECE', name: 'Electronics & Communication', icon: '📡', students: '240+', desc: 'VLSI, Embedded & Signal Processing' },
    { code: 'EEE', name: 'Electrical & Electronics', icon: '⚡', students: '180+', desc: 'Power Systems & Automation' },
    { code: 'CIVIL', name: 'Civil Engineering', icon: '🏗️', students: '120+', desc: 'Structural & Surveying Labs' },
    { code: 'AI & DS', name: 'Artificial Intelligence & Data Science', icon: '🤖', students: '120+', desc: 'Machine Learning & Analytics' },
  ];

  const features = [
    {
      title: 'Real-Time Attendance',
      desc: 'Instant digital attendance tracking with cloud synchronization on Supabase.',
      icon: '⏱️'
    },
    {
      title: 'Strict Role Hierarchy',
      desc: 'Seamless delegation between Principal/Admin, Department HODs, Faculty, and Students.',
      icon: '🏛️'
    },
    {
      title: 'Automated Reports',
      desc: 'Generate, filter, and export classroom attendance registers directly in PDF and Excel formats.',
      icon: '📊'
    },
    {
      title: 'Student Portal',
      desc: 'Transparent self-monitoring portal for students to track subject-wise eligibility in real-time.',
      icon: '🎓'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top College Header Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-slate-400 gap-2">
          <div className="flex items-center space-x-4">
            <span>📍 P.Kothakota, Chittoor - Tirupati Highway, AP</span>
            <span className="hidden md:inline">| Approved by AICTE, Affiliated to JNTUA</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-300">
            <span className="text-emerald-400 font-semibold">● Accredited by NAAC</span>
            <span>EAMCET / ECET Code: <strong className="text-white">VEMU</strong></span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3.5 group">
            <div className="h-14 w-14 rounded-full bg-white p-0.5 shadow-lg ring-2 ring-blue-500/40 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src="/vemu_emblem.png"
                alt="VEMU Logo"
                className="h-full w-full object-contain rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl tracking-tight text-white group-hover:text-blue-400 transition">
                  VEMU
                </span>
                <span className="text-xs bg-blue-600/30 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-bold">
                  SAMS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wider uppercase font-semibold">
                Institute of Technology
              </p>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <a
              href="#about"
              className="text-sm font-medium text-slate-300 hover:text-white transition hidden md:inline"
            >
              About SAMS
            </a>
            <a
              href="#departments"
              className="text-sm font-medium text-slate-300 hover:text-white transition hidden md:inline"
            >
              Departments
            </a>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition transform hover:-translate-y-0.5"
            >
              Portal Login →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with College Campus Background */}
      <section className="relative min-h-[620px] flex items-center justify-center overflow-hidden">
        {/* Background Campus Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/campas1.jpg"
            alt="VEMU Campus"
            className="w-full h-full object-cover object-center scale-105 filter brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-950/70"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-6 backdrop-blur-md">
            <span>🏛️ Official Academic Portal</span>
            <span>•</span>
            <span>VEMU Institute of Technology</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Student Attendance <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300">
              Management System
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Centralized role-based attendance workflow designed for Admin, Heads of Departments, Faculty members, and Students with real-time cloud data synchronization.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>Access SAMS Portal</span>
              <span>➔</span>
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-base border border-slate-700 backdrop-blur-sm transition"
            >
              Explore Features
            </a>
          </div>

          {/* Quick Stats Pill */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <p className="text-xs text-slate-400 font-medium">Departments</p>
              <p className="text-2xl font-black text-white mt-0.5">6+</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <p className="text-xs text-slate-400 font-medium">Active Students</p>
              <p className="text-2xl font-black text-blue-400 mt-0.5">1,200+</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <p className="text-xs text-slate-400 font-medium">Faculty Staff</p>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">90+</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <p className="text-xs text-slate-400 font-medium">Cloud Database</p>
              <p className="text-2xl font-black text-purple-400 mt-0.5">Live Sync</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Capabilities</p>
            <h2 className="text-3xl font-bold text-white mt-2">Why VEMU SAMS?</h2>
            <p className="text-sm text-slate-400 mt-2">
              Transforming traditional register books into a streamlined digital attendance ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-blue-500/50 transition hover:-translate-y-1 group"
              >
                <div className="text-3xl p-3 bg-slate-900 rounded-xl w-fit mb-4 border border-slate-800 group-hover:scale-110 transition">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Academic Branches</p>
            <h2 className="text-3xl font-bold text-white mt-2">Undergraduate Departments</h2>
            <p className="text-sm text-slate-400 mt-2">
              Attendance management deployed across all primary engineering disciplines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {departments.map((dept) => (
              <div
                key={dept.code}
                className={`p-5 rounded-xl border transition ${
                  dept.highlight
                    ? 'bg-gradient-to-br from-slate-900 to-blue-950/60 border-blue-500/60 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                } flex flex-col justify-between`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    <span className="text-2xl p-2.5 bg-slate-800 rounded-lg">{dept.icon}</span>
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        {dept.name}
                        {dept.highlight && (
                          <span className="text-[10px] bg-blue-500 text-white font-extrabold px-1.5 py-0.5 rounded uppercase">
                            Core
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Code: {dept.code}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                    {dept.students}
                  </span>
                </div>
                {dept.desc && (
                  <p className="text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-800/80">
                    {dept.desc}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Development Team Section */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
              <span>👥 Student Innovation</span>
            </div>
            <h2 className="text-3xl font-bold text-white">Project Development Team</h2>
            <p className="text-sm text-slate-400 mt-2">
              Designed and developed by students of VEMU Institute of Technology for the academic community.
            </p>
          </div>

          {/* 4 Team Members Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {/* Team Lead: VAMSI BUTHALA */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-900/40 to-slate-900 border-2 border-blue-500/60 shadow-xl text-center relative overflow-hidden group hover:-translate-y-1 transition duration-200">
              <div className="absolute top-3 right-3 bg-blue-500 text-white text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full shadow">
                Lead
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 p-0.5 mx-auto mb-3 shadow-lg flex items-center justify-center text-3xl">
                👨‍💻
              </div>
              <h3 className="text-lg font-black text-white tracking-wide">VAMSI BUTHALA</h3>
              <p className="text-xs text-blue-300 font-semibold mt-1">Team Lead & Developer</p>
              <p className="text-[11px] text-slate-300 font-medium mt-1">B.Tech • Computer Science & Engineering</p>
              <p className="text-[11px] text-slate-400 mt-2">Project Architecture, React & Cloud Sync</p>
            </div>

            {/* C . BHARATH */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 shadow-lg text-center hover:border-slate-500 transition duration-200 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-full bg-slate-700 p-0.5 mx-auto mb-3 shadow-md flex items-center justify-center text-3xl">
                👨‍🎓
              </div>
              <h3 className="text-lg font-black text-white tracking-wide">C . BHARATH</h3>
              <p className="text-xs text-slate-300 font-semibold mt-1">Team Member</p>
              <p className="text-[11px] text-slate-300 font-medium mt-1">B.Tech • Computer Science & Engineering</p>
              <p className="text-[11px] text-slate-400 mt-2">System Development & Module Testing</p>
            </div>

            {/* C. GANESH KUMAR RAJU */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 shadow-lg text-center hover:border-slate-500 transition duration-200 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-full bg-slate-700 p-0.5 mx-auto mb-3 shadow-md flex items-center justify-center text-3xl">
                👨‍🎓
              </div>
              <h3 className="text-lg font-black text-white tracking-wide">C. GANESH KUMAR RAJU</h3>
              <p className="text-xs text-slate-300 font-semibold mt-1">Team Member</p>
              <p className="text-[11px] text-slate-300 font-medium mt-1">B.Tech • Computer Science & Engineering</p>
              <p className="text-[11px] text-slate-400 mt-2">Frontend Integration & Workflow Design</p>
            </div>

            {/* C. BALAJI */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 shadow-lg text-center hover:border-slate-500 transition duration-200 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-full bg-slate-700 p-0.5 mx-auto mb-3 shadow-md flex items-center justify-center text-3xl">
                👨‍🎓
              </div>
              <h3 className="text-lg font-black text-white tracking-wide">C. BALAJI</h3>
              <p className="text-xs text-slate-300 font-semibold mt-1">Team Member</p>
              <p className="text-[11px] text-slate-300 font-medium mt-1">B.Tech • Computer Science & Engineering</p>
              <p className="text-[11px] text-slate-400 mt-2">Database Modeling & Quality Assurance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-t border-b border-blue-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-white p-0.5 ring-4 ring-white/30 shadow-2xl flex items-center justify-center overflow-hidden">
            <img
              src="/vemu_emblem.png"
              alt="VEMU"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to record or view attendance?
          </h2>
          <p className="text-sm text-blue-200 mt-2 max-w-xl mx-auto">
            Log in with your institutional credentials to access your designated portal dashboard.
          </p>
          <div className="mt-6">
            <Link
              to="/login"
              className="px-8 py-3 rounded-xl bg-white text-blue-950 font-black text-sm hover:bg-blue-50 transition shadow-xl inline-block"
            >
              Sign In to Portal →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-slate-900 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-11 w-11 rounded-full bg-white p-0.5 shadow flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src="/vemu_emblem.png" alt="Logo" className="h-full w-full object-contain rounded-full" />
              </div>
              <div>
                <p className="text-slate-200 font-bold text-sm">
                  VEMU INSTITUTE OF TECHNOLOGY
                </p>
                <p className="text-slate-400 text-xs">
                  Student Attendance Management System (SAMS)
                </p>
              </div>
            </div>
            <p className="text-slate-500">© {new Date().getFullYear()} VEMU IT. All rights reserved.</p>
          </div>

          {/* Dedicated Team Members Details in Footer */}
          <div className="border-t border-slate-800/80 pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Project Developers:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950 border border-blue-500/50 text-blue-200 font-bold text-xs">
                    👑 VAMSI BUTHALA <span className="text-[10px] text-blue-400 font-normal">(Team Lead)</span>
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-semibold text-xs">
                    C . BHARATH
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-semibold text-xs">
                    C. GANESH KUMAR RAJU
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-semibold text-xs">
                    C. BALAJI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
