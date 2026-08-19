import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Trophy,
  Target,
  CheckCircle2,
  ArrowRight,
  Clock3,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import StudentLayout from "../../components/student/StudentLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/axios";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [attemptsResponse, quizzesResponse] =
        await Promise.all([
          api.get("/attempts/my"),
          api.get("/quizzes"),
        ]);

      const attemptsData = attemptsResponse.data;
      const quizzesData = quizzesResponse.data;

      setAttempts(
        Array.isArray(attemptsData?.attempts)
          ? attemptsData.attempts
          : []
      );

      setQuizzes(
        Array.isArray(quizzesData?.quizzes)
          ? quizzesData.quizzes
          : []
      );
    } catch (err) {
      console.error("Student dashboard error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  const completedAttempts = useMemo(
    () =>
      attempts.filter(
        (attempt) => attempt.status === "COMPLETED"
      ),
    [attempts]
  );

  const passedAttempts = useMemo(
    () =>
      completedAttempts.filter(
        (attempt) => attempt.resultStatus === "PASSED"
      ),
    [completedAttempts]
  );

  const averageScore = useMemo(() => {
    if (completedAttempts.length === 0) return 0;

    const total = completedAttempts.reduce(
      (sum, attempt) =>
        sum + Number(attempt.percentage || 0),
      0
    );

    return Math.round(
      (total / completedAttempts.length) * 10
    ) / 10;
  }, [completedAttempts]);

  const publishedQuizzes = useMemo(
    () =>
      quizzes.filter(
        (quiz) => quiz.status === "PUBLISHED"
      ),
    [quizzes]
  );

  const recentAttempts = completedAttempts.slice(0, 5);

  const getResultStyle = (status) => {
    if (status === "PASSED") {
      return {
        label: "Passed",
        className:
          "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
      };
    }

    return {
      label: "Failed",
      className:
        "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    };
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <StudentLayout>
      <div className="space-y-6">

        {/* Header */}
        <section>
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Student Portal
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.name || "Student"}!
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track your quiz progress and discover new quizzes.
          </p>
        </section>

        {/* Error */}
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
            <div className="flex items-center gap-2">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={loadDashboard}
              className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                px-3
                py-1.5
                text-xs
                font-medium
                hover:bg-red-100
                dark:hover:bg-red-500/10
              "
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
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
              <RefreshCw
                size={25}
                className="mx-auto animate-spin text-indigo-500"
              />

              <p className="mt-3 text-sm text-slate-400">
                Loading your dashboard...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <section className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              xl:grid-cols-4
            ">

              <DashboardStat
                label="Quizzes Attempted"
                value={completedAttempts.length}
                icon={ClipboardList}
              />

              <DashboardStat
                label="Average Score"
                value={`${averageScore}%`}
                icon={Target}
              />

              <DashboardStat
                label="Passed Quizzes"
                value={passedAttempts.length}
                icon={CheckCircle2}
              />

              <DashboardStat
                label="Available Quizzes"
                value={publishedQuizzes.length}
                icon={Trophy}
              />

            </section>

            {/* Main Grid */}
            <section className="
              grid
              grid-cols-1
              gap-6
              xl:grid-cols-3
            ">

              {/* Recent Attempts */}
              <div className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm
                xl:col-span-2
                dark:border-white/10
                dark:bg-white/[0.03]
                dark:shadow-none
              ">

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
                      text-slate-900
                      dark:text-white
                    ">
                      Recent Attempts
                    </h2>

                    <p className="
                      mt-0.5
                      text-xs
                      text-slate-400
                    ">
                      Your latest quiz activity
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/student/attempts")
                    }
                    className="
                      inline-flex
                      items-center
                      gap-1
                      text-xs
                      font-semibold
                      text-indigo-600
                      hover:text-indigo-700
                      dark:text-indigo-400
                    "
                  >
                    View all
                    <ArrowRight size={14} />
                  </button>

                </div>

                {recentAttempts.length === 0 ? (
                  <div className="
                    flex
                    min-h-52
                    items-center
                    justify-center
                    px-5
                  ">
                    <div className="text-center">

                      <ClipboardList
                        size={32}
                        className="
                          mx-auto
                          text-slate-300
                          dark:text-slate-700
                        "
                      />

                      <p className="
                        mt-3
                        text-sm
                        font-medium
                        text-slate-600
                        dark:text-slate-300
                      ">
                        No quiz attempts yet
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          navigate("/student/quizzes")
                        }
                        className="
                          mt-3
                          text-xs
                          font-semibold
                          text-indigo-600
                          hover:text-indigo-700
                          dark:text-indigo-400
                        "
                      >
                        Browse available quizzes
                      </button>

                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">

                    {recentAttempts.map((attempt) => {
                      const result = getResultStyle(
                        attempt.resultStatus
                      );

                      return (
                        <div
                          key={attempt._id}
                          className="
                            flex
                            items-center
                            justify-between
                            gap-4
                            px-5
                            py-4
                            transition
                            hover:bg-slate-50
                            dark:hover:bg-white/[0.02]
                          "
                        >

                          <div className="min-w-0">

                            <p className="
                              truncate
                              text-sm
                              font-semibold
                              text-slate-800
                              dark:text-slate-200
                            ">
                              {attempt.quiz?.title ||
                                "Quiz"}
                            </p>

                            <div className="
                              mt-1
                              flex
                              items-center
                              gap-2
                              text-xs
                              text-slate-400
                            ">
                              <Clock3 size={13} />
                              {formatDate(
                                attempt.submittedAt ||
                                  attempt.createdAt
                              )}
                            </div>

                          </div>

                          <div className="
                            flex
                            shrink-0
                            items-center
                            gap-3
                          ">

                            <div className="text-right">
                              <p className="
                                text-sm
                                font-bold
                                text-slate-800
                                dark:text-slate-200
                              ">
                                {attempt.percentage || 0}%
                              </p>

                              <p className="
                                text-xs
                                text-slate-400
                              ">
                                {attempt.score || 0}/
                                {attempt.totalMarks || 0}
                              </p>
                            </div>

                            <span className={`
                              rounded-lg
                              px-2.5
                              py-1
                              text-xs
                              font-medium
                              ${result.className}
                            `}>
                              {result.label}
                            </span>

                          </div>

                        </div>
                      );
                    })}

                  </div>
                )}

              </div>

              {/* Available Quizzes */}
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
                      text-slate-900
                      dark:text-white
                    ">
                      Available Quizzes
                    </h2>

                    <p className="
                      mt-0.5
                      text-xs
                      text-slate-400
                    ">
                      Start something new
                    </p>
                  </div>

                  <ClipboardList
                    size={18}
                    className="text-indigo-500"
                  />

                </div>

                {publishedQuizzes.length === 0 ? (
                  <div className="
                    flex
                    min-h-52
                    items-center
                    justify-center
                    px-5
                  ">
                    <p className="
                      text-center
                      text-sm
                      text-slate-400
                    ">
                      No published quizzes available.
                    </p>
                  </div>
                ) : (
                  <div className="p-4">

                    <div className="space-y-2">

                      {publishedQuizzes
                        .slice(0, 4)
                        .map((quiz) => (
                          <button
                            key={quiz._id}
                            type="button"
                            onClick={() =>
                              navigate(
                                `/student/quizzes/${quiz._id}`
                              )
                            }
                            className="
                              flex
                              w-full
                              items-center
                              justify-between
                              gap-3
                              rounded-xl
                              border
                              border-slate-100
                              px-3
                              py-3
                              text-left
                              transition
                              hover:border-indigo-200
                              hover:bg-indigo-50
                              dark:border-white/[0.06]
                              dark:hover:border-indigo-500/20
                              dark:hover:bg-indigo-500/5
                            "
                          >

                            <div className="min-w-0">

                              <p className="
                                truncate
                                text-sm
                                font-medium
                                text-slate-700
                                dark:text-slate-200
                              ">
                                {quiz.title}
                              </p>

                              <p className="
                                mt-0.5
                                text-xs
                                text-slate-400
                              ">
                                {quiz.duration || 0} min
                                {" • "}
                                {quiz.totalMarks || 0} marks
                              </p>

                            </div>

                            <ArrowRight
                              size={16}
                              className="
                                shrink-0
                                text-slate-400
                              "
                            />

                          </button>
                        ))}

                    </div>

                    {publishedQuizzes.length > 4 && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate("/student/quizzes")
                        }
                        className="
                          mt-4
                          flex
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-indigo-500
                          px-4
                          py-2.5
                          text-xs
                          font-semibold
                          text-white
                          transition
                          hover:bg-indigo-600
                        "
                      >
                        View all quizzes
                        <ArrowRight size={14} />
                      </button>
                    )}

                  </div>
                )}

              </div>

            </section>
          </>
        )}

      </div>
    </StudentLayout>
  );
};

/* =========================================================
   Dashboard Stat
========================================================= */

const DashboardStat = ({
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

export default StudentDashboard;

