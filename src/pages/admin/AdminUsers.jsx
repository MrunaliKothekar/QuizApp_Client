import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Users,
  UserCheck,
  UserX,
  Eye,
  Power,
  Trash2,
  X,
  Trophy,
  ClipboardList,
  BarChart3,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout.jsx";
import api from "../../api/axios.js";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(null);

  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await api.get("/admin/users", {
        params,
      });

      const fetchedUsers = Array.isArray(response.data?.students)
        ? response.data.students
        : [];

      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Fetch users error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const filteredUsers = users.filter((user) => {
    if (statusFilter === "ALL") {
      return true;
    }

    return user.status === statusFilter;
  });

  const activeUsers = users.filter(
    (user) => user.status === "ACTIVE"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "INACTIVE"
  ).length;

  const handleViewProfile = async (userId) => {
    try {
      setOpenMenu(null);
      setProfileLoading(true);
      setError("");

      const response = await api.get(
        `/admin/users/${userId}`
      );

      setSelectedUser(response.data);
    } catch (err) {
      console.error("Fetch student profile error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load student profile."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus =
      user.status === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    const actionText =
      newStatus === "ACTIVE"
        ? "activate"
        : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${user.name}'s account?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setOpenMenu(null);
      setActionLoading(user._id);
      setError("");

      await api.patch(
        `/admin/users/${user._id}/status`,
        {
          status: newStatus,
        }
      );

      await fetchUsers(true);

      if (
        selectedUser?.student?._id === user._id
      ) {
        await handleViewProfile(user._id);
      }
    } catch (err) {
      console.error("Update user status error:", err);

      setError(
        err.response?.data?.message ||
          `Failed to ${actionText} user.`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Delete ${user.name}'s account permanently?\n\nThis will also delete their quiz attempts and cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setOpenMenu(null);
      setActionLoading(user._id);
      setError("");

      await api.delete(
        `/admin/users/${user._id}`
      );

      if (
        selectedUser?.student?._id === user._id
      ) {
        setSelectedUser(null);
      }

      await fetchUsers(true);
    } catch (err) {
      console.error("Delete user error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete user."
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <section className="mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              User Management
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Students
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage registered students and monitor their performance.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchUsers(true)}
            disabled={refreshing || loading}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <UserStat
          icon={Users}
          label="Total Students"
          value={loading ? "—" : users.length}
        />

        <UserStat
          icon={UserCheck}
          label="Active Students"
          value={loading ? "—" : activeUsers}
        />

        <UserStat
          icon={UserX}
          label="Inactive Students"
          value={loading ? "—" : inactiveUsers}
        />

      </section>

      {/* Main card */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">

        {/* Filters */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between">

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.03] lg:max-w-sm"
          >
            <Search
              size={18}
              className="shrink-0 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search students..."
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  fetchUsers();
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={16} />
              </button>
            )}
          </form>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">

            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Filter size={16} />
              Filters
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="ALL">
                All Status
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>
            </select>

          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[1050px]">

            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">

                <TableHeading>
                  Student
                </TableHeading>

                <TableHeading>
                  Status
                </TableHeading>

                <TableHeading>
                  Quizzes
                </TableHeading>

                <TableHeading>
                  Average Score
                </TableHeading>

                <TableHeading>
                  Highest Score
                </TableHeading>

                <TableHeading>
                  Registered
                </TableHeading>

                <TableHeading align="right">
                  Action
                </TableHeading>

              </tr>
            </thead>

            <tbody>

              {loading ? (
                <LoadingRows />
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <UserRow
                    key={user._id}
                    user={user}
                    openMenu={openMenu}
                    setOpenMenu={setOpenMenu}
                    actionLoading={actionLoading}
                    onView={handleViewProfile}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                  />
                ))
              )}

            </tbody>

          </table>

        </div>

        {/* Footer */}
        {!loading && (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 dark:border-white/10">

            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {filteredUsers.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {users.length}
              </span>{" "}
              students
            </p>

          </div>
        )}

      </section>

      {/* Profile Modal */}
      {selectedUser && (
        <StudentProfileModal
          data={selectedUser}
          onClose={() => setSelectedUser(null)}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      )}

      {/* Profile Loading */}
      {profileLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-xl dark:bg-slate-900 dark:text-slate-200">
            <Loader2
              size={18}
              className="animate-spin text-indigo-500"
            />
            Loading student profile...
          </div>
        </div>
      )}

    </AdminLayout>
  );
};


/* =========================================================
   User Row
========================================================= */

const UserRow = ({
  user,
  openMenu,
  setOpenMenu,
  actionLoading,
  onView,
  onToggleStatus,
  onDelete,
}) => {
  const isLoading = actionLoading === user._id;

  return (
    <tr className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-white/[0.06] dark:hover:bg-white/[0.025]">

      {/* Student */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            {getInitials(user.name)}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {user.name}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              {user.email}
            </p>
          </div>

        </div>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <StatusBadge status={user.status} />
      </td>

      {/* Quizzes */}
      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
        {user.stats?.quizzesAttempted ?? 0}
      </td>

      {/* Average */}
      <td className="px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
        {formatScore(user.stats?.averageScore)}%
      </td>

      {/* Highest */}
      <td className="px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
        {formatScore(user.stats?.highestScore)}%
      </td>

      {/* Registered */}
      <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
        {formatDate(user.createdAt)}
      </td>

      {/* Action */}
      <td className="relative px-5 py-4 text-right">

        {isLoading ? (
          <Loader2
            size={19}
            className="ml-auto animate-spin text-indigo-500"
          />
        ) : (
          <>
            <button
              type="button"
              onClick={() =>
                setOpenMenu(
                  openMenu === user._id
                    ? null
                    : user._id
                )
              }
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <MoreHorizontal size={19} />
            </button>

            {openMenu === user._id && (
              <ActionMenu
                user={user}
                onView={onView}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
              />
            )}
          </>
        )}

      </td>

    </tr>
  );
};


/* =========================================================
   Action Menu
========================================================= */

const ActionMenu = ({
  user,
  onView,
  onToggleStatus,
  onDelete,
}) => {
  return (
    <div className="absolute right-5 top-14 z-30 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-xl dark:border-white/10 dark:bg-slate-900">

      <button
        type="button"
        onClick={() => onView(user._id)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
      >
        <Eye size={16} />
        View Profile
      </button>

      <button
        type="button"
        onClick={() => onToggleStatus(user)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
      >
        <Power size={16} />

        {user.status === "ACTIVE"
          ? "Deactivate"
          : "Activate"}
      </button>

      <div className="my-1 border-t border-slate-100 dark:border-white/10" />

      <button
        type="button"
        onClick={() => onDelete(user)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
      >
        <Trash2 size={16} />
        Delete Account
      </button>

    </div>
  );
};


/* =========================================================
   Student Profile Modal
========================================================= */

const StudentProfileModal = ({
  data,
  onClose,
  onToggleStatus,
  onDelete,
}) => {
  const student = data.student;
  const stats = data.stats;
  const history = data.quizHistory || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">

      <div className="flex min-h-full items-center justify-center">

        <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900">

          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 p-6 dark:border-white/10">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-lg font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                {getInitials(student.name)}
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {student.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {student.email}
                </p>

                <div className="mt-2">
                  <StatusBadge status={student.status} />
                </div>
              </div>

            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <X size={20} />
            </button>

          </div>

          {/* Body */}
          <div className="max-h-[70vh] overflow-y-auto p-6">

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

              <ProfileStat
                icon={ClipboardList}
                label="Quizzes"
                value={stats.quizzesAttempted}
              />

              <ProfileStat
                icon={BarChart3}
                label="Average"
                value={`${formatScore(stats.averageScore)}%`}
              />

              <ProfileStat
                icon={Trophy}
                label="Highest"
                value={`${formatScore(stats.highestScore)}%`}
              />

              <ProfileStat
                icon={CheckCircle2}
                label="Passed"
                value={stats.passedAttempts}
              />

            </div>

            {/* Account information */}
            <div className="mt-8">

              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Account Information
              </h3>

              <div className="mt-3 grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-2 dark:border-white/10">

                <InfoItem
                  label="Registration Date"
                  value={formatDate(student.createdAt)}
                />

                <InfoItem
                  label="Account Status"
                  value={
                    student.status === "ACTIVE"
                      ? "Active"
                      : "Inactive"
                  }
                />

              </div>

            </div>

            {/* Quiz History */}
            <div className="mt-8">

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Quiz History
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Completed assessments and results.
                  </p>
                </div>

              </div>

              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">

                {history.length === 0 ? (
                  <div className="p-8 text-center">
                    <ClipboardList
                      size={28}
                      className="mx-auto text-slate-300 dark:text-slate-700"
                    />

                    <p className="mt-2 text-sm text-slate-400">
                      No completed quizzes yet.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-white/10">

                    {history.map((attempt) => (
                      <div
                        key={attempt._id}
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >

                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {attempt.quiz?.title ||
                              "Deleted Quiz"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(
                              attempt.submittedAt
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-5">

                          <div>
                            <p className="text-xs text-slate-400">
                              Score
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {attempt.score} /{" "}
                              {attempt.totalMarks}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Percentage
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {formatScore(
                                attempt.percentage
                              )}
                              %
                            </p>
                          </div>

                          <ResultBadge
                            status={
                              attempt.resultStatus
                            }
                          />

                        </div>

                      </div>
                    ))}

                  </div>
                )}

              </div>

            </div>

          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end dark:border-white/10">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() =>
                onToggleStatus(student)
              }
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              <span className="inline-flex items-center gap-2">
                <Power size={16} />

                {student.status === "ACTIVE"
                  ? "Deactivate Account"
                  : "Activate Account"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onDelete(student)}
              className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              <span className="inline-flex items-center gap-2">
                <Trash2 size={16} />
                Delete Account
              </span>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};


/* =========================================================
   Components
========================================================= */

const UserStat = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">

      <div className="flex items-center gap-4">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <Icon size={20} />
        </div>

        <div>
          <p className="text-xs font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>

      </div>

    </div>
  );
};


const ProfileStat = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <Icon size={17} />
        </div>

        <div>
          <p className="text-xs text-slate-400">
            {label}
          </p>

          <p className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>

      </div>

    </div>
  );
};


const InfoItem = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
        {value}
      </p>
    </div>
  );
};


const TableHeading = ({
  children,
  align = "left",
}) => {
  return (
    <th
      className={`px-5 py-3 text-${align} text-[11px] font-semibold uppercase tracking-wider text-slate-400`}
    >
      {children}
    </th>
  );
};


const StatusBadge = ({ status }) => {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${
        isActive
          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive
            ? "bg-emerald-500"
            : "bg-slate-400"
        }`}
      />

      {isActive ? "Active" : "Inactive"}
    </span>
  );
};


const ResultBadge = ({ status }) => {
  if (status === "PASSED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
        <CheckCircle2 size={14} />
        Passed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
      <XCircle size={14} />
      Failed
    </span>
  );
};


const LoadingRows = () => {
  return (
    <>
      {[1, 2, 3, 4].map((item) => (
        <tr
          key={item}
          className="border-b border-slate-100 dark:border-white/[0.06]"
        >
          {[1, 2, 3, 4, 5, 6, 7].map(
            (column) => (
              <td
                key={column}
                className="px-5 py-5"
              >
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
              </td>
            )
          )}
        </tr>
      ))}
    </>
  );
};


const EmptyState = () => {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-white/5">
        <Users size={24} />
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
        No students found
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Try changing your search or status filter.
      </p>

    </div>
  );
};


/* =========================================================
   Helpers
========================================================= */

const getInitials = (name = "") => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
};


const formatScore = (score) => {
  const number = Number(score);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return Number.isInteger(number)
    ? number
    : number.toFixed(2);
};


const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};


export default AdminUsers;