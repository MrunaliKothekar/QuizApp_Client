import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  ClipboardList,
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  X,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";


const AdminAttempts = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [resultFilter, setResultFilter] = useState("ALL");

  useEffect(() => {
    loadAttempts();
  }, []);

  /* =========================================================
     Load Attempts
  ========================================================= */

  const loadAttempts = async () => {
    try {
      setError("");

      if (attempts.length > 0) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get("/attempts");

      const data = response.data;

      setAttempts(
        Array.isArray(data?.attempts)
          ? data.attempts
          : []
      );
    } catch (err) {
      console.error("Admin attempts error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load attempts."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     Filter Attempts
  ========================================================= */

  const filteredAttempts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return attempts.filter((attempt) => {
      const studentName =
        attempt.user?.name?.toLowerCase() || "";

      const studentEmail =
        attempt.user?.email?.toLowerCase() || "";

      const quizTitle =
        attempt.quiz?.title?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        studentName.includes(query) ||
        studentEmail.includes(query) ||
        quizTitle.includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        attempt.status === statusFilter;

      const matchesResult =
        resultFilter === "ALL" ||
        attempt.resultStatus === resultFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesResult
      );
    });
  }, [
    attempts,
    search,
    statusFilter,
    resultFilter,
  ]);

  /* =========================================================
     Statistics
  ========================================================= */

  const stats = useMemo(() => {
    return {
      total: attempts.length,

      completed: attempts.filter(
        (attempt) =>
          attempt.status === "COMPLETED"
      ).length,

      passed: attempts.filter(
        (attempt) =>
          attempt.resultStatus === "PASSED"
      ).length,

      failed: attempts.filter(
        (attempt) =>
          attempt.resultStatus === "FAILED"
      ).length,

      inProgress: attempts.filter(
        (attempt) =>
          attempt.status === "IN_PROGRESS"
      ).length,
    };
  }, [attempts]);

  /* =========================================================
     Helpers
  ========================================================= */

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getScoreText = (attempt) => {
    const score =
      typeof attempt.score === "number"
        ? attempt.score
        : 0;

    const totalMarks =
      typeof attempt.totalMarks === "number"
        ? attempt.totalMarks
        : 0;

    return `${score} / ${totalMarks}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* =====================================================
            Header
        ===================================================== */}

        <section className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-end
          lg:justify-between
        ">
          <div>
            <p className="
              text-sm
              font-medium
              text-indigo-600
              dark:text-indigo-400
            ">
              Assessment Monitoring
            </p>

            <h1 className="
              mt-1
              text-2xl
              font-bold
              tracking-tight
              text-slate-900
              dark:text-white
            ">
              Attempts
            </h1>

            <p className="
              mt-1
              text-sm
              text-slate-500
              dark:text-slate-400
            ">
              Monitor student quiz attempts,
              results and performance.
            </p>
          </div>

          <button
            type="button"
            onClick={loadAttempts}
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
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </section>

        {/* =====================================================
            Messages
        ===================================================== */}

        {error && (
          <div className="
            flex
            items-center
            justify-between
            gap-4
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
          ">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="
            flex
            items-center
            justify-between
            gap-4
            rounded-xl
            border
            border-emerald-200
            bg-emerald-50
            px-4
            py-3
            text-sm
            text-emerald-600
            dark:border-emerald-500/20
            dark:bg-emerald-500/10
            dark:text-emerald-400
          ">
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =====================================================
            Statistics
        ===================================================== */}

        <section className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        ">

          <AttemptStat
            label="Total Attempts"
            value={loading ? "—" : stats.total}
            icon={ClipboardList}
          />

          <AttemptStat
            label="Completed"
            value={loading ? "—" : stats.completed}
            icon={CheckCircle2}
          />

          <AttemptStat
            label="Passed"
            value={loading ? "—" : stats.passed}
            icon={Users}
          />

          <AttemptStat
            label="Failed"
            value={loading ? "—" : stats.failed}
            icon={XCircle}
          />

        </section>

        {/* =====================================================
            Main Card
        ===================================================== */}

        <section className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
          dark:border-white/10
          dark:bg-white/[0.03]
          dark:shadow-none
        ">

          {/* ===================================================
              Filters
          =================================================== */}

          <div className="
            flex
            flex-col
            gap-4
            border-b
            border-slate-200
            p-5
            dark:border-white/10
            lg:flex-row
            lg:items-center
            lg:justify-between
          ">

            {/* Search */}

            <div className="
              flex
              w-full
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-3
              py-2.5
              dark:border-white/10
              dark:bg-white/[0.03]
              lg:max-w-md
            ">
              <Search
                size={18}
                className="text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search student or quiz..."
                className="
                  w-full
                  bg-transparent
                  text-sm
                  text-slate-800
                  outline-none
                  placeholder:text-slate-400
                  dark:text-slate-200
                "
              />
            </div>

            {/* Filters */}

            <div className="
              flex
              flex-wrap
              items-center
              gap-3
            ">

              <div className="
                flex
                items-center
                gap-2
                text-sm
                text-slate-400
              ">
                <Filter size={16} />
                Filters
              </div>

              {/* Status */}

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3
                  py-2.5
                  text-sm
                  text-slate-700
                  outline-none
                  dark:border-white/10
                  dark:bg-slate-900
                  dark:text-slate-200
                "
              >
                <option value="ALL">
                  All Status
                </option>

                <option value="COMPLETED">
                  Completed
                </option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>
              </select>

              {/* Result */}

              <select
                value={resultFilter}
                onChange={(e) =>
                  setResultFilter(
                    e.target.value
                  )
                }
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3
                  py-2.5
                  text-sm
                  text-slate-700
                  outline-none
                  dark:border-white/10
                  dark:bg-slate-900
                  dark:text-slate-200
                "
              >
                <option value="ALL">
                  All Results
                </option>

                <option value="PASSED">
                  Passed
                </option>

                <option value="FAILED">
                  Failed
                </option>
              </select>

            </div>
          </div>

          {/* ===================================================
              Loading
          =================================================== */}

          {loading ? (
            <div className="
              flex
              min-h-80
              items-center
              justify-center
            ">
              <div className="text-center">

                <RefreshCw
                  size={24}
                  className="
                    mx-auto
                    animate-spin
                    text-indigo-500
                  "
                />

                <p className="
                  mt-3
                  text-sm
                  text-slate-400
                ">
                  Loading attempts...
                </p>

              </div>
            </div>
          ) : filteredAttempts.length === 0 ? (

            /* =================================================
               Empty
            ================================================= */

            <div className="
              flex
              min-h-80
              items-center
              justify-center
              p-6
            ">
              <div className="text-center">

                <ClipboardList
                  size={36}
                  className="
                    mx-auto
                    text-slate-300
                    dark:text-slate-700
                  "
                />

                <p className="
                  mt-4
                  text-sm
                  font-semibold
                  text-slate-700
                  dark:text-slate-200
                ">
                  No attempts found
                </p>

                <p className="
                  mt-1
                  text-sm
                  text-slate-400
                ">
                  {attempts.length === 0
                    ? "Student attempts will appear here."
                    : "Try changing your search or filters."}
                </p>

              </div>
            </div>

          ) : (

            /* =================================================
               Table
            ================================================= */

            <div className="overflow-x-auto">

              <table className="
                w-full
                min-w-[1100px]
              ">

                <thead>
                  <tr className="
                    border-b
                    border-slate-200
                    dark:border-white/10
                  ">

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
                      Status
                    </TableHeading>

                    <TableHeading>
                      Submitted
                    </TableHeading>

                    <TableHeading align="right">
                      Action
                    </TableHeading>

                  </tr>
                </thead>

                <tbody>

                  {filteredAttempts.map(
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

                          <div className="
                            flex
                            items-center
                            gap-3
                          ">

                            <div className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              bg-indigo-500/10
                              text-sm
                              font-semibold
                              text-indigo-600
                              dark:text-indigo-400
                            ">
                              {(
                                attempt.user?.name ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">

                              <p className="
                                truncate
                                text-sm
                                font-semibold
                                text-slate-800
                                dark:text-slate-200
                              ">
                                {attempt.user?.name ||
                                  "Unknown Student"}
                              </p>

                              <p className="
                                mt-0.5
                                max-w-[220px]
                                truncate
                                text-xs
                                text-slate-400
                              ">
                                {attempt.user?.email ||
                                  "No email"}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Quiz */}

                        <td className="px-5 py-4">

                          <div className="max-w-[220px]">

                            <p className="
                              truncate
                              text-sm
                              font-medium
                              text-slate-700
                              dark:text-slate-300
                            ">
                              {attempt.quiz?.title ||
                                "Unknown Quiz"}
                            </p>

                          </div>

                        </td>

                        {/* Score */}

                        <td className="
                          px-5
                          py-4
                          text-sm
                          font-semibold
                          text-slate-700
                          dark:text-slate-300
                        ">
                          {getScoreText(attempt)}
                        </td>

                        {/* Percentage */}

                        <td className="px-5 py-4">

                          <span className="
                            text-sm
                            font-semibold
                            text-slate-700
                            dark:text-slate-300
                          ">
                            {typeof attempt.percentage ===
                            "number"
                              ? `${attempt.percentage.toFixed(
                                  1
                                )}%`
                              : "0%"}
                          </span>

                        </td>

                        {/* Result */}

                        <td className="px-5 py-4">

                          <ResultBadge
                            resultStatus={
                              attempt.resultStatus
                            }
                          />

                        </td>

                        {/* Status */}

                        <td className="px-5 py-4">

                          <AttemptStatusBadge
                            status={
                              attempt.status
                            }
                          />

                        </td>

                        {/* Submitted */}

                        <td className="
                          px-5
                          py-4
                          text-sm
                          text-slate-500
                          dark:text-slate-400
                        ">
                          <div>
                            <p>
                              {formatDate(
                                attempt.submittedAt
                              )}
                            </p>

                            {attempt.submittedAt && (
                              <p className="
                                mt-0.5
                                text-xs
                                text-slate-400
                              ">
                                {new Date(
                                  attempt.submittedAt
                                ).toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour: "2-digit",
                                    minute:
                                      "2-digit",
                                  }
                                )}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Action */}

                        <td className="px-5 py-4">

                          <div className="
                            flex
                            justify-end
                          ">

                            <button
                              type="button"
                              title="View attempt"
                              onClick={() => {
                                navigate(`/admin/attempts/${attempt._id}`);
                              }}
                              className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-lg
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-slate-500
                                transition
                                hover:bg-indigo-50
                                hover:text-indigo-600
                                dark:text-slate-400
                                dark:hover:bg-indigo-500/10
                                dark:hover:text-indigo-400
                              "
                            >
                              <Eye size={16} />
                              View
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

          {/* ===================================================
              Footer
          =================================================== */}

          {!loading &&
            attempts.length > 0 && (
              <div className="
                border-t
                border-slate-200
                px-5
                py-4
                dark:border-white/10
              ">

                <p className="
                  text-xs
                  text-slate-400
                ">
                  Showing{" "}
                  <span className="
                    font-medium
                    text-slate-600
                    dark:text-slate-300
                  ">
                    {filteredAttempts.length}
                  </span>{" "}
                  of{" "}
                  <span className="
                    font-medium
                    text-slate-600
                    dark:text-slate-300
                  ">
                    {attempts.length}
                  </span>{" "}
                  attempts
                </p>

              </div>
            )}

        </section>

      </div>
    </AdminLayout>
  );
};

/* =========================================================
   Statistics Card
========================================================= */

const AttemptStat = ({
  label,
  value,
  icon: Icon,
}) => {
  return (
    <div className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-5
      shadow-sm
      dark:border-white/10
      dark:bg-white/[0.03]
      dark:shadow-none
    ">

      <div className="
        flex
        items-start
        justify-between
      ">

        <div>

          <p className="
            text-xs
            font-medium
            text-slate-400
          ">
            {label}
          </p>

          <p className="
            mt-2
            text-2xl
            font-bold
            text-slate-900
            dark:text-white
          ">
            {value}
          </p>

        </div>

        <div className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          bg-indigo-500/10
          text-indigo-500
          dark:text-indigo-400
        ">
          <Icon size={19} />
        </div>

      </div>

    </div>
  );
};

/* =========================================================
   Table Heading
========================================================= */

const TableHeading = ({
  children,
  align = "left",
}) => {
  return (
    <th
      className={`
        px-5
        py-3
        text-${align}
        text-[11px]
        font-semibold
        uppercase
        tracking-wider
        text-slate-400
      `}
    >
      {children}
    </th>
  );
};

/* =========================================================
   Result Badge
========================================================= */

const ResultBadge = ({
  resultStatus,
}) => {
  if (resultStatus === "PASSED") {
    return (
      <span className="
        inline-flex
        items-center
        gap-1.5
        rounded-lg
        bg-emerald-50
        px-2.5
        py-1
        text-xs
        font-medium
        text-emerald-600
        dark:bg-emerald-500/10
        dark:text-emerald-400
      ">
        <CheckCircle2 size={13} />
        Passed
      </span>
    );
  }

  if (resultStatus === "FAILED") {
    return (
      <span className="
        inline-flex
        items-center
        gap-1.5
        rounded-lg
        bg-red-50
        px-2.5
        py-1
        text-xs
        font-medium
        text-red-600
        dark:bg-red-500/10
        dark:text-red-400
      ">
        <XCircle size={13} />
        Failed
      </span>
    );
  }

  return (
    <span className="
      inline-flex
      items-center
      gap-1.5
      rounded-lg
      bg-slate-100
      px-2.5
      py-1
      text-xs
      font-medium
      text-slate-500
      dark:bg-white/5
      dark:text-slate-400
    ">
      —
      Pending
    </span>
  );
};

/* =========================================================
   Attempt Status Badge
========================================================= */

const AttemptStatusBadge = ({
  status,
}) => {
  if (status === "COMPLETED") {
    return (
      <span className="
        inline-flex
        items-center
        gap-1.5
        rounded-lg
        bg-indigo-50
        px-2.5
        py-1
        text-xs
        font-medium
        text-indigo-600
        dark:bg-indigo-500/10
        dark:text-indigo-400
      ">
        <CheckCircle2 size={13} />
        Completed
      </span>
    );
  }

  return (
    <span className="
      inline-flex
      items-center
      gap-1.5
      rounded-lg
      bg-amber-50
      px-2.5
      py-1
      text-xs
      font-medium
      text-amber-600
      dark:bg-amber-500/10
      dark:text-amber-400
    ">
      <Clock3 size={13} />
      In Progress
    </span>
  );
};

export default AdminAttempts;