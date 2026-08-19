import { useEffect, useMemo, useState } from "react";
import {
  History,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock3,
  Eye,
  Search,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import StudentLayout from "../../components/student/StudentLayout.jsx";
import api from "../../api/axios";

const StudentAttempts = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  /*
   * =========================================================
   * LOAD ATTEMPTS
   * =========================================================
   */

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/attempts/my");

      const data = response.data;

      setAttempts(
        Array.isArray(data?.attempts)
          ? data.attempts
          : []
      );
    } catch (err) {
      console.error("Student attempts error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your attempts."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================================
   * STATISTICS
   * =========================================================
   */

  const completedAttempts = useMemo(() => {
    return attempts.filter(
      (attempt) => attempt.status === "COMPLETED"
    );
  }, [attempts]);

  const passedAttempts = useMemo(() => {
    return completedAttempts.filter(
      (attempt) => attempt.resultStatus === "PASSED"
    );
  }, [completedAttempts]);

  const failedAttempts = useMemo(() => {
    return completedAttempts.filter(
      (attempt) => attempt.resultStatus === "FAILED"
    );
  }, [completedAttempts]);

  const averageScore = useMemo(() => {
    if (completedAttempts.length === 0) {
      return 0;
    }

    const total = completedAttempts.reduce(
      (sum, attempt) =>
        sum + Number(attempt.percentage || 0),
      0
    );

    return Math.round(
      (total / completedAttempts.length) * 10
    ) / 10;
  }, [completedAttempts]);

  /*
   * =========================================================
   * FILTER ATTEMPTS
   * =========================================================
   */

  const filteredAttempts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return attempts.filter((attempt) => {
      const quizTitle =
        attempt.quiz?.title?.toLowerCase() || "";

      const matchesSearch =
        !query || quizTitle.includes(query);

      if (!matchesSearch) {
        return false;
      }

      if (filter === "PASSED") {
        return attempt.resultStatus === "PASSED";
      }

      if (filter === "FAILED") {
        return attempt.resultStatus === "FAILED";
      }

      if (filter === "IN_PROGRESS") {
        return attempt.status === "IN_PROGRESS";
      }

      return true;
    });
  }, [attempts, search, filter]);

  /*
   * =========================================================
   * HELPERS
   * =========================================================
   */

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const handleAttemptAction = (attempt) => {
    if (attempt.status === "IN_PROGRESS") {
      navigate(
        `/student/quizzes/${attempt.quiz?._id}?attemptId=${attempt._id}`
      );

      return;
    }

    navigate(`/student/attempts/${attempt._id}`);
  };

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <StudentLayout>
      <div className="space-y-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div>
          <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
            Student Portal
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Attempts
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View your quiz history, scores and results.
          </p>
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="
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
            {error}
          </div>
        )}

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          lg:grid-cols-4
        ">

          <AttemptStat
            label="Total Attempts"
            value={attempts.length}
            icon={History}
          />

          <AttemptStat
            label="Completed"
            value={completedAttempts.length}
            icon={ClipboardList}
          />

          <AttemptStat
            label="Passed"
            value={passedAttempts.length}
            icon={Trophy}
          />

          <AttemptStat
            label="Average Score"
            value={`${averageScore}%`}
            icon={CheckCircle2}
          />

        </div>

        {/* =====================================================
            SEARCH + FILTER
        ===================================================== */}

        <div className="
          flex
          flex-col
          gap-3
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
          shadow-sm
          dark:border-white/10
          dark:bg-white/[0.03]
          dark:shadow-none
          sm:flex-row
          sm:items-center
          sm:justify-between
        ">

          {/* Search */}

          <div className="relative w-full sm:max-w-sm">

            <Search
              size={17}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search quiz..."
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                py-2.5
                pl-9
                pr-3
                text-sm
                text-slate-800
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-500/20
                dark:border-white/10
                dark:bg-white/[0.04]
                dark:text-slate-100
              "
            />

          </div>

          {/* Filters */}

          <div className="flex gap-1.5 overflow-x-auto">

            <FilterButton
              label="All"
              active={filter === "ALL"}
              onClick={() => setFilter("ALL")}
            />

            <FilterButton
              label="Passed"
              active={filter === "PASSED"}
              onClick={() => setFilter("PASSED")}
            />

            <FilterButton
              label="Failed"
              active={filter === "FAILED"}
              onClick={() => setFilter("FAILED")}
            />

            <FilterButton
              label="In Progress"
              active={filter === "IN_PROGRESS"}
              onClick={() =>
                setFilter("IN_PROGRESS")
              }
            />

          </div>
        </div>

        {/* =====================================================
            ATTEMPT HISTORY
        ===================================================== */}

        <div className="
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

          {/* Header */}

          <div className="
            flex
            items-center
            justify-between
            border-b
            border-slate-200
            px-5
            py-4
            dark:border-white/10
          ">

            <div>
              <h2 className="
                text-sm
                font-semibold
                text-slate-800
                dark:text-slate-200
              ">
                Attempt History
              </h2>

              <p className="
                mt-0.5
                text-xs
                text-slate-400
              ">
                All your quiz attempts
              </p>
            </div>

            <History
              size={18}
              className="text-slate-400"
            />

          </div>

          {/* Loading */}

          {loading ? (
            <div className="
              flex
              flex-col
              items-center
              justify-center
              px-6
              py-16
            ">

              <div className="
                h-7
                w-7
                animate-spin
                rounded-full
                border-2
                border-slate-200
                border-t-indigo-500
                dark:border-white/10
                dark:border-t-indigo-400
              " />

              <p className="
                mt-3
                text-sm
                text-slate-400
              ">
                Loading attempts...
              </p>

            </div>
          ) : filteredAttempts.length === 0 ? (

            /* =================================================
               EMPTY STATE
            ================================================= */

            <div className="
              flex
              flex-col
              items-center
              justify-center
              px-6
              py-16
              text-center
            ">

              <div className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-slate-100
                text-slate-400
                dark:bg-white/5
              ">
                <History size={22} />
              </div>

              <h3 className="
                mt-4
                text-sm
                font-semibold
                text-slate-700
                dark:text-slate-200
              ">
                No attempts found
              </h3>

              <p className="
                mt-1
                text-sm
                text-slate-400
              ">
                {attempts.length === 0
                  ? "You have not attempted any quizzes yet."
                  : "Try changing your search or filter."}
              </p>

              {attempts.length === 0 && (
                <button
                  type="button"
                  onClick={() =>
                    navigate("/student/quizzes")
                  }
                  className="
                    mt-5
                    rounded-xl
                    bg-indigo-500
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    shadow-indigo-500/20
                    transition
                    hover:bg-indigo-600
                  "
                >
                  Browse Quizzes
                </button>
              )}

            </div>

          ) : (

            /* =================================================
               TABLE
            ================================================= */

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">

                <thead>
                  <tr className="
                    border-b
                    border-slate-200
                    dark:border-white/10
                  ">

                    <th className="
                      px-5
                      py-3
                      text-left
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-400
                    ">
                      Quiz
                    </th>

                    <th className="
                      px-5
                      py-3
                      text-left
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-400
                    ">
                      Score
                    </th>

                    <th className="
                      px-5
                      py-3
                      text-left
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-400
                    ">
                      Percentage
                    </th>

                    <th className="
                      px-5
                      py-3
                      text-left
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-400
                    ">
                      Result
                    </th>

                    <th className="
                      px-5
                      py-3
                      text-left
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-400
                    ">
                      Date
                    </th>

                    <th className="
                      px-5
                      py-3
                      text-right
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-400
                    ">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredAttempts.map(
                    (attempt) => (
                      <AttemptRow
                        key={attempt._id}
                        attempt={attempt}
                        onAction={
                          handleAttemptAction
                        }
                        formatDate={formatDate}
                      />
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>
    </StudentLayout>
  );
};

/* =========================================================
   STAT CARD
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
        items-center
        justify-between
      ">

        <p className="
          text-xs
          font-medium
          text-slate-400
        ">
          {label}
        </p>

        <div className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          bg-indigo-500/10
          text-indigo-500
          dark:text-indigo-400
        ">
          <Icon size={18} />
        </div>

      </div>

      <p className="
        mt-3
        text-2xl
        font-bold
        text-slate-900
        dark:text-white
      ">
        {value}
      </p>

    </div>
  );
};

/* =========================================================
   FILTER BUTTON
========================================================= */

const FilterButton = ({
  label,
  active,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        whitespace-nowrap
        rounded-lg
        px-3
        py-2
        text-xs
        font-medium
        transition
        ${
          active
            ? "bg-indigo-500 text-white"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
        }
      `}
    >
      {label}
    </button>
  );
};

/* =========================================================
   ATTEMPT ROW
========================================================= */

const AttemptRow = ({
  attempt,
  onAction,
  formatDate,
}) => {
  const isInProgress =
    attempt.status === "IN_PROGRESS";

  const isPassed =
    attempt.resultStatus === "PASSED";

  const isFailed =
    attempt.resultStatus === "FAILED";

  return (
    <tr className="
      border-b
      border-slate-100
      transition
      last:border-0
      hover:bg-slate-50
      dark:border-white/5
      dark:hover:bg-white/[0.02]
    ">

      {/* Quiz */}

      <td className="px-5 py-4">

        <div className="
          flex
          items-center
          gap-3
        ">

          <div className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-indigo-500/10
            text-indigo-500
            dark:text-indigo-400
          ">
            <ClipboardList size={17} />
          </div>

          <div className="min-w-0">

            <p className="
              max-w-[240px]
              truncate
              text-sm
              font-medium
              text-slate-700
              dark:text-slate-200
            ">
              {attempt.quiz?.title ||
                "Unknown Quiz"}
            </p>

            <p className="
              mt-0.5
              text-xs
              text-slate-400
            ">
              {attempt.quiz?.duration || 0} min
              {" • "}
              {attempt.totalMarks || 0} marks
            </p>

          </div>

        </div>

      </td>

      {/* Score */}

      <td className="px-5 py-4">

        <span className="
          text-sm
          font-semibold
          text-slate-700
          dark:text-slate-200
        ">
          {attempt.score ?? 0}
        </span>

        <span className="
          text-sm
          text-slate-400
        ">
          {" "}
          / {attempt.totalMarks ?? 0}
        </span>

      </td>

      {/* Percentage */}

      <td className="px-5 py-4">

        <span className="
          text-sm
          font-medium
          text-slate-700
          dark:text-slate-200
        ">
          {Number(
            attempt.percentage || 0
          ).toFixed(1)}
          %
        </span>

      </td>

      {/* Result */}

      <td className="px-5 py-4">

        {isInProgress ? (
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
        ) : isPassed ? (
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
        ) : isFailed ? (
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
        ) : (
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
        )}

      </td>

      {/* Date */}

      <td className="
        whitespace-nowrap
        px-5
        py-4
        text-sm
        text-slate-500
        dark:text-slate-400
      ">
        {formatDate(
          attempt.submittedAt ||
            attempt.createdAt ||
            attempt.startedAt
        )}
      </td>

      {/* Action */}

      <td className="
        px-5
        py-4
        text-right
      ">

        <button
          type="button"
          onClick={() => onAction(attempt)}
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-lg
            px-3
            py-2
            text-xs
            font-semibold
            text-indigo-600
            transition
            hover:bg-indigo-50
            dark:text-indigo-400
            dark:hover:bg-indigo-500/10
          "
        >
          <Eye size={14} />

          {isInProgress
            ? "Continue"
            : "Review"}
        </button>

      </td>

    </tr>
  );
};

export default StudentAttempts;

