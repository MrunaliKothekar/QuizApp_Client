import { useEffect, useState } from "react";
import {
  Users,
  ClipboardList,
  BarChart3,
  Trophy,
  UserPlus,
  FilePlus2,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import StatCard from "../../components/common/StatCard";
import api from "../../api/axios";

const EMPTY_DASHBOARD = {
  stats: {
    totalUsers: 0,
    totalQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0,
  },
  recentActivity: [],
};

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async (isManualRefresh = false) => {
    try {
      setError("");

      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      /*
       * The backend is the single source of truth.
       *
       * We do NOT:
       * - count quizzes on the frontend
       * - count questions
       * - hardcode statistics
       * - calculate users/quizzes from another API
       */

      const response = await api.get("/dashboard/admin");

      const data = response.data;

      setDashboard({
        stats: {
          totalUsers: Number(data?.stats?.totalUsers) || 0,
          totalQuizzes: Number(data?.stats?.totalQuizzes) || 0,
          totalAttempts: Number(data?.stats?.totalAttempts) || 0,
          averageScore: Number(data?.stats?.averageScore) || 0,
        },

        recentActivity: Array.isArray(data?.recentActivity)
          ? data.recentActivity
          : [],
      });
    } catch (err) {
      console.error("Admin dashboard error:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please sign in again.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to access the admin dashboard.");
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load dashboard data."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const {
    totalUsers,
    totalQuizzes,
    totalAttempts,
    averageScore,
  } = dashboard.stats;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">

      {/* Sidebar */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main area */}
      <div className="lg:ml-64">

        {/* Navbar */}
        <AdminNavbar
          setMobileOpen={setMobileOpen}
        />

        <main className="p-4 sm:p-6 lg:p-8">

          {/* Header */}
          <section className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  Overview
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Welcome back, Administrator 👋
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Here's what's happening across your quiz platform.
                </p>
              </div>

              {/* Refresh */}
              <button
                type="button"
                onClick={() => fetchDashboard(true)}
                disabled={loading || refreshing}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
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
                onClick={() => fetchDashboard(true)}
                className="shrink-0 font-medium underline underline-offset-2"
              >
                Retry
              </button>

            </div>
          )}

          {/* Statistics */}
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Total Users"
              value={loading ? "—" : totalUsers}
              icon={Users}
              description="Registered users"
            />

            <StatCard
              title="Total Quizzes"
              value={loading ? "—" : totalQuizzes}
              icon={ClipboardList}
              description="Created quizzes"
            />

            <StatCard
              title="Total Attempts"
              value={loading ? "—" : totalAttempts}
              icon={BarChart3}
              description="Completed submissions"
            />

            <StatCard
              title="Average Score"
              value={
                loading
                  ? "—"
                  : `${formatScore(averageScore)}%`
              }
              icon={Trophy}
              description="Overall performance"
            />

          </section>

          {/* Recent Activity */}
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-6">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Recent Activity
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Latest activity across the platform.
                </p>
              </div>

            </div>

            <div className="mt-6 space-y-3">

              {loading ? (
                <LoadingActivity />
              ) : dashboard.recentActivity.length === 0 ? (
                <EmptyActivity />
              ) : (
                dashboard.recentActivity.map(
                  (activity, index) => (
                    <ActivityItem
                      key={
                        activity.id ||
                        `${activity.type}-${activity.date}-${index}`
                      }
                      activity={activity}
                    />
                  )
                )
              )}

            </div>

          </section>

        </main>
      </div>
    </div>
  );
};


/* =====================================================
   Activity Item
===================================================== */

const ActivityItem = ({ activity }) => {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-slate-200 hover:bg-slate-50 dark:border-white/5 dark:bg-white/[0.02] dark:hover:border-white/10 dark:hover:bg-white/[0.04]">

      {/* Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        {getActivityIcon(activity.type)}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">

        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {activity.title}
        </p>

        <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
          {activity.description}
        </p>

      </div>

      {/* Date */}
      <p className="hidden shrink-0 text-xs text-slate-400 sm:block">
        {formatDate(activity.date)}
      </p>

    </div>
  );
};


/* =====================================================
   Activity Icon
===================================================== */

const getActivityIcon = (type) => {
  switch (type) {
    case "USER_REGISTERED":
      return <UserPlus size={18} />;

    case "QUIZ_CREATED":
      return <FilePlus2 size={18} />;

    case "QUIZ_COMPLETED":
      return <CheckCircle2 size={18} />;

    default:
      return <Clock size={18} />;
  }
};


/* =====================================================
   Loading Activity
===================================================== */

const LoadingActivity = () => {
  return (
    <div className="space-y-3">

      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/[0.02]"
        >

          <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />

          <div className="flex-1 space-y-2">

            <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-white/10" />

            <div className="h-3 w-64 max-w-full animate-pulse rounded bg-slate-200 dark:bg-white/10" />

          </div>

        </div>
      ))}

    </div>
  );
};


/* =====================================================
   Empty Activity
===================================================== */

const EmptyActivity = () => {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-white/10">

      <p className="text-sm text-slate-400">
        No recent activity
      </p>

    </div>
  );
};


/* =====================================================
   Date Formatting
===================================================== */

const formatDate = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};


/* =====================================================
   Score Formatting
===================================================== */

const formatScore = (score) => {
  const number = Number(score);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return Number.isInteger(number)
    ? number
    : number.toFixed(2);
};


export default AdminDashboard;