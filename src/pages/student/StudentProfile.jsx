import { useEffect, useState } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  CalendarDays,
  LogOut,
  Pencil,
  Save,
  X,
  LockKeyhole,
  AlertTriangle,
  Power,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import StudentLayout from "../../components/student/StudentLayout.jsx";
import api from "../../api/axios.js";

const StudentProfile = () => {
  const { user, logout } = useAuth();

  // =========================================================
  // PROFILE STATE
  // =========================================================

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "STUDENT",
    status: user?.status || "ACTIVE",
    createdAt: null,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saved, setSaved] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  // =========================================================
  // PASSWORD STATE
  // =========================================================

  const [showPasswordSection, setShowPasswordSection] =
    useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [changingPassword, setChangingPassword] =
    useState(false);

  // =========================================================
  // DEACTIVATION STATE
  // =========================================================

  const [showDeactivateModal, setShowDeactivateModal] =
    useState(false);

  const [deactivating, setDeactivating] =
    useState(false);

  // =========================================================
  // ERROR / SUCCESS
  // =========================================================

  const [error, setError] = useState("");
  const [passwordMessage, setPasswordMessage] =
    useState("");

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      setError("");

      const response = await api.get("/users/profile");

      const data = response.data.user;

      setProfile({
        name: data.name || "",
        email: data.email || "",
        role: data.role || "STUDENT",
        status: data.status || "ACTIVE",
        createdAt: data.createdAt || null,
      });

      setFormData({
        name: data.name || "",
        email: data.email || "",
      });
    } catch (error) {
      console.error(
        "Profile loading error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoadingProfile(false);
    }
  };

  // =========================================================
  // PROFILE INPUT
  // =========================================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email cannot be empty.");
      return;
    }

    try {
      setSavingProfile(true);
      setError("");

      const response = await api.put(
        "/users/profile",
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
        }
      );

      const updatedUser = response.data.user;

      setProfile((previous) => ({
        ...previous,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
      }));

      setFormData({
        name: updatedUser.name,
        email: updatedUser.email,
      });

      setIsEditing(false);
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // =========================================================
  // CANCEL EDIT
  // =========================================================

  const handleCancelEdit = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
    });

    setError("");
    setIsEditing(false);
  };

  // =========================================================
  // PASSWORD INPUT
  // =========================================================

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordMessage("");
  };

  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPasswordMessage("");
    setError("");

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordMessage(
        "Please fill in all password fields."
      );
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setPasswordMessage(
        "New passwords do not match."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await api.put(
        "/users/change-password",
        passwordData
      );

      setPasswordMessage(
        response.data.message ||
          "Password changed successfully."
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        setShowPasswordSection(false);
        setPasswordMessage("");
      }, 1800);
    } catch (error) {
      console.error(
        "Password change error:",
        error
      );

      setPasswordMessage(
        error.response?.data?.message ||
          "Unable to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // =========================================================
  // DEACTIVATE ACCOUNT
  // =========================================================

  const handleDeactivate = async () => {
    try {
      setDeactivating(true);
      setError("");

      const response = await api.put(
        "/users/deactivate"
      );

      setShowDeactivateModal(false);

      alert(
        response.data.message ||
          "Account deactivated successfully."
      );

      logout();
    } catch (error) {
      console.error(
        "Deactivate account error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to deactivate your account."
      );
    } finally {
      setDeactivating(false);
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const displayName =
    profile.name || user?.name || "Student";

  const email =
    profile.email ||
    user?.email ||
    "No email available";

  const role =
    profile.role ||
    user?.role ||
    "STUDENT";

  const status =
    profile.status ||
    user?.status ||
    "ACTIVE";

  const firstLetter =
    displayName.charAt(0)?.toUpperCase() || "S";

  const joinedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "Available in account";

  // =========================================================
  // LOADING
  // =========================================================

  if (loadingProfile) {
    return (
      <StudentLayout>
        <div className="mx-auto max-w-6xl">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500 dark:border-white/10 dark:border-t-indigo-400" />

              <p className="text-sm text-slate-400">
                Loading your profile...
              </p>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <StudentLayout>
      <div className="mx-auto max-w-6xl space-y-6">

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500 dark:text-indigo-400">
              Account
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage your personal information and account
              security.
            </p>
          </div>

          {saved && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle2 size={17} />
              Profile updated
            </div>
          )}
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {/* =====================================================
            PROFILE HERO
        ====================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">

          

          <div className="px-5 pb-6 sm:px-7">

            <div className="flex flex-col gap-5 pt-6 sm:flex-row sm:items-end sm:justify-between">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">

                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-indigo-500 text-3xl font-bold text-white shadow-lg dark:border-slate-900">
                  {firstLetter}
                </div>

                <div className="pb-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {displayName}
                    </h2>

                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      Student
                    </span>

                  </div>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {email}
                  </p>

                </div>
              </div>

              <div
                className={`flex w-fit items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold ${
                  status === "ACTIVE"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "border-red-200 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    status === "ACTIVE"
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  }`}
                />

                {status === "ACTIVE"
                  ? "Active Account"
                  : "Inactive Account"}
              </div>

            </div>
          </div>
        </section>

        {/* =====================================================
            PERSONAL INFORMATION
        ====================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">

          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">

            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Personal Information
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Update your name and email address.
              </p>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
              >
                <Pencil size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  type="submit"
                  form="profile-form"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} />

                  {savingProfile
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>
            )}
          </div>

          <form
            id="profile-form"
            onSubmit={handleSaveProfile}
            className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6"
          >

            {/* Name */}

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Full Name
              </label>

              <div className="relative">

                <User
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-default disabled:text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:focus:border-indigo-500 dark:disabled:text-slate-300"
                />

              </div>
            </div>

            {/* Email */}

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Email Address
              </label>

              <div className="relative">

                <Mail
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-default disabled:text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:focus:border-indigo-500 dark:disabled:text-slate-300"
                />

              </div>
            </div>

          </form>
        </section>

        {/* =====================================================
            ACCOUNT INFORMATION
        ====================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">

          <div className="border-b border-slate-200 px-5 py-5 dark:border-white/10">

            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Account Information
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Information managed by the system.
            </p>

          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">

            {/* Role */}

            <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4 dark:bg-white/[0.03]">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <ShieldCheck size={18} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Account Role
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {role}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Managed by administrator
                </p>
              </div>

            </div>

            {/* Type */}

            <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4 dark:bg-white/[0.03]">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <User size={18} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Account Type
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Student Account
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Quiz platform student
                </p>
              </div>

            </div>

            {/* Joined */}

            <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4 dark:bg-white/[0.03]">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <CalendarDays size={18} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Joined
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {joinedDate}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Account creation date
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            SECURITY
        ====================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">

          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">

            <div>

              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Security
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Keep your account secure.
              </p>

            </div>

            <button
              type="button"
              onClick={() => {
                setShowPasswordSection(
                  (previous) => !previous
                );

                setPasswordMessage("");
              }}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-white/10 dark:text-slate-300 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
            >
              <LockKeyhole size={16} />

              {showPasswordSection
                ? "Cancel"
                : "Change Password"}
            </button>

          </div>

          {showPasswordSection ? (
            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-5 p-5 sm:p-6"
            >

              {passwordMessage && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
                  {passwordMessage}
                </div>
              )}

              <div>

                <label className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Current Password
                </label>

                <input
                  type="password"
                  name="currentPassword"
                  value={
                    passwordData.currentPassword
                  }
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:border-indigo-500"
                />

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                    New Password
                  </label>

                  <input
                    type="password"
                    name="newPassword"
                    value={
                      passwordData.newPassword
                    }
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:border-indigo-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={
                      passwordData.confirmPassword
                    }
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:border-indigo-500"
                  />

                </div>

              </div>

              <div className="flex justify-end">

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LockKeyhole size={16} />

                  {changingPassword
                    ? "Updating..."
                    : "Update Password"}
                </button>

              </div>

            </form>
          ) : (
            <div className="flex items-center gap-4 p-5 sm:p-6">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <ShieldCheck size={19} />
              </div>

              <div>

                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Password protected
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Your account is secured with a password.
                </p>

              </div>

            </div>
          )}

        </section>

        {/* =====================================================
            CURRENT SESSION
        ====================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">

          <div className="border-b border-slate-200 px-5 py-5 dark:border-white/10">

            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Current Session
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Manage your current login session.
            </p>

          </div>

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

            <div>

              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Signed in as {displayName}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                You are currently logged in to the Student Portal.
              </p>

            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
            >
              <LogOut size={17} />
              Logout
            </button>

          </div>

        </section>

        {/* =====================================================
            DANGER ZONE
        ====================================================== */}

        <section className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm dark:border-red-500/20 dark:bg-white/[0.03] dark:shadow-none">

          <div className="border-b border-red-100 px-5 py-5 dark:border-red-500/10">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
                <AlertTriangle size={19} />
              </div>

              <div>

                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Danger Zone
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Actions that affect your account access.
                </p>

              </div>

            </div>

          </div>

          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

            <div>

              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Deactivate Account
              </p>

              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-400">
                Deactivate your account and prevent further
                access to the Student Portal. Your existing
                quiz attempts and results will remain stored.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setShowDeactivateModal(true)
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
            >
              <Power size={17} />
              Deactivate Account
            </button>

          </div>

        </section>

      </div>

      {/* =======================================================
          DEACTIVATE MODAL
      ======================================================== */}

      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
              <AlertTriangle size={23} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
              Deactivate your account?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Your account will be deactivated and you will
              no longer be able to log in. Your existing quiz
              attempts and results will remain preserved.
            </p>

            <div className="mt-5 rounded-xl bg-red-50 p-4 text-xs leading-5 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              You will need an administrator to reactivate
              the account.
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  setShowDeactivateModal(false)
                }
                disabled={deactivating}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeactivate}
                disabled={deactivating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Power size={16} />

                {deactivating
                  ? "Deactivating..."
                  : "Yes, Deactivate"}
              </button>

            </div>

          </div>
        </div>
      )}

    </StudentLayout>
  );
};

export default StudentProfile;