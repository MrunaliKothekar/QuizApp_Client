import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock3,
  ClipboardList,
  Trophy,
  Target,
  Play,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import StudentLayout from "../../components/student/StudentLayout.jsx";
import api from "../../api/axios";

const StudentQuizStart = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * We use the existing quizzes endpoint and
       * find the requested quiz.
       */
      const response = await api.get("/quizzes");

      const quizzes = Array.isArray(response.data?.quizzes)
        ? response.data.quizzes
        : [];

      const foundQuiz = quizzes.find(
        (item) => item._id === quizId
      );

      if (!foundQuiz) {
        setError("Quiz not found.");
        return;
      }

      if (foundQuiz.status !== "PUBLISHED") {
        setError("This quiz is not currently available.");
        return;
      }

      setQuiz(foundQuiz);
    } catch (err) {
      console.error("Load quiz error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load quiz information."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      setStarting(true);
      setError("");

      /*
       * Existing backend:
       *
       * POST /api/attempts/:quizId
       *
       * This either:
       * - creates a new attempt
       * - resumes an existing IN_PROGRESS attempt
       * - rejects if maximum attempts are reached
       */
      const response = await api.post(
        `/attempts/${quizId}`
      );

      const attempt = response.data?.attempt;

      if (!attempt?._id) {
        throw new Error(
          "Attempt information was not returned."
        );
      }

      /*
       * The actual quiz-taking screen will use
       * the attempt ID.
       */
      navigate(
        `/student/quiz/${quizId}/attempt/${attempt._id}`
      );
    } catch (err) {
      console.error("Start attempt error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start the quiz."
      );
    } finally {
      setStarting(false);
    }
  };

  const getCategoryName = () => {
    if (!quiz) return "Uncategorized";

    if (typeof quiz.category === "object") {
      return quiz.category?.name || "Uncategorized";
    }

    return "Uncategorized";
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="
          flex
          min-h-[60vh]
          items-center
          justify-center
        ">
          <div className="text-center">
            <RefreshCw
              size={26}
              className="mx-auto animate-spin text-indigo-500"
            />

            <p className="
              mt-3
              text-sm
              text-slate-400
            ">
              Loading quiz...
            </p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error && !quiz) {
    return (
      <StudentLayout>
        <div className="
          mx-auto
          flex
          min-h-[60vh]
          max-w-xl
          items-center
          justify-center
        ">
          <div className="
            w-full
            rounded-2xl
            border
            border-red-200
            bg-white
            p-8
            text-center
            shadow-sm
            dark:border-red-500/20
            dark:bg-white/[0.03]
          ">
            <div className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-red-50
              text-red-500
              dark:bg-red-500/10
              dark:text-red-400
            ">
              <AlertCircle size={23} />
            </div>

            <h2 className="
              mt-4
              text-lg
              font-semibold
              text-slate-900
              dark:text-white
            ">
              Unable to load quiz
            </h2>

            <p className="
              mt-2
              text-sm
              text-slate-500
              dark:text-slate-400
            ">
              {error}
            </p>

            <div className="
              mt-6
              flex
              justify-center
              gap-3
            ">
              <button
                type="button"
                onClick={() =>
                  navigate("/student/quizzes")
                }
                className="
                  rounded-xl
                  border
                  border-slate-200
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-slate-600
                  hover:bg-slate-50
                  dark:border-white/10
                  dark:text-slate-300
                  dark:hover:bg-white/5
                "
              >
                Back to Quizzes
              </button>

              <button
                type="button"
                onClick={loadQuiz}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-indigo-500
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  hover:bg-indigo-600
                "
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="
        mx-auto
        max-w-5xl
        space-y-6
      ">

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            navigate("/student/quizzes")
          }
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-medium
            text-slate-500
            transition
            hover:text-indigo-600
            dark:text-slate-400
            dark:hover:text-indigo-400
          "
        >
          <ArrowLeft size={17} />
          Back to Available Quizzes
        </button>

        {/* Main Quiz Card */}
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

          {/* Thumbnail */}
          <div className="
            relative
            h-56
            bg-slate-100
            dark:bg-white/[0.04]
            sm:h-72
          ">
            {quiz.thumbnail ? (
              <img
                src={quiz.thumbnail}
                alt={quiz.title}
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            ) : (
              <div className="
                flex
                h-full
                w-full
                items-center
                justify-center
              ">
                <ClipboardList
                  size={55}
                  className="text-slate-300 dark:text-slate-700"
                />
              </div>
            )}

            <div className="
              absolute
              inset-x-0
              bottom-0
              bg-gradient-to-t
              from-slate-950/80
              to-transparent
              px-6
              pb-6
              pt-16
            ">
              <p className="
                text-sm
                font-medium
                text-indigo-300
              ">
                {getCategoryName()}
              </p>

              <h1 className="
                mt-1
                text-2xl
                font-bold
                text-white
                sm:text-3xl
              ">
                {quiz.title}
              </h1>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">

            <div className="
              grid
              grid-cols-2
              gap-3
              sm:grid-cols-4
            ">
              <DetailCard
                icon={Clock3}
                label="Duration"
                value={`${quiz.duration || 0} minutes`}
              />

              <DetailCard
                icon={Trophy}
                label="Total Marks"
                value={quiz.totalMarks || 0}
              />

              <DetailCard
                icon={Target}
                label="Passing"
                value={`${quiz.passingPercentage ?? 0}%`}
              />

              <DetailCard
                icon={ClipboardList}
                label="Attempts"
                value={quiz.maxAttempts || 1}
              />
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="
                text-base
                font-semibold
                text-slate-900
                dark:text-white
              ">
                About this quiz
              </h2>

              <p className="
                mt-2
                text-sm
                leading-6
                text-slate-500
                dark:text-slate-400
              ">
                {quiz.description ||
                  "Test your knowledge by completing this quiz."}
              </p>
            </div>

            {/* Instructions */}
            <div className="
              mt-8
              rounded-2xl
              border
              border-indigo-100
              bg-indigo-50/70
              p-5
              dark:border-indigo-500/20
              dark:bg-indigo-500/5
            ">
              <h2 className="
                text-base
                font-semibold
                text-slate-900
                dark:text-white
              ">
                Before you start
              </h2>

              <ul className="
                mt-3
                space-y-2
                text-sm
                leading-6
                text-slate-600
                dark:text-slate-300
              ">
                <li>
                  • Make sure you have enough time to
                  complete the quiz.
                </li>

                <li>
                  • The timer starts when you begin
                  the attempt.
                </li>

                <li>
                  • Your attempt will be submitted when
                  you finish the quiz.
                </li>

                <li>
                  • You can have up to{" "}
                  <strong>
                    {quiz.maxAttempts || 1}
                  </strong>{" "}
                  attempt
                  {quiz.maxAttempts === 1
                    ? ""
                    : "s"}.
                </li>
              </ul>
            </div>

            {/* Error */}
            {error && (
              <div className="
                mt-5
                flex
                items-center
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
                <AlertCircle size={17} />
                {error}
              </div>
            )}

            {/* Start */}
            <div className="
              mt-8
              flex
              flex-col-reverse
              gap-3
              sm:flex-row
              sm:justify-end
            ">
              <button
                type="button"
                onClick={() =>
                  navigate("/student/quizzes")
                }
                disabled={starting}
                className="
                  rounded-xl
                  border
                  border-slate-200
                  px-5
                  py-3
                  text-sm
                  font-medium
                  text-slate-600
                  transition
                  hover:bg-slate-50
                  disabled:opacity-50
                  dark:border-white/10
                  dark:text-slate-300
                  dark:hover:bg-white/5
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStart}
                disabled={starting}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-indigo-500
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  shadow-indigo-500/20
                  transition
                  hover:bg-indigo-600
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {starting ? (
                  <>
                    <RefreshCw
                      size={17}
                      className="animate-spin"
                    />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play size={17} />
                    Start Quiz
                  </>
                )}
              </button>
            </div>

          </div>
        </section>
      </div>
    </StudentLayout>
  );
};

/* =========================================================
   Detail Card
========================================================= */

const DetailCard = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="
      rounded-xl
      bg-slate-50
      p-4
      dark:bg-white/[0.04]
    ">
      <Icon
        size={18}
        className="text-indigo-500 dark:text-indigo-400"
      />

      <p className="
        mt-3
        text-[11px]
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
        font-semibold
        text-slate-800
        dark:text-slate-200
      ">
        {value}
      </p>
    </div>
  );
};

export default StudentQuizStart;

