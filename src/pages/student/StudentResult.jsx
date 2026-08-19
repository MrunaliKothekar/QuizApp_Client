import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  ClipboardList,
  ArrowLeft,
  Eye,
  Loader2,
} from "lucide-react";
import axios from "axios";

const StudentResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:5000/api/attempts/${attemptId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setResult(response.data);
      } catch (err) {
        console.error("Fetch result error:", err);
        setError(
          err.response?.data?.message || "Failed to load result."
        );
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchResult();
    }
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-500/20 dark:bg-red-500/10">
          <XCircle
            size={42}
            className="mx-auto mb-4 text-red-500"
          />

          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Unable to load result
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {error}
          </p>

          <button
            onClick={() => navigate("/student/attempts")}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Go to My Attempts
          </button>
        </div>
      </div>
    );
  }

  if (!result?.attempt) {
    return null;
  }

  const attempt = result.attempt;

  const passed = attempt.resultStatus === "PASSED";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/student/attempts")}
          className="mb-4 flex items-center gap-2 text-sm text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        >
          <ArrowLeft size={17} />
          Back to My Attempts
        </button>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Quiz Result
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Here is your performance summary for this attempt.
        </p>
      </div>

      {/* Result Card */}
      <div
        className={`overflow-hidden rounded-3xl border ${
          passed
            ? "border-emerald-200 dark:border-emerald-500/20"
            : "border-red-200 dark:border-red-500/20"
        } bg-white shadow-sm dark:bg-slate-900`}
      >
        <div
          className={`px-6 py-8 text-center sm:px-10 ${
            passed
              ? "bg-emerald-50 dark:bg-emerald-500/10"
              : "bg-red-50 dark:bg-red-500/10"
          }`}
        >
          {passed ? (
            <CheckCircle2
              size={64}
              className="mx-auto text-emerald-500"
            />
          ) : (
            <XCircle
              size={64}
              className="mx-auto text-red-500"
            />
          )}

          <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
            {passed ? "Congratulations!" : "Keep Practicing!"}
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {passed
              ? "You have successfully passed this quiz."
              : "You did not reach the passing percentage this time."}
          </p>

          <div
            className={`mx-auto mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold ${
              passed
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
            }`}
          >
            {passed ? "PASSED" : "FAILED"}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 divide-y border-t border-slate-200 dark:divide-white/10 dark:border-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="p-6 text-center">
            <p className="text-sm text-slate-400">
              Score
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              {attempt.score}
              <span className="text-lg font-medium text-slate-400">
                {" "}
                / {attempt.totalMarks}
              </span>
            </p>
          </div>

          <div className="p-6 text-center">
            <p className="text-sm text-slate-400">
              Percentage
            </p>

            <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {Number(attempt.percentage).toFixed(1)}%
            </p>
          </div>

          <div className="p-6 text-center">
            <p className="text-sm text-slate-400">
              Status
            </p>

            <p
              className={`mt-2 text-xl font-bold ${
                passed
                  ? "text-emerald-500"
                  : "text-red-500"
              }`}
            >
              {attempt.resultStatus}
            </p>
          </div>
        </div>
      </div>

      {/* Quiz Information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <ClipboardList size={20} />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {attempt.quiz?.title || "Quiz"}
            </h3>

            <p className="text-sm text-slate-400">
              Quiz attempt details
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.03]">
            <p className="text-xs text-slate-400">
              Duration
            </p>

            <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
              {attempt.quiz?.duration || 0} minutes
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.03]">
            <p className="text-xs text-slate-400">
              Started
            </p>

            <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
              {new Date(attempt.startedAt).toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.03]">
            <p className="text-xs text-slate-400">
              Submitted
            </p>

            <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
              {attempt.submittedAt
                ? new Date(
                    attempt.submittedAt
                  ).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          onClick={() =>
            navigate(`/student/attempts/${attemptId}`)
          }
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-white/5"
        >
          <Eye size={18} />
          Review Answers
        </button>

        <button
          onClick={() => navigate("/student/quizzes")}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Trophy size={18} />
          Browse More Quizzes
        </button>
      </div>
    </div>
  );
};

export default StudentResult;