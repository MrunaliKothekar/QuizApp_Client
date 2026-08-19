import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flag,
  Loader2,
  Send,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import StudentLayout from "../../components/student/StudentLayout.jsx";
import api from "../../api/axios";

const StudentQuizAttempt = () => {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [answers, setAnswers] = useState({});

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [timeLeft, setTimeLeft] = useState(null);

  const [showSubmitModal, setShowSubmitModal] =
    useState(false);

  const submittedRef = useRef(false);

  /*
   * Load quiz + questions + attempt information.
   */
  useEffect(() => {
    loadQuizAttempt();
  }, [quizId, attemptId]);

  const loadQuizAttempt = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * Load quiz information.
       */
      const quizResponse = await api.get("/quizzes");

      const quizzes = Array.isArray(
        quizResponse.data?.quizzes
      )
        ? quizResponse.data.quizzes
        : [];

      const foundQuiz = quizzes.find(
        (item) => item._id === quizId
      );

      if (!foundQuiz) {
        setError("Quiz not found.");
        return;
      }

      setQuiz(foundQuiz);

      /*
       * Get the existing attempt.
       *
       * Your backend getAttemptById endpoint also
       * returns the attempt and review information.
       */
      const attemptResponse = await api.get(
        `/attempts/${attemptId}`
      );

      const attemptData =
        attemptResponse.data?.attempt;

      if (!attemptData) {
        setError("Attempt not found.");
        return;
      }

      /*
       * If the attempt was already completed,
       * don't allow the student to continue it.
       */
      if (attemptData.status === "COMPLETED") {
        navigate(
          `/student/attempts/${attemptId}`,
          { replace: true }
        );

        return;
      }

      /*
       * The review returned by the backend contains
       * question information.
       *
       * We use it to reconstruct the question list.
       */
      const review =
        Array.isArray(attemptResponse.data?.review)
          ? attemptResponse.data.review
          : [];

      const questionList = review.map(
        (item) => ({
          questionIndex: item.questionIndex,
          questionText: item.questionText,
          options: item.options || [],
          marks: item.marks || 0,
          negativeMarks:
            item.negativeMarks || 0,
        })
      );

      /*
       * If there are no questions in the attempt
       * response, try the quiz questions endpoint.
       *
       * This fallback depends on your backend route.
       */
      if (questionList.length > 0) {
        setQuestions(questionList);
      } else {
        try {
          const questionResponse =
            await api.get(
              `/quizzes/${quizId}/questions`
            );

          const backendQuestions =
            questionResponse.data?.questions ||
            questionResponse.data?.questionSet?.questions ||
            [];

          if (Array.isArray(backendQuestions)) {
            setQuestions(
              backendQuestions.map(
                (question, index) => ({
                  questionIndex: index,
                  questionText:
                    question.questionText,
                  options:
                    question.options || [],
                  marks: question.marks || 0,
                  negativeMarks:
                    question.negativeMarks || 0,
                })
              )
            );
          }
        } catch (questionError) {
          console.error(
            "Question loading error:",
            questionError
          );
        }
      }

      /*
       * Restore already selected answers if the
       * student is resuming an attempt.
       *
       * The backend stores answers as:
       *
       * {
       *   questionIndex,
       *   selectedAnswer
       * }
       */
      const existingAnswers =
        Array.isArray(attemptData.answers)
          ? attemptData.answers
          : [];

      const restoredAnswers = {};

      existingAnswers.forEach((answer) => {
        restoredAnswers[
          answer.questionIndex
        ] = answer.selectedAnswer;
      });

      setAnswers(restoredAnswers);

      /*
       * Calculate remaining time.
       *
       * startedAt + quiz.duration.
       */
      if (foundQuiz.duration) {
        const startedAt = new Date(
          attemptData.startedAt
        ).getTime();

        const deadline =
          startedAt +
          Number(foundQuiz.duration) *
            60 *
            1000;

        const remaining = Math.max(
          0,
          Math.floor(
            (deadline - Date.now()) / 1000
          )
        );

        setTimeLeft(remaining);
      }
    } catch (err) {
      console.error(
        "Load quiz attempt error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load the quiz."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Countdown timer.
   */
  useEffect(() => {
    if (
      loading ||
      timeLeft === null ||
      submitting ||
      submittedRef.current
    ) {
      return;
    }

    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (
          previous === null ||
          previous <= 1
        ) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    loading,
    timeLeft,
    submitting,
  ]);

  /*
   * Prevent browser refresh / accidental close
   * while the quiz is being attempted.
   */
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (
        !submitting &&
        !submittedRef.current
      ) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [submitting]);

  /*
   * Format seconds as MM:SS.
   */
  const formatTime = (seconds) => {
    if (seconds === null) {
      return "--:--";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    const remainingSeconds =
      seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  };

  /*
   * Select an answer.
   */
  const handleAnswer = (answer) => {
    if (
      submitting ||
      submittedRef.current
    ) {
      return;
    }

    const question =
      questions[currentQuestion];

    if (!question) return;

    setAnswers((previous) => ({
      ...previous,
      [question.questionIndex]:
        answer,
    }));
  };

  /*
   * Convert answers object into the exact
   * structure expected by your backend.
   */
  const buildAnswersPayload = () => {
    return Object.entries(answers).map(
      ([questionIndex, selectedAnswer]) => ({
        questionIndex: Number(questionIndex),
        selectedAnswer,
      })
    );
  };

  /*
   * Submit attempt.
   */
  const submitQuiz = async () => {
    if (
      submitting ||
      submittedRef.current
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const answerPayload =
        buildAnswersPayload();

      const response = await api.post(
        `/attempts/${attemptId}/submit`,
        {
          answers: answerPayload,
        }
      );

      submittedRef.current = true;

      /*
       * Go to result page.
       */
      navigate(
        `/student/result/${attemptId}`,
        {
          replace: true,
          state: {
            result: response.data?.result,
          },
        }
      );
    } catch (err) {
      console.error(
        "Submit quiz error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to submit quiz."
      );

      setSubmitting(false);
    }
  };

  /*
   * Automatic submission when timer reaches 0.
   */
  const handleAutoSubmit = async () => {
    if (
      submittedRef.current ||
      submitting
    ) {
      return;
    }

    await submitQuiz();
  };

  /*
   * Manual submit confirmation.
   */
  const handleSubmitClick = () => {
    setShowSubmitModal(true);
  };

  const confirmSubmit = async () => {
    setShowSubmitModal(false);
    await submitQuiz();
  };

  /*
   * Current question.
   */
  const question =
    questions[currentQuestion];

  /*
   * Answered count.
   */
  const answeredCount = useMemo(() => {
    return questions.filter(
      (item) =>
        answers[item.questionIndex] !==
        undefined
    ).length;
  }, [questions, answers]);

  const unansweredCount =
    questions.length - answeredCount;

  /*
   * Timer styling.
   */
  const timerIsDanger =
    timeLeft !== null &&
    timeLeft <= 60;

  const timerIsWarning =
    timeLeft !== null &&
    timeLeft <= 300 &&
    timeLeft > 60;

  /*
   * Loading.
   */
  if (loading) {
    return (
      <StudentLayout>
        <div className="
          flex
          min-h-[70vh]
          items-center
          justify-center
        ">
          <div className="text-center">
            <Loader2
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
              Loading quiz...
            </p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  /*
   * Error screen.
   */
  if (error && !question) {
    return (
      <StudentLayout>
        <div className="
          flex
          min-h-[70vh]
          items-center
          justify-center
        ">
          <div className="
            max-w-md
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
              <AlertCircle size={24} />
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
              leading-6
              text-slate-500
              dark:text-slate-400
            ">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/student/quizzes"
                )
              }
              className="
                mt-6
                rounded-xl
                bg-indigo-500
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                hover:bg-indigo-600
              "
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!question) {
    return (
      <StudentLayout>
        <div className="
          flex
          min-h-[70vh]
          items-center
          justify-center
        ">
          <div className="text-center">
            <AlertCircle
              size={30}
              className="mx-auto text-amber-500"
            />

            <p className="
              mt-3
              text-sm
              text-slate-500
              dark:text-slate-400
            ">
              No questions are available for
              this quiz.
            </p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="
        mx-auto
        max-w-7xl
        space-y-5
      ">

        {/* Top Bar */}
        <section className="
          flex
          flex-col
          gap-4
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
          shadow-sm
          dark:border-white/10
          dark:bg-white/[0.03]
          sm:flex-row
          sm:items-center
          sm:justify-between
        ">

          <div className="min-w-0">
            <p className="
              text-xs
              font-medium
              text-indigo-600
              dark:text-indigo-400
            ">
              Quiz in progress
            </p>

            <h1 className="
              mt-0.5
              truncate
              text-lg
              font-semibold
              text-slate-900
              dark:text-white
            ">
              {quiz?.title || "Quiz"}
            </h1>
          </div>

          {/* Timer */}
          <div
            className={`
              flex
              items-center
              gap-3
              rounded-xl
              border
              px-4
              py-2.5
              ${
                timerIsDanger
                  ? `
                    border-red-200
                    bg-red-50
                    text-red-600
                    dark:border-red-500/20
                    dark:bg-red-500/10
                    dark:text-red-400
                  `
                  : timerIsWarning
                  ? `
                    border-amber-200
                    bg-amber-50
                    text-amber-600
                    dark:border-amber-500/20
                    dark:bg-amber-500/10
                    dark:text-amber-400
                  `
                  : `
                    border-slate-200
                    bg-slate-50
                    text-slate-700
                    dark:border-white/10
                    dark:bg-white/[0.04]
                    dark:text-slate-200
                  `
              }
            `}
          >
            <Clock3 size={18} />

            <div>
              <p className="
                text-[10px]
                font-medium
                uppercase
                tracking-wide
                opacity-70
              ">
                Time Remaining
              </p>

              <p className="
                text-base
                font-bold
                tabular-nums
              ">
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="
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

        <div className="
          grid
          grid-cols-1
          gap-5
          lg:grid-cols-[1fr_280px]
        ">

          {/* Question */}
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

            {/* Question Header */}
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
                <p className="
                  text-xs
                  font-medium
                  text-slate-400
                ">
                  Question
                </p>

                <p className="
                  mt-0.5
                  text-sm
                  font-semibold
                  text-slate-800
                  dark:text-slate-200
                ">
                  {currentQuestion + 1} of{" "}
                  {questions.length}
                </p>
              </div>

              <div className="
                flex
                items-center
                gap-2
                text-xs
                text-slate-400
              ">
                <span>
                  {question.marks} mark
                  {question.marks === 1
                    ? ""
                    : "s"}
                </span>

                {question.negativeMarks >
                  0 && (
                  <>
                    <span>•</span>

                    <span className="text-red-400">
                      -{question.negativeMarks}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Question Body */}
            <div className="p-5 sm:p-7">

              <h2 className="
                text-lg
                font-semibold
                leading-7
                text-slate-900
                dark:text-white
                sm:text-xl
              ">
                {question.questionText}
              </h2>

              {/* Options */}
              <div className="
                mt-7
                space-y-3
              ">
                {question.options.map(
                  (option, index) => {
                    const isSelected =
                      answers[
                        question.questionIndex
                      ] === option;

                    const optionLetter =
                      String.fromCharCode(
                        65 + index
                      );

                    return (
                      <button
                        key={`${option}-${index}`}
                        type="button"
                        disabled={submitting}
                        onClick={() =>
                          handleAnswer(
                            option
                          )
                        }
                        className={`
                          flex
                          w-full
                          items-center
                          gap-4
                          rounded-xl
                          border
                          p-4
                          text-left
                          transition
                          ${
                            isSelected
                              ? `
                                border-indigo-500
                                bg-indigo-50
                                dark:border-indigo-500
                                dark:bg-indigo-500/10
                              `
                              : `
                                border-slate-200
                                hover:border-indigo-200
                                hover:bg-indigo-50/50
                                dark:border-white/10
                                dark:hover:border-indigo-500/30
                                dark:hover:bg-indigo-500/5
                              `
                          }
                        `}
                      >
                        <span
                          className={`
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            text-sm
                            font-semibold
                            ${
                              isSelected
                                ? `
                                  bg-indigo-500
                                  text-white
                                `
                                : `
                                  bg-slate-100
                                  text-slate-500
                                  dark:bg-white/10
                                  dark:text-slate-400
                                `
                            }
                          `}
                        >
                          {isSelected ? (
                            <Check
                              size={17}
                            />
                          ) : (
                            optionLetter
                          )}
                        </span>

                        <span className={`
                          text-sm
                          leading-6
                          ${
                            isSelected
                              ? `
                                font-medium
                                text-indigo-700
                                dark:text-indigo-300
                              `
                              : `
                                text-slate-700
                                dark:text-slate-300
                              `
                          }
                        `}>
                          {option}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>

            </div>

            {/* Navigation */}
            <div className="
              flex
              items-center
              justify-between
              border-t
              border-slate-200
              px-5
              py-4
              dark:border-white/10
            ">

              <button
                type="button"
                disabled={
                  currentQuestion === 0 ||
                  submitting
                }
                onClick={() =>
                  setCurrentQuestion(
                    (previous) =>
                      previous - 1
                  )
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-slate-600
                  transition
                  hover:bg-slate-50
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  dark:border-white/10
                  dark:text-slate-300
                  dark:hover:bg-white/5
                "
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              {currentQuestion ===
              questions.length - 1 ? (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={
                    handleSubmitClick
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-indigo-500
                    px-5
                    py-2.5
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
                  <Send size={16} />
                  Submit Quiz
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    setCurrentQuestion(
                      (previous) =>
                        previous + 1
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-indigo-500
                    px-5
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
                  Next
                  <ChevronRight
                    size={17}
                  />
                </button>
              )}

            </div>
          </section>

          {/* Question Navigator */}
          <aside className="
            h-fit
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
              <h2 className="
                text-sm
                font-semibold
                text-slate-900
                dark:text-white
              ">
                Questions
              </h2>

              <span className="
                text-xs
                text-slate-400
              ">
                {answeredCount}/
                {questions.length}
              </span>
            </div>

            {/* Progress */}
            <div className="
              mt-4
              h-2
              overflow-hidden
              rounded-full
              bg-slate-100
              dark:bg-white/10
            ">
              <div
                className="
                  h-full
                  rounded-full
                  bg-indigo-500
                  transition-all
                "
                style={{
                  width: `${
                    questions.length
                      ? (answeredCount /
                          questions.length) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>

            {/* Legend */}
            <div className="
              mt-5
              flex
              flex-wrap
              gap-3
              text-[11px]
              text-slate-400
            ">
              <div className="flex items-center gap-1.5">
                <span className="
                  h-2.5
                  w-2.5
                  rounded
                  bg-indigo-500
                " />
                Answered
              </div>

              <div className="flex items-center gap-1.5">
                <span className="
                  h-2.5
                  w-2.5
                  rounded
                  border
                  border-slate-300
                  dark:border-white/20
                " />
                Unanswered
              </div>
            </div>

            {/* Question Grid */}
            <div className="
              mt-5
              grid
              grid-cols-5
              gap-2
            ">
              {questions.map(
                (item, index) => {
                  const answered =
                    answers[
                      item.questionIndex
                    ] !== undefined;

                  const active =
                    index ===
                    currentQuestion;

                  return (
                    <button
                      key={
                        item.questionIndex
                      }
                      type="button"
                      onClick={() =>
                        setCurrentQuestion(
                          index
                        )
                      }
                      className={`
                        relative
                        flex
                        h-10
                        items-center
                        justify-center
                        rounded-lg
                        text-xs
                        font-semibold
                        transition
                        ${
                          active
                            ? `
                              bg-indigo-500
                              text-white
                              ring-2
                              ring-indigo-500/20
                            `
                            : answered
                            ? `
                              bg-indigo-50
                              text-indigo-600
                              dark:bg-indigo-500/10
                              dark:text-indigo-400
                            `
                            : `
                              border
                              border-slate-200
                              bg-white
                              text-slate-500
                              hover:border-indigo-200
                              hover:text-indigo-600
                              dark:border-white/10
                              dark:bg-white/[0.02]
                              dark:text-slate-400
                            `
                        }
                      `}
                    >
                      {index + 1}

                      {answered &&
                        !active && (
                          <span className="
                            absolute
                            right-1
                            top-1
                            h-1.5
                            w-1.5
                            rounded-full
                            bg-indigo-500
                          " />
                        )}
                    </button>
                  );
                }
              )}
            </div>

            {/* Summary */}
            <div className="
              mt-6
              space-y-2
              border-t
              border-slate-200
              pt-5
              dark:border-white/10
            ">
              <div className="
                flex
                items-center
                justify-between
                text-xs
              ">
                <span className="text-slate-400">
                  Answered
                </span>

                <span className="
                  font-semibold
                  text-slate-700
                  dark:text-slate-200
                ">
                  {answeredCount}
                </span>
              </div>

              <div className="
                flex
                items-center
                justify-between
                text-xs
              ">
                <span className="text-slate-400">
                  Unanswered
                </span>

                <span className="
                  font-semibold
                  text-slate-700
                  dark:text-slate-200
                ">
                  {unansweredCount}
                </span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmitClick}
              disabled={submitting}
              className="
                mt-5
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-indigo-200
                bg-indigo-50
                px-4
                py-2.5
                text-sm
                font-semibold
                text-indigo-600
                transition
                hover:bg-indigo-100
                disabled:opacity-50
                dark:border-indigo-500/20
                dark:bg-indigo-500/10
                dark:text-indigo-400
                dark:hover:bg-indigo-500/15
              "
            >
              <Flag size={16} />
              Finish Quiz
            </button>

          </aside>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-slate-950/50
          p-4
          backdrop-blur-sm
        ">
          <div className="
            w-full
            max-w-md
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-2xl
            dark:border-white/10
            dark:bg-slate-900
          ">

            <div className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-indigo-50
              text-indigo-500
              dark:bg-indigo-500/10
              dark:text-indigo-400
            ">
              <Send size={20} />
            </div>

            <h2 className="
              mt-4
              text-lg
              font-semibold
              text-slate-900
              dark:text-white
            ">
              Submit your quiz?
            </h2>

            <p className="
              mt-2
              text-sm
              leading-6
              text-slate-500
              dark:text-slate-400
            ">
              You have answered{" "}
              <strong>
                {answeredCount}
              </strong>{" "}
              out of{" "}
              <strong>
                {questions.length}
              </strong>{" "}
              questions.
            </p>

            {unansweredCount > 0 && (
              <div className="
                mt-4
                rounded-xl
                bg-amber-50
                px-4
                py-3
                text-sm
                text-amber-700
                dark:bg-amber-500/10
                dark:text-amber-400
              ">
                {unansweredCount} question
                {unansweredCount === 1
                  ? ""
                  : "s"}{" "}
                {unansweredCount === 1
                  ? "is"
                  : "are"}{" "}
                unanswered. Unanswered questions
                will not receive marks.
              </div>
            )}

            <div className="
              mt-6
              flex
              flex-col-reverse
              gap-3
              sm:flex-row
              sm:justify-end
            ">
              <button
                type="button"
                onClick={() =>
                  setShowSubmitModal(false)
                }
                disabled={submitting}
                className="
                  rounded-xl
                  border
                  border-slate-200
                  px-5
                  py-2.5
                  text-sm
                  font-medium
                  text-slate-600
                  hover:bg-slate-50
                  disabled:opacity-50
                  dark:border-white/10
                  dark:text-slate-300
                  dark:hover:bg-white/5
                "
              >
                Continue Quiz
              </button>

              <button
                type="button"
                onClick={confirmSubmit}
                disabled={submitting}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-indigo-500
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  hover:bg-indigo-600
                  disabled:opacity-60
                "
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Quiz
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </StudentLayout>
  );
};

export default StudentQuizAttempt;
