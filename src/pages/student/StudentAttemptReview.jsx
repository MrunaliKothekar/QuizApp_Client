import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  ClipboardCheck,
} from "lucide-react";

const StudentAttemptReview = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReview = async () => {
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

        setData(response.data);
      } catch (err) {
        console.error("Attempt review error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load attempt review."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2
          size={32}
          className="animate-spin text-indigo-500"
        />
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

          <h2 className="font-semibold text-slate-900 dark:text-white">
            Unable to load review
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {error}
          </p>

          <button
            onClick={() =>
              navigate(`/student/result/${attemptId}`)
            }
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Back to Result
          </button>
        </div>
      </div>
    );
  }

  const attempt = data?.attempt;
  const review = data?.review || [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() =>
            navigate(`/student/result/${attemptId}`)
          }
          className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        >
          <ArrowLeft size={17} />
          Back to Result
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <ClipboardCheck size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Review Answers
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {attempt?.quiz?.title || "Quiz"}
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
          <p className="text-xs text-slate-400">Score</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            {attempt?.score} / {attempt?.totalMarks}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
          <p className="text-xs text-slate-400">Percentage</p>
          <p className="mt-1 text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {Number(attempt?.percentage || 0).toFixed(1)}%
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
          <p className="text-xs text-slate-400">Questions</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            {review.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
          <p className="text-xs text-slate-400">Result</p>
          <p
            className={`mt-1 text-xl font-bold ${
              attempt?.resultStatus === "PASSED"
                ? "text-emerald-500"
                : "text-red-500"
            }`}
          >
            {attempt?.resultStatus}
          </p>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {review.map((item, index) => {
          const isCorrect = item.isCorrect;

          return (
            <div
              key={`${item.questionIndex}-${index}`}
              className={`overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 ${
                isCorrect
                  ? "border-emerald-200 dark:border-emerald-500/20"
                  : "border-red-200 dark:border-red-500/20"
              }`}
            >
              {/* Question header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600 dark:bg-white/5 dark:text-slate-300">
                    {index + 1}
                  </span>

                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Question {index + 1}
                  </span>
                </div>

                {isCorrect ? (
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-500">
                    <CheckCircle2 size={18} />
                    Correct
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-red-500">
                    <XCircle size={18} />
                    Incorrect
                  </div>
                )}
              </div>

              {/* Question */}
              <div className="p-5">
                <h3 className="text-base font-semibold leading-7 text-slate-900 dark:text-white">
                  {item.questionText}
                </h3>

                {/* Options */}
                <div className="mt-5 space-y-3">
                  {item.options?.map((option, optionIndex) => {
                    const selected =
                      option === item.selectedAnswer;

                    const correct =
                      option === item.correctAnswer;

                    let optionStyle =
                      "border-slate-200 dark:border-white/10";

                    if (correct) {
                      optionStyle =
                        "border-emerald-400 bg-emerald-50 dark:border-emerald-500/50 dark:bg-emerald-500/10";
                    } else if (selected && !correct) {
                      optionStyle =
                        "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-500/10";
                    }

                    return (
                      <div
                        key={optionIndex}
                        className={`flex items-center gap-3 rounded-xl border p-4 ${optionStyle}`}
                      >
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            correct
                              ? "bg-emerald-500 text-white"
                              : selected
                              ? "bg-red-500 text-white"
                              : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                          }`}
                        >
                          {String.fromCharCode(
                            65 + optionIndex
                          )}
                        </div>

                        <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">
                          {option}
                        </span>

                        {correct && (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            Correct Answer
                          </span>
                        )}

                        {selected && !correct && (
                          <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                            Your Answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Marks */}
                <div className="mt-5 flex flex-wrap gap-3">
                  <span
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      isCorrect
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                    }`}
                  >
                    {isCorrect
                      ? `+${item.marks} marks`
                      : `-${item.negativeMarks || 0} marks`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="flex justify-end pb-6">
        <button
          onClick={() =>
            navigate("/student/attempts")
          }
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Back to My Attempts
        </button>
      </div>
    </div>
  );
};

export default StudentAttemptReview;