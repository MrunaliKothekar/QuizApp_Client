import { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  ClipboardList,
  FileCheck2,
  TrendingUp,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trophy,
  Clock3,
  AlertCircle,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout.jsx";
import api from "../../api/axios";

const AdminReports = () => {
  const [overview, setOverview] = useState(null);
  const [quizPerformance, setQuizPerformance] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setError("");

      if (overview) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        overviewResponse,
        performanceResponse,
        recentResponse,
      ] = await Promise.all([
        api.get("/reports/overview"),
        api.get("/reports/quiz-performance"),
        api.get("/reports/recent-attempts"),
      ]);

      setOverview(
        overviewResponse.data?.overview || null
      );

      setQuizPerformance(
        Array.isArray(
          performanceResponse.data?.performance
        )
          ? performanceResponse.data.performance
          : []
      );

      setRecentAttempts(
        Array.isArray(
          recentResponse.data?.attempts
        )
          ? recentResponse.data.attempts
          : []
      );
    } catch (err) {
      console.error("Admin reports error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load reports."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              Analytics & Insights
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Reports
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Monitor quiz performance, student activity and
              overall assessment results.
            </p>
          </div>

          <button
            type="button"
            onClick={loadReports}
            disabled={loading || refreshing}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-medium
              text-slate-700
              shadow-sm
              transition
              hover:border-indigo-200
              hover:bg-indigo-50
              hover:text-indigo-600
              disabled:cursor-not-allowed
              disabled:opacity-60
              dark:border-white/10
              dark:bg-white/[0.04]
              dark:text-slate-300
              dark:hover:border-indigo-500/30
              dark:hover:bg-indigo-500/10
              dark:hover:text-indigo-400
            "
          >
            <RefreshCw
              size={16}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </section>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div
            className="
              flex
              items-start
              gap-3
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-600
              dark:border-red-500/20
              dark:bg-red-500/10
              dark:text-red-400
            "
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading ? (
          <div
            className="
              flex
              min-h-[500px]
              items-center
              justify-center
              rounded-2xl
              border
              border-slate-200
              bg-white
              dark:border-white/10
              dark:bg-white/[0.03]
            "
          >
            <div className="text-center">
              <RefreshCw
                size={28}
                className="mx-auto animate-spin text-indigo-500"
              />

              <p className="mt-3 text-sm text-slate-400">
                Loading reports...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* =================================================
                OVERVIEW
            ================================================= */}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <ReportStat
                label="Total Students"
                value={overview?.totalStudents ?? 0}
                icon={Users}
              />

              <ReportStat
                label="Total Quizzes"
                value={overview?.totalQuizzes ?? 0}
                icon={ClipboardList}
              />

              <ReportStat
                label="Total Attempts"
                value={overview?.totalAttempts ?? 0}
                icon={FileCheck2}
              />

              <ReportStat
                label="Completed Attempts"
                value={
                  overview?.completedAttempts ?? 0
                }
                icon={CheckCircle2}
              />

            </section>

            {/* =================================================
                PERFORMANCE SUMMARY
            ================================================= */}

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">

              <PerformanceCard
                title="Average Score"
                value={
                  overview?.averageScore ?? 0
                }
                suffix={` / ${
                  quizPerformance.length > 0
                    ? "quiz"
                    : "marks"
                }`}
                icon={BarChart3}
              />

              <PerformanceCard
                title="Average Percentage"
                value={
                  overview?.averagePercentage ?? 0
                }
                suffix="%"
                icon={TrendingUp}
              />

              <PerformanceCard
                title="Pass Rate"
                value={
                  overview?.passRate ?? 0
                }
                suffix="%"
                icon={Trophy}
              />

            </section>

            {/* =================================================
                PASS / FAIL
            ================================================= */}

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <ResultCard
                title="Passed Attempts"
                value={
                  overview?.passedAttempts ?? 0
                }
                percentage={
                  overview?.passRate ?? 0
                }
                icon={CheckCircle2}
                type="success"
              />

              <ResultCard
                title="Failed Attempts"
                value={
                  overview?.failedAttempts ?? 0
                }
                percentage={
                  overview?.failRate ?? 0
                }
                icon={XCircle}
                type="danger"
              />

            </section>

            {/* =================================================
                QUIZ PERFORMANCE
            ================================================= */}

            <section
              className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm
                dark:border-white/10
                dark:bg-white/[0.03]
                dark:shadow-none
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-slate-200
                  px-5
                  py-4
                  dark:border-white/10
                "
              >
                <div>
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
                    Quiz Performance
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Performance breakdown for completed
                    quiz attempts.
                  </p>
                </div>

                <BarChart3
                  size={19}
                  className="text-indigo-500"
                />
              </div>

              {quizPerformance.length === 0 ? (
                <EmptyState
                  icon={BarChart3}
                  message="No quiz performance data available yet."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">

                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10">
                        <TableHeading>
                          Quiz
                        </TableHeading>

                        <TableHeading>
                          Attempts
                        </TableHeading>

                        <TableHeading>
                          Avg. Score
                        </TableHeading>

                        <TableHeading>
                          Avg. Percentage
                        </TableHeading>

                        <TableHeading>
                          Passed
                        </TableHeading>

                        <TableHeading>
                          Failed
                        </TableHeading>

                        <TableHeading>
                          Pass Rate
                        </TableHeading>
                      </tr>
                    </thead>

                    <tbody>
                      {quizPerformance.map(
                        (quiz) => (
                          <tr
                            key={quiz._id}
                            className="
                              border-b
                              border-slate-100
                              transition
                              hover:bg-slate-50
                              dark:border-white/[0.06]
                              dark:hover:bg-white/[0.025]
                            "
                          >

                            <td className="px-5 py-4">
                              <div>
                                <p className="max-w-[250px] truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                                  {quiz.title ||
                                    "Untitled Quiz"}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  Total marks:{" "}
                                  {quiz.totalMarks ??
                                    0}
                                </p>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                              {quiz.totalAttempts ??
                                0}
                            </td>

                            <td className="px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                              {quiz.averageScore ??
                                0}
                            </td>

                            <td className="px-5 py-4">
                              <PercentageBadge
                                value={
                                  quiz.averagePercentage ??
                                  0
                                }
                              />
                            </td>

                            <td className="px-5 py-4 text-sm text-emerald-600 dark:text-emerald-400">
                              {quiz.passedAttempts ??
                                0}
                            </td>

                            <td className="px-5 py-4 text-sm text-red-600 dark:text-red-400">
                              {quiz.failedAttempts ??
                                0}
                            </td>

                            <td className="px-5 py-4">
                              <PercentageBadge
                                value={
                                  quiz.passRate ?? 0
                                }
                                success
                              />
                            </td>

                          </tr>
                        )
                      )}
                    </tbody>

                  </table>
                </div>
              )}

            </section>

            {/* =================================================
                RECENT ATTEMPTS
            ================================================= */}

            <section
              className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm
                dark:border-white/10
                dark:bg-white/[0.03]
                dark:shadow-none
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-slate-200
                  px-5
                  py-4
                  dark:border-white/10
                "
              >
                <div>
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
                    Recent Attempts
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Latest completed student attempts.
                  </p>
                </div>

                <Clock3
                  size={19}
                  className="text-indigo-500"
                />
              </div>

              {recentAttempts.length === 0 ? (
                <EmptyState
                  icon={Clock3}
                  message="No completed attempts found."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">

                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10">

                        <TableHeading>
                          Student
                        </TableHeading>

                        <TableHeading>
                          Quiz
                        </TableHeading>

                        <TableHeading>
                          Score
                        </TableHeading>

                        <TableHeading>
                          Percentage
                        </TableHeading>

                        <TableHeading>
                          Result
                        </TableHeading>

                        <TableHeading>
                          Submitted
                        </TableHeading>

                      </tr>
                    </thead>

                    <tbody>
                      {recentAttempts.map(
                        (attempt) => (
                          <tr
                            key={attempt._id}
                            className="
                              border-b
                              border-slate-100
                              transition
                              hover:bg-slate-50
                              dark:border-white/[0.06]
                              dark:hover:bg-white/[0.025]
                            "
                          >

                            {/* Student */}
                            <td className="px-5 py-4">
                              <div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  {attempt.user?.name ||
                                    "Unknown Student"}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  {attempt.user?.email ||
                                    "No email"}
                                </p>
                              </div>
                            </td>

                            {/* Quiz */}
                            <td className="px-5 py-4">
                              <p className="max-w-[220px] truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                                {attempt.quiz?.title ||
                                  "Unknown Quiz"}
                              </p>
                            </td>

                            {/* Score */}
                            <td className="px-5 py-4">
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {attempt.score ?? 0}
                              </span>

                              <span className="ml-1 text-xs text-slate-400">
                                /
                                {attempt.totalMarks ??
                                  attempt.quiz
                                    ?.totalMarks ??
                                  0}
                              </span>
                            </td>

                            {/* Percentage */}
                            <td className="px-5 py-4">
                              <PercentageBadge
                                value={
                                  attempt.percentage ??
                                  0
                                }
                              />
                            </td>

                            {/* Result */}
                            <td className="px-5 py-4">
                              <ResultBadge
                                status={
                                  attempt.resultStatus
                                }
                              />
                            </td>

                            {/* Submitted */}
                            <td className="px-5 py-4">
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {formatDate(
                                  attempt.submittedAt
                                )}
                              </p>
                            </td>

                          </tr>
                        )
                      )}
                    </tbody>

                  </table>
                </div>
              )}

            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
};


// =========================================================
// REPORT STAT
// =========================================================

const ReportStat = ({
  label,
  value,
  icon: Icon,
}) => {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        dark:border-white/10
        dark:bg-white/[0.03]
        dark:shadow-none
      "
    >
      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>

        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-indigo-500/10
            text-indigo-500
            dark:text-indigo-400
          "
        >
          <Icon size={19} />
        </div>

      </div>
    </div>
  );
};


// =========================================================
// PERFORMANCE CARD
// =========================================================

const PerformanceCard = ({
  title,
  value,
  suffix,
  icon: Icon,
}) => {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        dark:border-white/10
        dark:bg-white/[0.03]
        dark:shadow-none
      "
    >
      <div className="flex items-center justify-between">

        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>

        <Icon
          size={18}
          className="text-indigo-500"
        />
      </div>

      <div className="mt-4 flex items-baseline gap-1">

        <span className="text-3xl font-bold text-slate-900 dark:text-white">
          {value}
        </span>

        <span className="text-sm text-slate-400">
          {suffix}
        </span>

      </div>
    </div>
  );
};


// =========================================================
// RESULT CARD
// =========================================================

const ResultCard = ({
  title,
  value,
  percentage,
  icon: Icon,
  type,
}) => {
  const success = type === "success";

  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        dark:border-white/10
        dark:bg-white/[0.03]
        dark:shadow-none
      "
    >
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div
            className={`
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              ${
                success
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-500"
              }
            `}
          >
            <Icon size={19} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {title}
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {value}
            </p>
          </div>

        </div>

        <span
          className={`
            text-lg
            font-bold
            ${
              success
                ? "text-emerald-500"
                : "text-red-500"
            }
          `}
        >
          {percentage}%
        </span>

      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">

        <div
          className={`
            h-full
            rounded-full
            transition-all
            ${
              success
                ? "bg-emerald-500"
                : "bg-red-500"
            }
          `}
          style={{
            width: `${Math.min(
              Math.max(Number(percentage) || 0, 0),
              100
            )}%`,
          }}
        />

      </div>
    </div>
  );
};


// =========================================================
// PERCENTAGE BADGE
// =========================================================

const PercentageBadge = ({
  value,
  success = false,
}) => {
  const numericValue = Number(value) || 0;

  return (
    <span
      className={`
        inline-flex
        rounded-lg
        px-2.5
        py-1
        text-xs
        font-semibold
        ${
          success || numericValue >= 60
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            : numericValue >= 40
            ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
        }
      `}
    >
      {numericValue.toFixed(2)}%
    </span>
  );
};


// =========================================================
// RESULT BADGE
// =========================================================

const ResultBadge = ({ status }) => {
  const passed = status === "PASSED";

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-lg
        px-2.5
        py-1
        text-xs
        font-medium
        ${
          passed
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
        }
      `}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {passed ? "Passed" : "Failed"}
    </span>
  );
};


// =========================================================
// TABLE HEADING
// =========================================================

const TableHeading = ({ children }) => {
  return (
    <th
      className="
        px-5
        py-3
        text-left
        text-[11px]
        font-semibold
        uppercase
        tracking-wider
        text-slate-400
      "
    >
      {children}
    </th>
  );
};


// =========================================================
// EMPTY STATE
// =========================================================

const EmptyState = ({
  icon: Icon,
  message,
}) => {
  return (
    <div className="flex min-h-40 items-center justify-center p-6">

      <div className="text-center">

        <Icon
          size={30}
          className="mx-auto text-slate-300 dark:text-slate-700"
        />

        <p className="mt-3 text-sm text-slate-400">
          {message}
        </p>

      </div>

    </div>
  );
};


// =========================================================
// DATE FORMAT
// =========================================================

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


export default AdminReports;