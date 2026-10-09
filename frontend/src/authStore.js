import { supabase } from './supabaseClient';

export const DEFAULT_ADMIN = {
  id: 'admin-001',
  full_name: 'Main Administrator',
  email: 'admin@vemu.edu',
  password: 'admin@123',
  role: 'admin',
  department: 'Administration'
};

const DEFAULT_USERS = [
  DEFAULT_ADMIN,
  {
    id: 'hod-001',
    full_name: 'Dr. Ramesh Kumar',
    email: 'ramesh.hod@vemu.edu',
    password: 'hod@123',
    role: 'hod',
    department: 'CSE'
  },
  {
    id: 'fac-001',
    full_name: 'Prof. Suresh V',
    email: 'suresh.fac@vemu.edu',
    password: 'faculty@123',
    role: 'faculty',
    department: 'CSE',
    position: 'Assistant Professor'
  },
  {
    id: 'stu-001',
    full_name: 'Rahul Varma',
    email: 'rahul.stu@vemu.edu',
    password: 'student@123',
    role: 'student',
    roll_number: '2023CS01',
    department: 'CSE-A'
  }
];

// Initialize users in localStorage if empty
export const getUsers = () => {
  const local = localStorage.getItem('sams_users');
  if (!local) {
    localStorage.setItem('sams_users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  try {
    const parsed = JSON.parse(local);
    // Ensure default admin always exists
    if (!parsed.some(u => u.email === DEFAULT_ADMIN.email)) {
      parsed.unshift(DEFAULT_ADMIN);
      localStorage.setItem('sams_users', JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return DEFAULT_USERS;
  }
};

// Authenticate user against Supabase and local users
export const authenticateUser = async (role, email, password) => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  // 1. Check Default Super Admin immediately
  if (role === 'admin' && cleanEmail === DEFAULT_ADMIN.email.toLowerCase() && cleanPass === DEFAULT_ADMIN.password) {
    return { success: true, user: DEFAULT_ADMIN };
  }

  // 2. Check Supabase profiles if available
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', cleanEmail)
      .eq('role', role)
      .maybeSingle();

    if (!error && data) {
      if (!data.password || data.password === cleanPass) {
        return { success: true, user: data };
      }
    }
  } catch (err) {
    console.warn('Supabase auth fallback:', err);
  }

  // 3. Check local users store
  const allUsers = getUsers();
  const found = allUsers.find(
    u => u.email.toLowerCase() === cleanEmail && u.role === role && u.password === cleanPass
  );

  if (found) {
    return { success: true, user: found };
  }

  return { success: false, error: 'Invalid Email, Password or selected Role!' };
};

// Add user respecting hierarchy
export const addUser = async (userObj, currentRole) => {
  // Permission checks
  if (currentRole === 'faculty' && userObj.role !== 'student') {
    throw new Error('Faculty can only add Students!');
  }
  if (currentRole === 'hod' && userObj.role === 'admin') {
    throw new Error('HOD cannot add Admin accounts!');
  }
  if (currentRole === 'student') {
    throw new Error('Students are not permitted to add users!');
  }

  const allUsers = getUsers();
  if (allUsers.some(u => u.email.toLowerCase() === userObj.email.toLowerCase())) {
    throw new Error('A user with this Email already exists!');
  }

  const newUser = {
    ...userObj,
    id: userObj.id || `user_${Date.now()}`
  };

  allUsers.push(newUser);
  localStorage.setItem('sams_users', JSON.stringify(allUsers));

  // Sync to Supabase
  try {
    await supabase.from('profiles').insert([{
      full_name: newUser.full_name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department || 'General',
      roll_number: newUser.roll_number || null,
      password: newUser.password
    }]);
  } catch (err) {
    console.warn('Sync to Supabase notice:', err);
  }

  return newUser;
};

// Delete user
export const deleteUser = async (id, currentRole) => {
  if (currentRole === 'student') {
    throw new Error('Students cannot delete users!');
  }
  const allUsers = getUsers().filter(u => u.id !== id);
  localStorage.setItem('sams_users', JSON.stringify(allUsers));

  try {
    await supabase.from('profiles').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase delete notice:', err);
  }
};
