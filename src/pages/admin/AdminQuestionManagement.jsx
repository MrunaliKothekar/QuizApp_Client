import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout.jsx";

const API_URL = "http://localhost:5000/api";

const AdminQuestionManagement = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const [form, setForm] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 1,
    negativeMarks: 0,
  });

  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  /* =====================================================
     FETCH QUIZ + QUESTIONS
  ===================================================== */

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setError("");

      const [quizResponse, questionResponse] =
        await Promise.all([
          axios.get(
            `${API_URL}/quizzes/${quizId}`,
            authConfig
          ),

          axios.get(
            `${API_URL}/quizzes/${quizId}/questions`,
            authConfig
          ),
        ]);

      setQuiz(quizResponse.data.quiz);

      setQuestions(
        questionResponse.data.questionSet?.questions || []
      );
    } catch (error) {
      console.error("Failed to fetch quiz questions:", error);

      setError(
        error.response?.data?.message ||
          "Failed to fetch questions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);

  /* =====================================================
     FORM HANDLING
  ===================================================== */

  const resetForm = () => {
    setForm({
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      marks: 1,
      negativeMarks: 0,
    });

    setEditingIndex(null);
  };

  const openAddForm = () => {
    resetForm();
    setSuccess("");
    setError("");
    setShowForm(true);
  };

  const openEditForm = (question, index) => {
    setForm({
      questionText: question.questionText || "",

      options:
        question.options?.length > 0
          ? [...question.options]
          : ["", "", "", ""],

      correctAnswer: question.correctAnswer || "",

      marks: question.marks ?? 1,

      negativeMarks:
        question.negativeMarks ?? 0,
    });

    setEditingIndex(index);
    setSuccess("");
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    resetForm();
  };

  const handleQuestionChange = (e) => {
    setForm((prev) => ({
      ...prev,
      questionText: e.target.value,
    }));
  };

  const handleOptionChange = (index, value) => {
    setForm((prev) => {
      const updatedOptions = [...prev.options];

      const oldValue = updatedOptions[index];

      updatedOptions[index] = value;

      return {
        ...prev,
        options: updatedOptions,

        // If the correct answer was the old option value,
        // keep it synchronized with the edited option.
        correctAnswer:
          prev.correctAnswer === oldValue
            ? value
            : prev.correctAnswer,
      };
    });
  };

  const handleCorrectAnswerChange = (e) => {
    setForm((prev) => ({
      ...prev,
      correctAnswer: e.target.value,
    }));
  };

  /* =====================================================
     ADD QUESTION
  ===================================================== */

  const addQuestion = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      validateForm();

      const response = await axios.post(
        `${API_URL}/quizzes/${quizId}/questions`,
        {
          questions: [
            {
              questionText: form.questionText.trim(),

              options: form.options.map(
                (option) => option.trim()
              ),

              correctAnswer: form.correctAnswer,

              marks: Number(form.marks),

              negativeMarks:
                Number(form.negativeMarks),
            },
          ],
        },
        authConfig
      );

      setQuestions(
        response.data.questionSet?.questions || []
      );

      setSuccess("Question added successfully.");

      closeForm();
    } catch (error) {
      console.error("Add question error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to add question"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     UPDATE QUESTION
  ===================================================== */

  const updateQuestion = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      validateForm();

      const response = await axios.put(
        `${API_URL}/quizzes/${quizId}/questions/${editingIndex}`,
        {
          questionText: form.questionText.trim(),

          options: form.options.map(
            (option) => option.trim()
          ),

          correctAnswer: form.correctAnswer,

          marks: Number(form.marks),

          negativeMarks:
            Number(form.negativeMarks),
        },
        authConfig
      );

      setQuestions((prev) => {
        const updated = [...prev];

        updated[editingIndex] =
          response.data.question;

        return updated;
      });

      setSuccess("Question updated successfully.");

      closeForm();
    } catch (error) {
      console.error("Update question error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update question"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     DELETE QUESTION
  ===================================================== */

  const deleteQuestion = async (index) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await axios.delete(
        `${API_URL}/quizzes/${quizId}/questions/${index}`,
        authConfig
      );

      await fetchQuizData();

      setSuccess("Question deleted successfully.");
    } catch (error) {
      console.error("Delete question error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to delete question"
      );
    }
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateForm = () => {
    if (!form.questionText.trim()) {
      throw new Error("Question text is required.");
    }

    const cleanedOptions = form.options.map((option) =>
      option.trim()
    );

    if (
      cleanedOptions.some(
        (option) => option.length === 0
      )
    ) {
      throw new Error(
        "All four options are required."
      );
    }

    if (!form.correctAnswer) {
      throw new Error(
        "Please select the correct answer."
      );
    }

    if (Number(form.marks) <= 0) {
      throw new Error(
        "Marks must be greater than 0."
      );
    }

    if (Number(form.negativeMarks) < 0) {
      throw new Error(
        "Negative marks cannot be less than 0."
      );
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2
              size={20}
              className="animate-spin"
            />
            Loading quiz questions...
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <section>
          <button
            type="button"
            onClick={() => navigate("/admin/quizzes")}
            className="
              mb-5
              inline-flex
              items-center
              gap-2
              rounded-lg
              px-2
              py-1.5
              text-sm
              font-medium
              text-slate-400
              transition
              hover:bg-white/5
              hover:text-white
            "
          >
            <ArrowLeft size={17} />
            Back to Quizzes
          </button>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <p className="text-sm font-medium text-indigo-400">
                Quiz Management
              </p>

              <h1 className="mt-1 text-2xl font-bold text-white">
                {quiz?.title || "Quiz"}
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Manage questions for this quiz.
              </p>

              {quiz && (
                <div className="mt-4 flex flex-wrap gap-2">

                  {quiz.category?.name && (
                    <InfoBadge>
                      {quiz.category.name}
                    </InfoBadge>
                  )}

                  <InfoBadge>
                    {quiz.duration} min
                  </InfoBadge>

                  <InfoBadge>
                    Passing {quiz.passingPercentage}%
                  </InfoBadge>

                  <InfoBadge>
                    {quiz.maxAttempts} attempt
                    {quiz.maxAttempts !== 1
                      ? "s"
                      : ""}
                  </InfoBadge>

                  <InfoBadge>
                    {quiz.status}
                  </InfoBadge>

                </div>
              )}
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
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
              <Plus size={18} />
              Add Question
            </button>

          </div>
        </section>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {error && (
          <div className="
            flex
            items-center
            justify-between
            rounded-xl
            border
            border-red-500/20
            bg-red-500/10
            px-4
            py-3
            text-sm
            text-red-400
          ">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-emerald-500/20
            bg-emerald-500/10
            px-4
            py-3
            text-sm
            text-emerald-400
          ">
            <CheckCircle2 size={17} />
            {success}
          </div>
        )}

        {/* =================================================
            QUESTIONS
        ================================================= */}

        <section className="
          overflow-hidden
          rounded-2xl
          border
          border-white/10
          bg-white/[0.03]
        ">

          <div className="
            border-b
            border-white/10
            px-5
            py-5
            sm:px-6
          ">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Questions
            </h2>

            <p className="mt-1 text-sm text-slate-800">
              {questions.length} question
              {questions.length !== 1
                ? "s"
                : ""}{" "}
              currently added to this quiz.
            </p>
          </div>

          {questions.length === 0 ? (
            <div className="
              flex
              min-h-72
              flex-col
              items-center
              justify-center
              px-5
              text-center
            ">

              <div className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-indigo-500/10
                text-indigo-400
              ">
                <Plus size={25} />
              </div>

              <h3 className="
                mt-4
                text-base
                font-semibold
                text-white
              ">
                No questions yet
              </h3>

              <p className="
                mt-1
                max-w-md
                text-sm
                text-slate-400
              ">
                Add the first question to start
                building this quiz.
              </p>

              <button
                type="button"
                onClick={openAddForm}
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
                  transition
                  hover:bg-indigo-600
                "
              >
                <Plus size={17} />
                Add First Question
              </button>

            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">

              {questions.map((question, index) => (
                <QuestionCard
                  key={question._id || index}
                  question={question}
                  index={index}
                  onEdit={() =>
                    openEditForm(
                      question,
                      index
                    )
                  }
                  onDelete={() =>
                    deleteQuestion(index)
                  }
                />
              ))}

            </div>
          )}

        </section>

      </div>

      {/* ===================================================
          QUESTION FORM MODAL
      =================================================== */}

      {showForm && (
        <QuestionForm
          form={form}
          setForm={setForm}
          editingIndex={editingIndex}
          saving={saving}
          onClose={closeForm}
          onSubmit={
            editingIndex === null
              ? addQuestion
              : updateQuestion
          }
          onOptionChange={handleOptionChange}
          onCorrectAnswerChange={
            handleCorrectAnswerChange
          }
        />
      )}

    </AdminLayout>
  );
};

/* =========================================================
   QUESTION CARD
========================================================= */

const QuestionCard = ({
  question,
  index,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="p-5 sm:p-6">

      <div className="flex items-start justify-between gap-4">

        <div className="flex min-w-0 gap-4">

          <div className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-indigo-500/10
            text-sm
            font-semibold
            text-indigo-400
          ">
            {index + 1}
          </div>

          <div className="min-w-0">

            <p className="
              text-sm
              font-semibold
              leading-6
              text-slate-900 dark:text-white
            ">
              {question.questionText}
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">

              {question.options?.map(
                (option, optionIndex) => {
                  const isCorrect =
                    option ===
                    question.correctAnswer;

                  return (
                    <div
                      key={optionIndex}
                      className={`
                        rounded-lg
                        border
                        px-3
                        py-2.5
                        text-sm
                        ${
                          isCorrect
                            ? "border-emerald-500/30 bg-emerald-500/10 dark:text-emerald-300 text-green-400"
                            : "border-white/10 bg-white/[0.02] text-gray-600 dark:text-slate-400"
                        }
                      `}
                    >
                      <span className="mr-2 font-medium">
                        {String.fromCharCode(
                          65 + optionIndex
                        )}.
                      </span>

                      {option}

                      {isCorrect && (
                        <CheckCircle2
                          size={14}
                          className="ml-2 inline"
                        />
                      )}
                    </div>
                  );
                }
              )}

            </div>

            <div className="mt-4 flex flex-wrap gap-2">

              <InfoBadge className="bg-indigo-500/10 text-indigo-400">
                Marks: {question.marks}
              </InfoBadge>

              <InfoBadge className="bg-red-500/10 text-red-400">
                Negative:{" "}
                {question.negativeMarks ?? 0}
              </InfoBadge>

            </div>

          </div>

        </div>

        <div className="flex shrink-0 items-center gap-1">

          <button
            type="button"
            onClick={onEdit}
            className="
              rounded-lg
              p-2
              text-slate-400
              transition
              hover:bg-white/5
              hover:text-white
            "
            title="Edit question"
          >
            <Pencil size={17} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="
              rounded-lg
              p-2
              text-slate-400
              transition
              hover:bg-red-500/10
              hover:text-red-400
            "
            title="Delete question"
          >
            <Trash2 size={17} />
          </button>

        </div>

      </div>

    </div>
  );
};

/* =========================================================
   QUESTION FORM
========================================================= */

const QuestionForm = ({
  form,
  setForm,
  editingIndex,
  saving,
  onClose,
  onSubmit,
  onOptionChange,
  onCorrectAnswerChange,
}) => {
  return (
    <div className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/70
      p-4
    ">

      <div className="
        max-h-[90vh]
        w-full
        max-w-2xl
        overflow-y-auto
        rounded-2xl
        border
        border-white/10
        bg-slate-950
        shadow-2xl
      ">

        {/* Header */}

        <div className="
          flex
          items-center
          justify-between
          border-b
          border-white/10
          px-5
          py-4
        ">

          <div>
            <h2 className="
              text-lg
              font-semibold
              text-white
            ">
              {editingIndex === null
                ? "Add Question"
                : "Edit Question"}
            </h2>

            <p className="
              mt-0.5
              text-xs
              text-slate-400
            ">
              Add the question and its answer details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              p-2
              text-slate-400
              transition
              hover:bg-white/5
              hover:text-white
            "
          >
            <X size={19} />
          </button>

        </div>

        {/* Form */}

        <div className="space-y-5 p-5">

          {/* Question */}

          <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Question
                <span className="ml-1 text-red-500">*</span>
              </label>

            <textarea
              value={form.questionText}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  questionText:
                    e.target.value,
                }))
              }
              rows={4}
              placeholder="Enter question text..."
              className="w-full
      resize-none
      rounded-xl
      border
      border-white/10
      bg-slate-900/70
      px-4
      py-3
      text-sm
      leading-6
      text-white
      outline-none
      transition
      placeholder:text-slate-500
      focus:border-indigo-500
      focus:ring-2
      focus:ring-indigo-500/20"
            />
          </div>

          {/* Options */}

          <div>
            <label className="form-label">
              Options
            </label>

            <div className="space-y-3">

              {form.options.map(
                (option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >

                    <div className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-white/5
                      text-sm
                      font-semibold
                      text-slate-400
                    ">
                      {String.fromCharCode(
                        65 + index
                      )}
                    </div>

                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        onOptionChange(
                          index,
                          e.target.value
                        )
                      }
                      placeholder={`Option ${String.fromCharCode(
                        65 + index
                      )}`}
                      className="form-input"
                    />

                  </div>
                )
              )}

            </div>
          </div>

          {/* Correct Answer */}

          <div>
            <label className="form-label">
              Correct Answer
            </label>

            <select
              value={form.correctAnswer}
              onChange={onCorrectAnswerChange}
              className="form-input"
            >
              <option value="">
                Select correct answer
              </option>

              {form.options.map(
                (option, index) => (
                  <option
                    key={index}
                    value={option}
                    disabled={!option.trim()}
                  >
                    {String.fromCharCode(
                      65 + index
                    )}{" "}
                    — {option || "Empty option"}
                  </option>
                )
              )}

            </select>
          </div>

          {/* Marks */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
               <label className="mb-2 block text-sm font-medium text-slate-200">
                  Marks
                  <span className="ml-1 text-red-500">*</span>
                </label>

              <input
                type="number"
                min="1"
                step="1"
                value={form.marks}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    marks: e.target.value,
                  }))
                }
                className=" w-full
        rounded-xl
        border
        border-white/10
        bg-slate-900/70
        px-4
        py-3
        text-sm
        text-white
        outline-none
        transition
        placeholder:text-slate-500
        focus:border-indigo-500
        focus:ring-2
        focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Negative Marks
              </label>

              <input
                type="number"
                min="0"
                step="0.25"
                value={form.negativeMarks}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    negativeMarks:
                      e.target.value,
                  }))
                }
                className="w-full
        rounded-xl
        border
        border-white/10
        bg-slate-900/70
        px-4
        py-3
        text-sm
        text-white
        outline-none
        transition
        placeholder:text-slate-500
        focus:border-indigo-500
        focus:ring-2
        focus:ring-indigo-500/20"
              />
            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="
          flex
          justify-end
          gap-3
          border-t
          border-white/10
          px-5
          py-4
        ">

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              rounded-xl
              border
              border-white/10
              px-4
              py-2.5
              text-sm
              font-medium
              text-slate-300
              transition
              hover:bg-white/5
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={saving}
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
              transition
              hover:bg-indigo-600
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {saving && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            {editingIndex === null
              ? "Add Question"
              : "Save Changes"}
          </button>

        </div>

      </div>

    </div>
  );
};

/* =========================================================
   SMALL COMPONENTS
========================================================= */

const InfoBadge = ({ children }) => {
  return (
    <span className="
      inline-flex
      rounded-lg
      bg-white/5
      px-2.5
      py-1
      text-xs
      font-medium
      text-slate-400
    ">
      {children}
    </span>
  );
};

export default AdminQuestionManagement;