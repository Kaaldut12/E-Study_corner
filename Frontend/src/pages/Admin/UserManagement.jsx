// frontend/src/pages/Admin/UserManagement.jsx
import { useEffect, useState, useMemo } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ALL_SYSTEM_PERMISSIONS = [
  { id: 'manage_users', label: 'Manage Users', category: 'Administration', description: 'Create, update, and manage accounts' },
  { id: 'manage_roles', label: 'Manage Roles', category: 'Administration', description: 'Assign roles & custom access' },
  { id: 'view_analytics', label: 'View Analytics', category: 'Administration', description: 'Platform statistics & reports' },
  { id: 'create_courses', label: 'Create Courses', category: 'Academics', description: 'Design syllabus and publish courses' },
  { id: 'manage_courses', label: 'Manage Courses', category: 'Academics', description: 'Edit lessons & modules' },
  { id: 'create_assignments', label: 'Create Assignments', category: 'Academics', description: 'Publish homework & deadlines' },
  { id: 'grade_submissions', label: 'Grade Submissions', category: 'Academics', description: 'Grade work & provide feedback' },
  { id: 'submit_assignments', label: 'Submit Assignments', category: 'Academics', description: 'Upload homework solutions' },
  { id: 'manage_quizzes', label: 'Manage Quizzes', category: 'Examinations', description: 'Create question banks & tests' },
  { id: 'take_quizzes', label: 'Take Quizzes', category: 'Examinations', description: 'Participate in quizzes' },
  { id: 'upload_materials', label: 'Upload Materials', category: 'Resources', description: 'Upload notes & PDFs' },
  { id: 'download_materials', label: 'Download Materials', category: 'Resources', description: 'Download study resources' },
  { id: 'manage_notifications', label: 'Broadcast Announcements', category: 'Communication', description: 'Send campus notifications' },
  { id: 'manage_enquiries', label: 'Manage Enquiries', category: 'Communication', description: 'Support tickets & inquiries' },
  { id: 'access_ai_coach', label: 'Access AI Coach', category: 'AI Learning', description: 'Use AI study tutor' }
];

const DEFAULT_ROLE_PERMS = {
  superadmin: ALL_SYSTEM_PERMISSIONS.map(p => p.id),
  admin: [
    'manage_users',
    'manage_roles',
    'manage_courses',
    'upload_materials',
    'download_materials',
    'manage_quizzes',
    'manage_notifications',
    'view_analytics',
    'manage_enquiries'
  ],
  teacher: [
    'create_courses',
    'manage_courses',
    'upload_materials',
    'download_materials',
    'create_assignments',
    'grade_submissions',
    'manage_quizzes',
    'manage_notifications',
    'view_analytics'
  ],
  student: [
    'download_materials',
    'submit_assignments',
    'take_quizzes',
    'access_ai_coach'
  ]
};

const getRoleDefaults = (role) => DEFAULT_ROLE_PERMS[role] || DEFAULT_ROLE_PERMS.student;

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Admin@123');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState(getRoleDefaults('student'));
  const [submitting, setSubmitting] = useState(false);

  // Edit User & Permissions Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('student');
  const [editDepartment, setEditDepartment] = useState('');
  const [editPermissions, setEditPermissions] = useState([]);
  const [savingEdit, setSavingEdit] = useState(false);

  // View Permissions Quick Modal / Inspector
  const [viewingPermsUser, setViewingPermsUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.warn('Fetch users error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // When role changes in Add Modal, update default permissions
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setSelectedPermissions(getRoleDefaults(newRole));
    if (newRole === 'teacher' && !department) {
      setDepartment('Computer Science & Engineering');
    }
  };

  const togglePermission = (permId) => {
    setSelectedPermissions(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const toggleEditPermission = (permId) => {
    setEditPermissions(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.post('/admin/users', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        department: department || (role === 'teacher' ? 'Computer Science & Engineering' : 'General Studies'),
        gradeLevel: role === 'student' ? '1st Year' : undefined,
        permissions: selectedPermissions
      });

      if (res.data.success) {
        const createdUser = res.data.user;
        // Prepend new user so it appears at top of table
        setUsers(prev => [createdUser, ...prev.filter(u => u.id !== createdUser.id)]);
        setToastMsg(`✓ Account for "${name}" created with ${selectedPermissions.length} permissions!`);
        setShowAddModal(false);
        resetForm();
        // Reset filter to 'all' so new user is guaranteed visible immediately
        setRoleFilter('all');
        setSearchQuery('');
        // Re-sync with server
        fetchUsers();
      }
    } catch (err) {
      setToastMsg(err.response?.data?.message || 'Error creating user account.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const openEditModal = (targetUser) => {
    const userPerms = (targetUser.permissions && targetUser.permissions.length > 0)
      ? targetUser.permissions
      : getRoleDefaults(targetUser.role);

    setEditingUser(targetUser);
    setEditRole(targetUser.role);
    setEditDepartment(targetUser.department || targetUser.course || '');
    setEditPermissions(userPerms);
  };

  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingEdit(true);

    try {
      const res = await api.put(`/admin/users/${editingUser.id}`, {
        role: editRole,
        department: editDepartment,
        permissions: editPermissions
      });

      if (res.data.success) {
        const updatedUser = res.data.user;
        setUsers(prev => prev.map(u => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u)));
        setToastMsg(`✓ Permissions & role updated for "${editingUser.name}"!`);
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      setToastMsg(err.response?.data?.message || 'Failed to update user permissions.');
    } finally {
      setSavingEdit(false);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const handleDeleteUser = async (id, userName, userRole) => {
    if (userRole === 'superadmin') {
      if (currentUser?.role !== 'superadmin') {
        setToastMsg('Access denied: Only a Super Admin can delete a Super Admin account.');
        setTimeout(() => setToastMsg(''), 3000);
        return;
      }
      setToastMsg('The primary Super Admin account is protected and cannot be deleted.');
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;

    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setToastMsg(`Deleted account for "${userName}".`);
    } catch (err) {
      setToastMsg(err.response?.data?.message || `Failed to delete ${userName}.`);
    } finally {
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('Admin@123');
    setRole('student');
    setDepartment('');
    setSelectedPermissions(getRoleDefaults('student'));
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (!u) return false;
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const nameStr = (u.name || '').toLowerCase();
      const emailStr = (u.email || '').toLowerCase();
      const deptStr = (u.department || u.course || '').toLowerCase();
      const q = (searchQuery || '').trim().toLowerCase();
      const matchesSearch = !q || nameStr.includes(q) || emailStr.includes(q) || deptStr.includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, searchQuery]);

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">User Directory & Permissions</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {users.length} Total Registered
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Create accounts, manage role access, and configure granular permissions across the platform
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchUsers();
              }}
              disabled={refreshing}
              className="py-2.5 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
              title="Re-sync data from database"
            >
              <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
              <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
            </button>

            <button
              onClick={() => {
                handleRoleChange('teacher');
                setShowAddModal(true);
              }}
              className="py-2.5 px-4 bg-linear-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 hover:opacity-95 transition flex items-center gap-2"
            >
              <span>👨‍🏫 + Provision Teacher</span>
            </button>

            <button
              onClick={() => {
                handleRoleChange('student');
                setShowAddModal(true);
              }}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center gap-2"
            >
              <span>+ Add User</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {toastMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center justify-between shadow-lg animate-fadeIn">
            <span>{toastMsg}</span>
            <button onClick={() => setToastMsg('')} className="text-emerald-400/70 hover:text-emerald-300 text-xs font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Role Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'superadmin', 'admin', 'teacher', 'student'].map((r) => {
              const count = users.filter((u) => r === 'all' || u.role === r).length;
              return (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition whitespace-nowrap flex items-center gap-1.5 ${
                    roleFilter === r
                      ? 'bg-indigo-600 text-white font-semibold shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{r === 'all' ? 'All Users' : r === 'superadmin' ? 'Super Admins' : `${r}s`}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${roleFilter === r ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by name, email, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Directory Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <div className="text-2xl animate-bounce">⚡</div>
              <div className="text-sm font-medium">Loading user directory from database...</div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/90 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">User Details</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Department / Program</th>
                    <th className="px-5 py-4">Active Permissions</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredUsers.map((u) => {
                    const userPermissions = (u.permissions && u.permissions.length > 0)
                      ? u.permissions
                      : getRoleDefaults(u.role);

                    const isSuper = u.role === 'superadmin';

                    return (
                      <tr key={u.id} className="hover:bg-slate-900/50 transition duration-150">
                        {/* User Profile Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-inner border ${
                              isSuper
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : u.role === 'teacher'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                : u.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            }`}>
                              {(u.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                <span>{u.name || 'Anonymous User'}</span>
                                {isSuper && <span title="Super Administrator">👑</span>}
                              </div>
                              <div className="text-xs text-slate-400">{u.email}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">ID: {u.id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize inline-flex items-center gap-1 border ${
                            isSuper
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : u.role === 'student'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : u.role === 'teacher'
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}>
                            <span>
                              {isSuper ? '👑 Super Admin' : u.role === 'teacher' ? '👨‍🏫 Teacher' : u.role === 'admin' ? '⚙️ Admin' : '🎓 Student'}
                            </span>
                          </span>
                        </td>

                        {/* Department / Program */}
                        <td className="px-5 py-4 text-xs text-slate-300">
                          <div className="font-medium text-slate-200">
                            {u.department || u.course || 'Standard Academic Profile'}
                          </div>
                          {u.courseYear && (
                            <div className="text-[11px] text-slate-500">{u.courseYear}</div>
                          )}
                        </td>

                        {/* Permissions Chips */}
                        <td className="px-5 py-4">
                          {isSuper ? (
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-md text-[11px] font-bold">
                                👑 All Capabilities (*)
                              </span>
                              <span className="text-[10px] text-slate-500">15 / 15</span>
                            </div>
                          ) : (
                            <div className="space-y-1.5 max-w-xs">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {userPermissions.slice(0, 3).map((pId) => {
                                  const permObj = ALL_SYSTEM_PERMISSIONS.find(p => p.id === pId);
                                  return (
                                    <span
                                      key={pId}
                                      className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded text-[11px] font-medium"
                                      title={permObj?.description || pId}
                                    >
                                      {permObj?.label || pId}
                                    </span>
                                  );
                                })}
                                {userPermissions.length > 3 && (
                                  <button
                                    onClick={() => setViewingPermsUser(u)}
                                    className="px-1.5 py-0.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded text-[11px] font-bold transition"
                                  >
                                    +{userPermissions.length - 3} more
                                  </button>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {userPermissions.length} active permissions granted
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(u)}
                              className="px-3 py-1.5 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 border border-indigo-500/20 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                              title="Edit user role and granular permissions"
                            >
                              <span>🛡️</span>
                              <span>Permissions</span>
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u.id, u.name, u.role)}
                              className="px-2.5 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold rounded-lg transition"
                              title="Delete user account"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <div className="text-3xl">🔍</div>
              <div className="text-base font-semibold text-white">No users match your criteria</div>
              <p className="text-xs text-slate-500">
                Try resetting your search query or switching the role filter back to "All Users".
              </p>
              <button
                onClick={() => {
                  setRoleFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Show All Users
              </button>
            </div>
          )}
        </div>

        {/* Quick Permissions Inspector Modal */}
        {viewingPermsUser && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel max-w-lg w-full p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl animate-scaleUp">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    {(viewingPermsUser.name || 'U').charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{viewingPermsUser.name}</h3>
                    <p className="text-xs text-slate-400">{viewingPermsUser.role} • {viewingPermsUser.email}</p>
                  </div>
                </div>
                <button onClick={() => setViewingPermsUser(null)} className="text-slate-400 hover:text-white p-1 text-sm font-bold">
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">
                  Granted Platform Permissions ({viewingPermsUser.permissions?.length || getRoleDefaults(viewingPermsUser.role).length}):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                  {ALL_SYSTEM_PERMISSIONS.map(p => {
                    const hasPerm = (viewingPermsUser.permissions || getRoleDefaults(viewingPermsUser.role)).includes(p.id);
                    return (
                      <div
                        key={p.id}
                        className={`p-2 rounded-xl border text-xs flex items-start gap-2 ${
                          hasPerm
                            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                            : 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60'
                        }`}
                      >
                        <span className="text-sm">{hasPerm ? '✓' : '—'}</span>
                        <div>
                          <div className="font-semibold">{p.label}</div>
                          <div className="text-[10px] text-slate-400">{p.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    const target = viewingPermsUser;
                    setViewingPermsUser(null);
                    openEditModal(target);
                  }}
                  className="py-2 px-4 rounded-xl text-xs font-semibold text-indigo-400 hover:bg-indigo-600/10 border border-indigo-500/20"
                >
                  Edit Permissions
                </button>
                <button
                  onClick={() => setViewingPermsUser(null)}
                  className="py-2 px-4 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User & Permissions Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-panel max-w-xl w-full p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>🛡️ Edit Permissions & Role</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Customizing access for <strong className="text-indigo-400">{editingUser.name}</strong> ({editingUser.email})
                  </p>
                </div>
                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white p-1 text-sm font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveUserEdit} className="space-y-4 overflow-y-auto pr-1 flex-1">
                {/* Role selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Role</label>
                  <div className={`grid ${currentUser?.role === 'superadmin' ? 'grid-cols-4' : 'grid-cols-3'} gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs`}>
                    {['student', 'teacher', 'admin', ...(currentUser?.role === 'superadmin' ? ['superadmin'] : [])].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setEditRole(r);
                          setEditPermissions(getRoleDefaults(r));
                        }}
                        className={`py-2 rounded-lg font-bold capitalize transition ${
                          editRole === r
                            ? r === 'superadmin' ? 'bg-rose-600 text-white' : r === 'teacher' ? 'bg-purple-600 text-white' : r === 'admin' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {r === 'superadmin' ? '👑 Super' : r === 'teacher' ? '👨‍🏫 Teacher' : r === 'admin' ? '⚙️ Admin' : '🎓 Student'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Department / Program */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department / Academic Program</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Permissions Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Granular Capabilities ({editPermissions.length} selected)
                    </label>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setEditPermissions(ALL_SYSTEM_PERMISSIONS.map(p => p.id))}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Select All
                      </button>
                      <span className="text-slate-600">•</span>
                      <button
                        type="button"
                        onClick={() => setEditPermissions(getRoleDefaults(editRole))}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        Role Defaults
                      </button>
                      <span className="text-slate-600">•</span>
                      <button
                        type="button"
                        onClick={() => setEditPermissions([])}
                        className="text-slate-500 hover:text-slate-300"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {ALL_SYSTEM_PERMISSIONS.map(p => {
                      const isChecked = editPermissions.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer border transition text-xs select-none ${
                            isChecked
                              ? 'bg-indigo-600/10 border-indigo-500/30 text-white'
                              : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleEditPermission(p.id)}
                            className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-slate-900"
                          />
                          <div>
                            <div className="font-semibold">{p.label}</div>
                            <div className="text-[10px] text-slate-500">{p.description}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="py-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
                  >
                    {savingEdit ? 'Saving Changes...' : 'Save Permissions & Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-panel max-w-xl w-full p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {role === 'teacher' ? '👨‍🏫 Provision New Teacher Account' : role === 'superadmin' ? '👑 Provision Super Admin Account' : 'Add New Platform User'}
                  </h3>
                  <p className="text-[11px] text-purple-400 font-semibold">
                    🔒 Account credentials & granular permissions will be configured automatically.
                  </p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1 text-sm font-bold">
                  ✕
                </button>
              </div>

              {/* Role Toggle Selector */}
              <div className={`grid ${currentUser?.role === 'superadmin' ? 'grid-cols-4' : 'grid-cols-3'} gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs`}>
                <button
                  type="button"
                  onClick={() => handleRoleChange('teacher')}
                  className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                    role === 'teacher' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>👨‍🏫 Teacher</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('student')}
                  className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                    role === 'student' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🎓 Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                    role === 'admin' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>⚙️ Admin</span>
                </button>
                {currentUser?.role === 'superadmin' && (
                  <button
                    type="button"
                    onClick={() => handleRoleChange('superadmin')}
                    className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                      role === 'superadmin' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>👑 Super</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleAddUser} className="space-y-4 overflow-y-auto pr-1 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {role === 'teacher' ? 'Faculty Full Name' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={role === 'teacher' ? 'Dr. John Doe' : 'Student Scholar'}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={role === 'teacher' ? 'faculty@estudy.com' : 'scholar@estudy.com'}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Temporary Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {role === 'teacher' ? 'Department / Specialization' : 'Department / Academic Program'}
                    </label>
                    {role === 'teacher' ? (
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics Engineering">Electronics Engineering</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Computer Science & Engineering"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    )}
                  </div>
                </div>

                {/* Permissions section for new user */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Assigned Capabilities ({selectedPermissions.length} selected for {role})
                    </label>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setSelectedPermissions(ALL_SYSTEM_PERMISSIONS.map(p => p.id))}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Select All
                      </button>
                      <span className="text-slate-600">•</span>
                      <button
                        type="button"
                        onClick={() => setSelectedPermissions(getRoleDefaults(role))}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        Reset Defaults
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto">
                    {ALL_SYSTEM_PERMISSIONS.map(p => {
                      const isChecked = selectedPermissions.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer border transition text-xs select-none ${
                            isChecked
                              ? 'bg-indigo-600/10 border-indigo-500/30 text-white'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(p.id)}
                            className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-slate-900"
                          />
                          <div>
                            <div className="font-semibold text-slate-200">{p.label}</div>
                            <div className="text-[10px] text-slate-500">{p.description}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`py-2 px-5 text-white text-xs font-bold rounded-xl shadow-lg transition disabled:opacity-50 ${
                      role === 'teacher'
                        ? 'bg-linear-to-r from-purple-600 to-indigo-600 shadow-purple-600/30 hover:opacity-95'
                        : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                    }`}
                  >
                    {submitting ? 'Creating Account...' : role === 'teacher' ? 'Provision Teacher Account' : 'Create User Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default UserManagement;
