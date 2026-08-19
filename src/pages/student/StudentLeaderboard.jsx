import { useEffect, useMemo, useState } from "react";
import {
  Trophy,
  RefreshCw,
  Medal,
  Award,
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
  User,
} from "lucide-react";

import StudentLayout from "../../components/student/StudentLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/axios";

const StudentLeaderboard = () => {
  const { user } = useAuth();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setError("");

      if (leaderboard.length > 0) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get("/attempts/leaderboard");

      setLeaderboard(
        Array.isArray(response.data?.leaderboard)
          ? response.data.leaderboard
          : []
      );
    } catch (err) {
      console.error("Student leaderboard error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load leaderboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
   * =========================================================
   * CURRENT STUDENT
   * =========================================================
   */

  const currentStudent = useMemo(() => {
    if (!user || leaderboard.length === 0) {
      return null;
    }

    return (
      leaderboard.find(
        (student) =>
          student.userId === user._id ||
          student.userId === user.id ||
          student.email === user.email
      ) || null
    );
  }, [leaderboard, user]);

  /*
   * =========================================================
   * TOP THREE
   * =========================================================
   */

  const topThree = useMemo(() => {
    return leaderboard.slice(0, 3);
  }, [leaderboard]);

  /*
   * =========================================================
   * STATISTICS
   * =========================================================
   */

  const totalStudents = leaderboard.length;

  const averagePerformance = useMemo(() => {
    if (leaderboard.length === 0) {
      return 0;
    }

    const total = leaderboard.reduce(
      (sum, student) =>
        sum + Number(student.averagePercentage || 0),
      0
    );

    return total / leaderboard.length;
  }, [leaderboard]);

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
              Student Portal
            </p>

            <h1 className="
              mt-1
              text-2xl
              font-bold
              tracking-tight
              text-slate-900
              dark:text-white
            ">
              Leaderboard
            </h1>

            <p className="
              mt-1
              text-sm
              text-slate-500
              dark:text-slate-400
            ">
              See how you rank against other students.
            </p>
          </div>

          <button
            type="button"
            onClick={loadLeaderboard}
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

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </section>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="
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
          ">
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
          <div className="
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
          ">
            <div className="text-center">

              <RefreshCw
                size={28}
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
                Loading leaderboard...
              </p>

            </div>
          </div>
        ) : leaderboard.length === 0 ? (

          /* ===================================================
             EMPTY STATE
          =================================================== */

          <div className="
            flex
            min-h-[400px]
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-200
            bg-white
            dark:border-white/10
            dark:bg-white/[0.03]
          ">
            <div className="text-center">

              <Trophy
                size={42}
                className="
                  mx-auto
                  text-slate-300
                  dark:text-slate-700
                "
              />

              <h2 className="
                mt-4
                text-sm
                font-semibold
                text-slate-700
                dark:text-slate-200
              ">
                No leaderboard data
              </h2>

              <p className="
                mt-1
                text-sm
                text-slate-400
              ">
                Complete a quiz to appear on the leaderboard.
              </p>

            </div>
          </div>

        ) : (
          <>
            {/* =================================================
                MY RANK
            ================================================= */}

            {currentStudent && (
              <section className="
                overflow-hidden
                rounded-2xl
                border
                border-indigo-200
                bg-indigo-50
                dark:border-indigo-500/20
                dark:bg-indigo-500/5
              ">

                <div className="
                  flex
                  flex-col
                  gap-5
                  p-5
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                ">

                  <div className="
                    flex
                    items-center
                    gap-4
                  ">

                    <div className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-indigo-500
                      text-white
                    ">
                      <User size={22} />
                    </div>

                    <div>
                      <p className="
                        text-xs
                        font-medium
                        text-indigo-600
                        dark:text-indigo-400
                      ">
                        Your Ranking
                      </p>

                      <h2 className="
                        mt-0.5
                        text-lg
                        font-bold
                        text-slate-900
                        dark:text-white
                      ">
                        {currentStudent.name ||
                          user?.name ||
                          "You"}
                      </h2>
                    </div>

                  </div>

                  <div className="
                    grid
                    grid-cols-3
                    gap-3
                  ">

                    <MyRankStat
                      label="Rank"
                      value={`#${currentStudent.rank || "—"}`}
                    />

                    <MyRankStat
                      label="Average"
                      value={`${Number(
                        currentStudent.averagePercentage || 0
                      ).toFixed(2)}%`}
                    />

                    <MyRankStat
                      label="Quizzes"
                      value={
                        currentStudent.quizzesTaken || 0
                      }
                    />

                  </div>

                </div>

              </section>
            )}

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <section className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-3
            ">

              <LeaderboardStat
                label="Ranked Students"
                value={totalStudents}
                icon={Trophy}
              />

              <LeaderboardStat
                label="Average Performance"
                value={`${averagePerformance.toFixed(2)}%`}
                icon={TrendingUp}
              />

              <LeaderboardStat
                label="Your Passed Quizzes"
                value={
                  currentStudent?.passedQuizzes || 0
                }
                icon={CheckCircle2}
              />

            </section>

            {/* =================================================
                TOP PERFORMERS
            ================================================= */}

            {topThree.length > 0 && (
              <section>

                <div className="mb-4">

                  <h2 className="
                    text-sm
                    font-semibold
                    text-slate-800
                    dark:text-white
                  ">
                    Top Performers
                  </h2>

                  <p className="
                    mt-1
                    text-xs
                    text-slate-400
                  ">
                    Students with the highest average
                    quiz performance.
                  </p>

                </div>

                <div className="
                  grid
                  grid-cols-1
                  gap-4
                  md:grid-cols-3
                ">

                  {topThree.map(
                    (student, index) => (
                      <TopStudentCard
                        key={student.userId}
                        student={student}
                        position={index}
                        isCurrentStudent={
                          isCurrentStudent(
                            student,
                            user
                          )
                        }
                      />
                    )
                  )}

                </div>

              </section>
            )}

            {/* =================================================
                RANKING TABLE
            ================================================= */}

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

              <div className="
                border-b
                border-slate-200
                p-5
                dark:border-white/10
              ">

                <div>
                  <h2 className="
                    text-sm
                    font-semibold
                    text-slate-800
                    dark:text-white
                  ">
                    Student Rankings
                  </h2>

                  <p className="
                    mt-1
                    text-xs
                    text-slate-400
                  ">
                    Rankings are based on average quiz
                    percentage.
                  </p>
                </div>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[700px]">

                  <thead>

                    <tr className="
                      border-b
                      border-slate-200
                      dark:border-white/10
                    ">

                      <TableHeading>
                        Rank
                      </TableHeading>

                      <TableHeading>
                        Student
                      </TableHeading>

                      <TableHeading>
                        Quizzes
                      </TableHeading>

                      <TableHeading>
                        Average %
                      </TableHeading>

                      <TableHeading>
                        Passed
                      </TableHeading>

                      <TableHeading>
                        Performance
                      </TableHeading>

                    </tr>

                  </thead>

                  <tbody>

                    {leaderboard.map(
                      (student) => (
                        <LeaderboardRow
                          key={student.userId}
                          student={student}
                          isCurrentStudent={isCurrentStudent(
                            student,
                            user
                          )}
                        />
                      )
                    )}

                  </tbody>

                </table>

              </div>

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
                    {leaderboard.length}
                  </span>{" "}
                  ranked students
                </p>

              </div>

            </section>
          </>
        )}

      </div>
    </StudentLayout>
  );
};

/* =========================================================
   LEADERBOARD STAT
========================================================= */

const LeaderboardStat = ({
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
   MY RANK STAT
========================================================= */

const MyRankStat = ({
  label,
  value,
}) => {
  return (
    <div className="
      min-w-[75px]
      rounded-xl
      bg-white
      px-3
      py-2.5
      text-center
      shadow-sm
      dark:bg-white/[0.06]
    ">

      <p className="
        text-[10px]
        font-medium
        uppercase
        tracking-wide
        text-slate-400
      ">
        {label}
      </p>

      <p className="
        mt-1
        text-sm
        font-bold
        text-slate-800
        dark:text-white
      ">
        {value}
      </p>

    </div>
  );
};

/* =========================================================
   TOP STUDENT CARD
========================================================= */

const TopStudentCard = ({
  student,
  position,
  isCurrentStudent,
}) => {
  const rankConfig = [
    {
      icon: Trophy,
      label: "1st Place",
      className:
        "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    },
    {
      icon: Medal,
      label: "2nd Place",
      className:
        "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
    },
    {
      icon: Award,
      label: "3rd Place",
      className:
        "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    },
  ];

  const config =
    rankConfig[position] || rankConfig[2];

  const Icon = config.icon;

  return (
    <div className={`
      rounded-2xl
      border
      bg-white
      p-5
      shadow-sm
      dark:bg-white/[0.03]
      dark:shadow-none
      ${
        isCurrentStudent
          ? "border-indigo-300 ring-2 ring-indigo-500/10 dark:border-indigo-500/40"
          : "border-slate-200 dark:border-white/10"
      }
    `}>

      <div className="
        flex
        items-start
        justify-between
      ">

        <div className={`
          inline-flex
          items-center
          gap-1.5
          rounded-lg
          px-2.5
          py-1
          text-xs
          font-semibold
          ${config.className}
        `}>

          <Icon size={14} />

          {config.label}

        </div>

        {isCurrentStudent && (
          <span className="
            rounded-lg
            bg-indigo-500/10
            px-2
            py-1
            text-[10px]
            font-semibold
            text-indigo-600
            dark:text-indigo-400
          ">
            YOU
          </span>
        )}

      </div>

      <div className="mt-5">

        <p className="
          truncate
          text-base
          font-semibold
          text-slate-800
          dark:text-white
        ">
          {student.name || "Unknown Student"}
        </p>

        <p className="
          mt-1
          text-xs
          text-slate-400
        ">
          Rank #{student.rank}
        </p>

      </div>

      <div className="
        mt-5
        grid
        grid-cols-2
        gap-3
      ">

        <div className="
          rounded-xl
          bg-slate-50
          p-3
          dark:bg-white/[0.04]
        ">

          <p className="
            text-[11px]
            text-slate-400
          ">
            Average
          </p>

          <p className="
            mt-1
            text-lg
            font-bold
            text-indigo-500
          ">
            {Number(
              student.averagePercentage || 0
            ).toFixed(2)}
            %
          </p>

        </div>

        <div className="
          rounded-xl
          bg-slate-50
          p-3
          dark:bg-white/[0.04]
        ">

          <p className="
            text-[11px]
            text-slate-400
          ">
            Quizzes
          </p>

          <p className="
            mt-1
            text-lg
            font-bold
            text-slate-700
            dark:text-slate-200
          ">
            {student.quizzesTaken || 0}
          </p>

        </div>

      </div>

    </div>
  );
};

/* =========================================================
   LEADERBOARD ROW
========================================================= */

const LeaderboardRow = ({
  student,
  isCurrentStudent,
}) => {
  const percentage = Number(
    student.averagePercentage || 0
  );

  return (
    <tr className={`
      border-b
      border-slate-100
      transition
      dark:border-white/[0.06]
      ${
        isCurrentStudent
          ? "bg-indigo-50/70 dark:bg-indigo-500/10"
          : "hover:bg-slate-50 dark:hover:bg-white/[0.025]"
      }
    `}>

      {/* Rank */}

      <td className="px-5 py-4">

        <RankBadge rank={student.rank} />

      </td>

      {/* Student */}

      <td className="px-5 py-4">

        <div className="
          flex
          items-center
          gap-3
        ">

          <div className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            text-sm
            font-semibold
            ${
              isCurrentStudent
                ? "bg-indigo-500 text-white"
                : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
            }
          `}>
            {getInitials(student.name)}
          </div>

          <div className="min-w-0">

            <div className="
              flex
              items-center
              gap-2
            ">

              <p className="
                truncate
                text-sm
                font-semibold
                text-slate-800
                dark:text-slate-200
              ">
                {student.name ||
                  "Unknown Student"}
              </p>

              {isCurrentStudent && (
                <span className="
                  shrink-0
                  rounded-md
                  bg-indigo-500/10
                  px-1.5
                  py-0.5
                  text-[9px]
                  font-bold
                  text-indigo-600
                  dark:text-indigo-400
                ">
                  YOU
                </span>
              )}

            </div>

          </div>

        </div>

      </td>

      {/* Quizzes */}

      <td className="px-5 py-4">

        <span className="
          text-sm
          text-slate-600
          dark:text-slate-400
        ">
          {student.quizzesTaken || 0}
        </span>

      </td>

      {/* Average */}

      <td className="px-5 py-4">

        <PercentageBadge value={percentage} />

      </td>

      {/* Passed */}

      <td className="px-5 py-4">

        <span className="
          text-sm
          font-medium
          text-emerald-600
          dark:text-emerald-400
        ">
          {student.passedQuizzes || 0}
        </span>

      </td>

      {/* Performance */}

      <td className="px-5 py-4">

        <div className="
          flex
          items-center
          gap-3
        ">

          <div className="
            h-2
            w-24
            overflow-hidden
            rounded-full
            bg-slate-100
            dark:bg-white/10
          ">

            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{
                width: `${Math.min(
                  Math.max(percentage, 0),
                  100
                )}%`,
              }}
            />

          </div>

          <span className="
            whitespace-nowrap
            text-xs
            text-slate-400
          ">
            {getPerformanceLabel(percentage)}
          </span>

        </div>

      </td>

    </tr>
  );
};

/* =========================================================
   RANK BADGE
========================================================= */

const RankBadge = ({ rank }) => {
  if (rank <= 3) {
    const config = {
      1: {
        icon: Trophy,
        className:
          "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
      },

      2: {
        icon: Medal,
        className:
          "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
      },

      3: {
        icon: Award,
        className:
          "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
      },
    };

    const current = config[rank];

    if (!current) {
      return (
        <span className="
          flex
          h-8
          w-8
          items-center
          justify-center
          text-sm
          font-semibold
          text-slate-500
        ">
          {rank}
        </span>
      );
    }

    const Icon = current.icon;

    return (
      <div className={`
        flex
        h-8
        w-8
        items-center
        justify-center
        rounded-lg
        ${current.className}
      `}>
        <Icon size={15} />
      </div>
    );
  }

  return (
    <span className="
      flex
      h-8
      w-8
      items-center
      justify-center
      text-sm
      font-semibold
      text-slate-500
      dark:text-slate-400
    ">
      {rank}
    </span>
  );
};

/* =========================================================
   PERCENTAGE BADGE
========================================================= */

const PercentageBadge = ({ value }) => {
  const percentage = Number(value) || 0;

  let className =
    "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400";

  if (percentage >= 80) {
    className =
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
  } else if (percentage >= 60) {
    className =
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
  }

  return (
    <span className={`
      inline-flex
      rounded-lg
      px-2.5
      py-1
      text-xs
      font-semibold
      ${className}
    `}>
      {percentage.toFixed(2)}%
    </span>
  );
};

/* =========================================================
   TABLE HEADING
========================================================= */

const TableHeading = ({ children }) => {
  return (
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
      {children}
    </th>
  );
};

/* =========================================================
   HELPERS
========================================================= */

const getInitials = (name) => {
  if (!name) {
    return "?";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (word) =>
        word.charAt(0).toUpperCase()
    )
    .join("");
};

const getPerformanceLabel = (percentage) => {
  if (percentage >= 90) {
    return "Excellent";
  }

  if (percentage >= 80) {
    return "Very Good";
  }

  if (percentage >= 60) {
    return "Good";
  }

  if (percentage >= 40) {
    return "Average";
  }

  return "Needs Improvement";
};

const isCurrentStudent = (student, user) => {
  if (!student || !user) {
    return false;
  }

  return (
    student.userId === user._id ||
    student.userId === user.id ||
    student.email === user.email
  );
};

export default StudentLeaderboard;