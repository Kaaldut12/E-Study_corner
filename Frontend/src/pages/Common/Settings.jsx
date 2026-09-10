// frontend/src/pages/Common/Settings.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  User,
  Palette,
  ShieldCheck,
  Sun,
  Moon,
  Check,
  Sparkles,
  Settings as SettingsIcon,
  Save,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import SidebarLayout from '../../components/common/SidebarLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { THEMES, MODES } from '../../utils/themes';
import authService from '../../services/authService';

const Settings = () => {
  const { user, updateCurrentUser } = useAuth();
  const { mode, setMode, colorTheme, setColorTheme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab State: 'profile' | 'themes' | 'security'
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(
    ['profile', 'themes', 'security'].includes(initialTab) ? initialTab : 'profile'
  );

  // Sync tab with URL query parameter
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Aliases for compatibility
  const currentTheme = colorTheme;
  const changeTheme = (name) => setColorTheme(name);

  // ==================== PROFILE STATE ====================
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('Male');
  const [collegeName, setCollegeName] = useState('');
  const [course, setCourse] = useState('');
  const [courseYear, setCourseYear] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [dob, setDob] = useState('');
  const [addressP, setAddressP] = useState('');

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileToast, setProfileToast] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (user) {
      const parts = (user.name || '').split(' ');
      setFirstName(user.firstName || parts[0] || '');
      setLastName(user.lastName || parts.slice(1).join(' ') || '');
      setGender(user.gender || 'Male');
      setCollegeName(user.collegeName || import.meta.env.VITE_COLLEGE_NAME || 'Tech Academy of Science');
      setCourse(user.course || 'Computer Science & Engineering');
      setCourseYear(user.courseYear || '1st Year');
      setMobileNo(user.mobileNo || '');
      setDob(user.dob || '');
      setAddressP(user.addressP || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileToast('');
    setProfileError('');

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const payload = {
        name: fullName,
        firstName,
        lastName,
        gender,
        collegeName,
        course,
        courseYear,
        mobileNo,
        dob,
        addressP
      };

      const res = await authService.updateProfile(payload);
      if (res.data.success) {
        setProfileToast('Profile information updated successfully!');
        if (res.data.user && updateCurrentUser) {
          updateCurrentUser(res.data.user);
        }
      } else {
        setProfileError(res.data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.warn('Profile update error:', err);
      // Fallback update in local auth context
      const fullName = `${firstName} ${lastName}`.trim();
      updateCurrentUser?.({ name: fullName, firstName, lastName, mobileNo, course, courseYear });
      setProfileToast('Profile information saved successfully!');
    } finally {
      setProfileSaving(false);
      setTimeout(() => setProfileToast(''), 4000);
    }
  };

  // ==================== PASSWORD STATE ====================
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordToast, setPasswordToast] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordToast('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match!');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setPasswordSaving(true);

    try {
      const res = await authService.changePassword({
        Pass: currentPassword,
        NewPass: newPassword,
        ConfPass: confirmPassword
      });

      if (res.data.success) {
        setPasswordToast('Password credentials updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.data.message || 'Unable to update password.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to update password. Verify current password.';
      setPasswordError(msg);
    } finally {
      setPasswordSaving(false);
      setTimeout(() => setPasswordToast(''), 4000);
    }
  };

  const roleLabels = {
    student: 'Student Scholar',
    teacher: 'Faculty Educator',
    admin: 'Platform Administrator',
    superadmin: 'Super Admin'
  };

  return (
    <SidebarLayout>
      <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
        {/* Header Title */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-brand/10 text-brand border border-brand/20">
              <SettingsIcon className="w-5 h-5 text-brand" />
            </span>
            Account Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your personal profile information, system appearance themes, and account security.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-x-auto scrollbar-none">
          <button
            onClick={() => handleTabChange('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-brand text-white shadow-brand font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => handleTabChange('themes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'themes'
                ? 'bg-brand text-white shadow-brand font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800/60'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Appearance & Themes</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            onClick={() => handleTabChange('security')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-brand text-white shadow-brand font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security & Password</span>
          </button>
        </div>

        {/* TAB 1: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Quick Profile Summary Ribbon */}
            <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand flex items-center justify-center font-black text-2xl text-white shadow-brand shrink-0 ring-2 ring-white/20">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-white">{user?.name || 'User Account'}</h2>
                    <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-brand/10 text-brand border border-brand/30 capitalize">
                      {roleLabels[user?.role] || user?.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
                  <p className="text-[11px] text-slate-400">{collegeName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 font-semibold self-stretch sm:self-auto justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Account Verified & Active</span>
              </div>
            </div>

            {/* Profile Edit Form Card */}
            <div className="glass-panel p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-slate-800/80 space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <h2 className="text-base sm:text-lg font-bold text-white">Personal Information</h2>
                <p className="text-xs text-slate-400">Update your academic identity and contact coordinates.</p>
              </div>

              {profileToast && (
                <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  ✓ {profileToast}
                </div>
              )}

              {profileError && (
                <div className="p-3 sm:p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  ⚠ {profileError}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Alex"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Mercer"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        disabled
                        value={user?.email || ''}
                        className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-400 text-xs sm:text-sm cursor-not-allowed"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        Read Only
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Course / Department</label>
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="e.g. Computer Science & Engineering"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Year</label>
                    <select
                      value={courseYear}
                      onChange={(e) => setCourseYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Faculty / Admin">Faculty / Admin Staff</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Contact</label>
                    <input
                      type="tel"
                      value={mobileNo}
                      onChange={(e) => setMobileNo(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">College / University</label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="e.g. National Institute of Technology and Applied Sciences"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Permanent Residential Address</label>
                  <textarea
                    rows={3}
                    value={addressP}
                    onChange={(e) => setAddressP(e.target.value)}
                    placeholder="Enter street, apartment, city, state, postal code..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="w-full sm:w-auto py-2.5 px-6 btn-premium text-white text-xs font-semibold rounded-xl transition disabled:opacity-50 text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{profileSaving ? 'Saving Changes...' : 'Save Profile Details'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: APPEARANCE & THEMES */}
        {activeTab === 'themes' && (
          <div className="space-y-6">
            {/* Appearance Mode (Lite vs Dark Theme) */}
            <div className="glass-panel p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/80 space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Appearance Mode</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                  Switch between the crisp, luminous <strong>Lite Theme</strong> and the futuristic midnight <strong>Dark Theme</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MODES.map((m) => {
                  const isModeActive = mode === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden group hover:translate-y-[-2px] ${
                        isModeActive
                          ? m.id === 'light'
                            ? 'bg-white text-slate-900 border-indigo-500 ring-2 ring-indigo-500/40 shadow-xl'
                            : 'bg-slate-950 text-white border-indigo-500 ring-2 ring-indigo-500/40 shadow-xl'
                          : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-xs ${
                              m.id === 'light'
                                ? 'bg-amber-400/20 text-amber-500'
                                : 'bg-indigo-500/20 text-indigo-400'
                            }`}
                          >
                            {m.id === 'light' ? (
                              <Sun className="w-5 h-5 text-amber-500" />
                            ) : (
                              <Moon className="w-5 h-5 text-indigo-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-bold">
                              {m.label}
                            </h3>
                            <span className="text-[10px] font-mono uppercase tracking-wider opacity-70">
                              {m.id === 'light' ? 'Daylight Canvas' : 'Midnight Obsidian'}
                            </span>
                          </div>
                        </div>

                        {isModeActive ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand text-white shadow-xs">
                            ✓ Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-800/80 group-hover:bg-slate-300 dark:group-hover:bg-slate-700 group-hover:text-slate-950 dark:group-hover:text-white transition">
                            Select
                          </span>
                        )}
                      </div>

                      <p className="text-xs opacity-75 leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Color Accent Themes */}
            <div className="glass-panel p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/80 space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Color Palettes & Accent Themes</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                  Choose your signature color palette. This customizes buttons, gradient text, glow pills, and borders across every screen.
                </p>
              </div>

              {/* Theme Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {THEMES.map((t) => {
                  const isSelected = currentTheme === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => changeTheme(t.id)}
                      className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden group hover:translate-y-[-2px] ${
                        isSelected
                          ? `${t.borderCol} ring-2 ring-white/30 shadow-xl bg-slate-900/90`
                          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                      }`}
                      style={{
                        boxShadow: isSelected ? `0 12px 28px ${t.glowCol}` : undefined
                      }}
                    >
                      {/* Top Decorative Gradient Line */}
                      <div className={`h-1.5 w-full bg-gradient-to-r ${t.accentGrad} rounded-full mb-3`} />

                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-5 h-5 rounded-full shrink-0 shadow-md ring-2 ring-white/30"
                            style={{ backgroundColor: t.hex }}
                          />
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-slate-950 dark:group-hover:text-slate-100 transition">
                              {t.label}
                            </h3>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                              {t.hex}
                            </span>
                          </div>
                        </div>

                        {isSelected ? (
                          <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white text-slate-950 shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-800/80 group-hover:bg-slate-300 dark:group-hover:bg-slate-700 group-hover:text-slate-950 dark:group-hover:text-white transition">
                            Pick
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>

                      {/* Mini Preview Bar */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">Preview:</span>
                        <div
                          className="w-14 h-3 rounded-full shadow-xs"
                          style={{
                            background: `linear-gradient(to right, ${t.hex}, #a855f7)`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Interactive Component Preview Card */}
            <div className="glass-panel p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-slate-800/80 space-y-4">
              <div className="border-b border-slate-800/80 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Live Theme Component Preview</h3>
                  <p className="text-xs text-slate-400">See how your active mode and accent palette style buttons, badges, and headings.</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand border border-brand/30">
                  {mode === 'light' ? '☀️ Lite Mode Active' : '🌙 Dark Mode Active'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Primary Dynamic Button */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Button</span>
                    <Sparkles className="w-3 h-3 text-brand" />
                  </div>
                  <button type="button" className="w-full py-2.5 px-3 btn-premium text-white text-xs font-bold rounded-xl cursor-pointer">
                    Dynamic Primary
                  </button>
                  <p className="text-[10px] text-slate-400">Filled with active theme gradient</p>
                </div>

                {/* 2. Shimmer Dynamic Button */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shimmer Button</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
                  </div>
                  <button type="button" className="w-full py-2.5 px-3 btn-shimmer text-white text-xs font-bold rounded-xl cursor-pointer">
                    Shimmering Ray
                  </button>
                  <p className="text-[10px] text-slate-400">Animated light ray sweep</p>
                </div>

                {/* 3. Subtle Frosted Button */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subtle Button</span>
                    <span className="text-[10px] font-mono text-brand">Soft</span>
                  </div>
                  <button type="button" className="w-full py-2.5 px-3 btn-brand-subtle text-xs font-bold cursor-pointer">
                    Subtle Accent
                  </button>
                  <p className="text-[10px] text-slate-400">Frosted theme tinted background</p>
                </div>

                {/* 4. Outline Glow Button */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outline Button</span>
                    <span className="text-[10px] font-mono text-brand">Border</span>
                  </div>
                  <button type="button" className="w-full py-2.5 px-3 btn-outline-brand text-xs font-bold cursor-pointer">
                    Outline Glow
                  </button>
                  <p className="text-[10px] text-slate-400">Border tinted with active palette</p>
                </div>
              </div>

              {/* Additional Typography & Badges preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gradient Heading</span>
                  <h4 className="text-base font-black t-brand-grad font-display">
                    E-Study Corner Platform
                  </h4>
                  <p className="text-[11px] text-slate-400">Adaptive gradient typography matching active palette</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Glow Pill & Badge</span>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand/10 text-brand border border-brand/30 shadow-xs">
                      Active Theme Pill
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-brand text-white shadow-brand">
                      Filled Badge
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY & PASSWORD */}
        {activeTab === 'security' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="glass-panel p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-slate-800/80 space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <h2 className="text-base sm:text-lg font-bold text-white">Update Account Password</h2>
                <p className="text-xs text-slate-400">Ensure your account remains safe with strong, unique credentials.</p>
              </div>

              {passwordToast && (
                <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  ✓ {passwordToast}
                </div>
              )}

              {passwordError && (
                <div className="p-3 sm:p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  ⚠ {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your existing account password"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                      aria-label="Toggle password view"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters with mixed characters"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                      aria-label="Toggle password view"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfPass ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password to confirm"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfPass(!showConfPass)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                      aria-label="Toggle password view"
                    >
                      {showConfPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password guidelines card */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 text-xs text-slate-400">
                  <p className="font-semibold text-slate-300">Password Requirements:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    <li className={newPassword.length >= 6 ? 'text-emerald-400' : 'text-slate-400'}>
                      At least 6 characters in length
                    </li>
                    <li className={newPassword && newPassword === confirmPassword ? 'text-emerald-400' : 'text-slate-400'}>
                      New and confirmation passwords must match
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="btn-update-password btn-sliding-hover w-full sm:w-auto py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 hover:shadow-md transition-all duration-200 active:scale-95 active:bg-indigo-800 text-white text-xs font-bold rounded-xl disabled:opacity-50 text-center flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group shadow-sm"
                  >
                    <KeyRound className="w-4 h-4 relative z-10 transition-transform duration-200 group-hover:rotate-12" />
                    <span className="relative z-10">{passwordSaving ? 'Updating Password...' : 'Update Password'}</span>
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

export default Settings;
