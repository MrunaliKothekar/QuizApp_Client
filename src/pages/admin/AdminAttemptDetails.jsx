import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock3,
  User,
  ClipboardList,
  Award,
  Mail,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import api from "../../api/axios";

const AdminAttemptDetails = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [review, setReview] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAttempt();
  }, [attemptId]);

  const loadAttempt = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/attempts/admin/${attemptId}`
      );

      setAttempt(response.data?.attempt || null);
      setReview(
        Array.isArray(response.data?.review)
          ? response.data.review
          : []
      );
    } catch (err) {
      console.error("Admin attempt details error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load attempt details."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString();
  };

  const getPercentage = () => {
    if (!attempt) return 0;

    return Number(attempt.percentage || 0).toFixed(1);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-indigo-500"
            />

            <p className="mt-3 text-sm text-slate-400">
              Loading attempt details...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => navigate("/admin/attempts")}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-medium
              text-slate-600
              hover:bg-slate-50
              dark:border-white/10
              dark:bg-white/[0.03]
              dark:text-slate-300
              dark:hover:bg-white/5
            "
          >
            <ArrowLeft size={17} />
            Back to Attempts
          </button>

          <div
            className="
              rounded-2xl
              border
              border-red-200
              bg-red-50
              p-6
              text-sm
              text-red-600
              dark:border-red-500/20
              dark:bg-red-500/10
              dark:text-red-400
            "
          >
            {error}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!attempt) {
    return (
      <AdminLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <ClipboardList
              size={40}
              className="mx-auto text-slate-300 dark:text-slate-700"
            />

            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Attempt not found
            </p>

            <button
              type="button"
              onClick={() => navigate("/admin/attempts")}
              className="
                mt-5
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
              <ArrowLeft size={16} />
              Back to Attempts
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const passed = attempt.resultStatus === "PASSED";

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin/attempts")}
              className="
                mb-4
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
              Back to Attempts
            </button>

            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              Attempt Details
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {attempt.quiz?.title || "Quiz Attempt"}
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review the student's complete quiz attempt.
            </p>
          </div>

          <StatusBadge status={attempt.resultStatus} />
        </section>

        {/* Student + Quiz Information */}
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* Student */}
          <InfoCard
            icon={<User size={19} />}
            title="Student Information"
          >
            <div className="space-y-4">

              <InfoRow
                icon={<User size={16} />}
                label="Name"
                value={attempt.user?.name || "—"}
              />

              <InfoRow
                icon={<Mail size={16} />}
                label="Email"
                value={attempt.user?.email || "—"}
              />

            </div>
          </InfoCard>

          {/* Quiz */}
          <InfoCard
            icon={<ClipboardList size={19} />}
            title="Quiz Information"
          >
            <div className="space-y-4">

              <InfoRow
                icon={<ClipboardList size={16} />}
                label="Quiz"
                value={attempt.quiz?.title || "—"}
              />

              <InfoRow
                icon={<Award size={16} />}
                label="Category"
                value={
                  typeof attempt.quiz?.category === "object"
                    ? attempt.quiz?.category?.name || "—"
                    : attempt.quiz?.category || "—"
                }
              />

            </div>
          </InfoCard>

        </section>

        {/* Result Stats */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          <ResultCard
            icon={<Award size={20} />}
            label="Score"
            value={`${attempt.score ?? 0}/${attempt.totalMarks ?? 0}`}
          />

          <ResultCard
            icon={<ClipboardList size={20} />}
            label="Percentage"
            value={`${getPercentage()}%`}
          />

          <ResultCard
            icon={<Clock3 size={20} />}
            label="Duration"
            value={
              attempt.quiz?.duration
                ? `${attempt.quiz.duration} min`
                : "—"
            }
          />

          <ResultCard
            icon={
              passed ? (
                <CheckCircle2 size={20} />
              ) : (
                <XCircle size={20} />
              )
            }
            label="Result"
            value={passed ? "Passed" : "Failed"}
          />

        </section>

        {/* Attempt Timing */}
        <section
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
          <div className="flex items-center gap-2">
            <Clock3
              size={19}
              className="text-indigo-500"
            />

            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Attempt Timing
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

            <InfoRow
              icon={<CalendarDays size={16} />}
              label="Started At"
              value={formatDate(attempt.startedAt)}
            />

            <InfoRow
              icon={<CalendarDays size={16} />}
              label="Submitted At"
              value={formatDate(attempt.submittedAt)}
            />

          </div>
        </section>

        {/* Question Review */}
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
              border-b
              border-slate-200
              px-5
              py-5
              dark:border-white/10
            "
          >
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Question Review
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Review each question and the student's answer.
            </p>
          </div>

          {review.length === 0 ? (
            <div className="p-10 text-center">
              <ClipboardList
                size={35}
                className="mx-auto text-slate-300 dark:text-slate-700"
              />

              <p className="mt-3 text-sm text-slate-400">
                No question review available.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">

              {review.map((item, index) => (
                <QuestionReview
                  key={`${item.questionIndex}-${index}`}
                  item={item}
                  index={index}
                />
              ))}

            </div>
          )}

        </section>

      </div>
    </AdminLayout>
  );
};

/* =========================================================
   Question Review
========================================================= */

const QuestionReview = ({ item, index }) => {
  const isCorrect = item.isCorrect;

  return (
    <div className="p-5 sm:p-6">

      {/* Question Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

        <div className="flex gap-3">

          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-slate-100
              text-xs
              font-bold
              text-slate-600
              dark:bg-white/5
              dark:text-slate-300
            "
          >
            {index + 1}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {item.questionText || "Question unavailable"}
            </p>
          </div>

        </div>

        <div
          className={`
            inline-flex
            w-fit
            items-center
            gap-1.5
            rounded-lg
            px-2.5
            py-1
            text-xs
            font-medium
            ${
              isCorrect
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
            }
          `}
        >
          {isCorrect ? (
            <CheckCircle2 size={14} />
          ) : (
            <XCircle size={14} />
          )}

          {isCorrect ? "Correct" : "Incorrect"}
        </div>

      </div>

      {/* Options */}
      {Array.isArray(item.options) &&
        item.options.length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-2">

            {item.options.map((option, optionIndex) => {

              const isSelected =
                option === item.selectedAnswer;

              const isCorrectAnswer =
                option === item.correctAnswer;

              let optionClass =
                "border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]";

              if (isCorrectAnswer) {
                optionClass =
                  "border-emerald-300 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10";
              } else if (isSelected) {
                optionClass =
                  "border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10";
              }

              return (
                <div
                  key={optionIndex}
                  className={`
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    border
                    px-4
                    py-3
                    ${optionClass}
                  `}
                >

                  <div
                    className={`
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      text-xs
                      font-semibold
                      ${
                        isCorrectAnswer
                          ? "bg-emerald-500 text-white"
                          : isSelected
                          ? "bg-red-500 text-white"
                          : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
                      }
                    `}
                  >
                    {String.fromCharCode(
                      65 + optionIndex
                    )}
                  </div>

                  <span
                    className={`
                      text-sm
                      ${
                        isCorrectAnswer
                          ? "font-medium text-emerald-700 dark:text-emerald-300"
                          : isSelected
                          ? "font-medium text-red-700 dark:text-red-300"
                          : "text-slate-600 dark:text-slate-400"
                      }
                    `}
                  >
                    {option}
                  </span>

                  {isCorrectAnswer && (
                    <span className="ml-auto text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      Correct answer
                    </span>
                  )}

                  {isSelected &&
                    !isCorrectAnswer && (
                      <span className="ml-auto text-xs font-medium text-red-600 dark:text-red-400">
                        Student's answer
                      </span>
                    )}

                </div>
              );
            })}

          </div>
        )}

      {/* Marks */}
      <div className="mt-5 flex flex-wrap items-center gap-3">

        <span
          className="
            rounded-lg
            bg-slate-100
            px-3
            py-1.5
            text-xs
            font-medium
            text-slate-600
            dark:bg-white/5
            dark:text-slate-300
          "
        >
          Marks: {item.marks ?? 0}
        </span>

        {item.negativeMarks > 0 && (
          <span
            className="
              rounded-lg
              bg-red-50
              px-3
              py-1.5
              text-xs
              font-medium
              text-red-600
              dark:bg-red-500/10
              dark:text-red-400
            "
          >
            Negative: -{item.negativeMarks}
          </span>
        )}

        {item.selectedAnswer && (
          <span className="text-xs text-slate-400">
            Selected: {item.selectedAnswer}
          </span>
        )}

      </div>

    </div>
  );
};

/* =========================================================
   Components
========================================================= */

const InfoCard = ({ icon, title, children }) => {
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
      <div className="flex items-center gap-2">
        <span className="text-indigo-500">
          {icon}
        </span>

        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {title}
        </h2>
      </div>

      <div className="mt-5">
        {children}
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => {
  return (
    <div className="flex items-start gap-3">

      <span className="mt-0.5 shrink-0 text-slate-400">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm font-medium text-slate-700 dark:text-slate-300">
          {value}
        </p>
      </div>

    </div>
  );
};

const ResultCard = ({ icon, label, value }) => {
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
      <div className="text-indigo-500">
        {icon}
      </div>

      <p className="mt-3 text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const passed = status === "PASSED";

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-xl
        px-3
        py-2
        text-sm
        font-semibold
        ${
          passed
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
        }
      `}
    >
      {passed ? (
        <CheckCircle2 size={16} />
      ) : (
        <XCircle size={16} />
      )}

      {passed ? "Passed" : "Failed"}
    </span>
  );
};

export default AdminAttemptDetails;