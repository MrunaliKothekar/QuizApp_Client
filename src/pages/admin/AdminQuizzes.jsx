import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ClipboardList,
  RefreshCw,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import api from "../../api/axios";
const EMPTY_FORM = {
  title: "",
  description: "",
  category: "",
  difficulty: "MEDIUM",
  duration: "",
  totalMarks: "",
  passingPercentage: "",
  maxAttempts: 1,
  thumbnail: "",
  status: "DRAFT",
};

const INPUT_CLASS = `
  w-full
  rounded-xl
  border
  border-slate-200
  bg-white
  px-4
  py-3
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
  dark:placeholder:text-slate-500
  dark:focus:border-indigo-500
  dark:focus:ring-indigo-500/20
`;

const TEXTAREA_CLASS = `
  w-full
  min-h-[100px]
  resize-none
  rounded-xl
  border
  border-slate-200
  bg-white
  px-4
  py-3
  text-sm
  leading-6
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
  dark:placeholder:text-slate-500
`;

const SELECT_CLASS = `
  w-full
  rounded-xl
  border
  border-slate-200
  bg-white
  px-4
  py-3
  text-sm
  text-slate-800
  outline-none
  transition
  focus:border-indigo-500
  focus:ring-2
  focus:ring-indigo-500/20
  dark:border-white/10
  dark:bg-slate-900
  dark:text-slate-100
`;

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [actionLoading, setActionLoading] = useState("");
  const navigate = useNavigate();

  const [uploadingImage, setUploadingImage] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
const [thumbnailPreview, setThumbnailPreview] = useState("");

  useEffect(() => {
    loadData();
  }, []);

const uploadThumbnail = async () => {
  if (!thumbnailFile) {
    throw new Error("Please select an image.");
  }

  const formData = new FormData();
  formData.append("image", thumbnailFile);

  try {
    const response = await api.post("/uploads/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Upload response:", response.data);

    const uploadedUrl =
      response.data?.url ||
      response.data?.imageUrl ||
      response.data?.data?.url;

    if (!uploadedUrl) {
      throw new Error(
        "Image uploaded but server did not return an image URL."
      );
    }

    return uploadedUrl;
  } catch (err) {
    console.error(
      "Thumbnail upload error:",
      err.response?.data || err
    );

    throw new Error(
      err.response?.data?.message ||
        "Failed to upload thumbnail."
    );
  }
};

  const loadData = async () => {
    try {
      setError("");

      if (quizzes.length > 0) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [quizResponse, categoryResponse] =
        await Promise.all([
          api.get("/quizzes"),
          api.get("/categories"),
        ]);

      const quizData = quizResponse.data;
      const categoryData = categoryResponse.data;

      setQuizzes(
        Array.isArray(quizData?.quizzes)
          ? quizData.quizzes
          : []
      );

      setCategories(
        Array.isArray(categoryData?.categories)
          ? categoryData.categories
          : []
      );
    } catch (err) {
      console.error("Admin quizzes error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load quiz management data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredQuizzes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return quizzes.filter((quiz) => {
      const categoryName =
        typeof quiz.category === "object"
          ? quiz.category?.name || ""
          : "";

      const matchesSearch =
        !query ||
        quiz.title?.toLowerCase().includes(query) ||
        quiz.description?.toLowerCase().includes(query) ||
        categoryName.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        quiz.status === statusFilter;

      const matchesDifficulty =
        difficultyFilter === "ALL" ||
        quiz.difficulty === difficultyFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDifficulty
      );
    });
  }, [
    quizzes,
    search,
    statusFilter,
    difficultyFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: quizzes.length,

      published: quizzes.filter(
        (quiz) => quiz.status === "PUBLISHED"
      ).length,

      drafts: quizzes.filter(
        (quiz) => quiz.status === "DRAFT"
      ).length,

      closed: quizzes.filter(
        (quiz) => quiz.status === "CLOSED"
      ).length,
    };
  }, [quizzes]);

  const openCreateForm = () => {
  setEditingQuiz(null);
  setForm(EMPTY_FORM);

  setThumbnailFile(null);
  setThumbnailPreview("");

  setError("");
  setSuccess("");
  setShowForm(true);
};

  const openEditForm = (quiz) => {
  setEditingQuiz(quiz);

  setThumbnailFile(null);
  setThumbnailPreview("");

  setForm({
    title: quiz.title || "",
    description: quiz.description || "",
    category:
      typeof quiz.category === "object"
        ? quiz.category?._id || ""
        : quiz.category || "",
    difficulty: quiz.difficulty || "MEDIUM",
    duration: quiz.duration ?? "",
    totalMarks: quiz.totalMarks ?? "",
    passingPercentage:
      quiz.passingPercentage ?? "",
    maxAttempts: quiz.maxAttempts ?? 1,
    thumbnail: quiz.thumbnail || "",
    status: quiz.status || "DRAFT",
  });

  setError("");
  setSuccess("");
  setShowForm(true);
};

 const closeForm = () => {
  if (saving) return;

  setShowForm(false);
  setEditingQuiz(null);

  setForm(EMPTY_FORM);
  setThumbnailFile(null);
  setThumbnailPreview("");
};

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      return "Quiz title is required.";
    }

    if (!form.category) {
      return "Please select a category.";
    }

    if (!form.difficulty) {
      return "Please select a difficulty.";
    }

    if (!form.duration || Number(form.duration) <= 0) {
      return "Duration must be greater than 0.";
    }

    if (
      !form.totalMarks ||
      Number(form.totalMarks) <= 0
    ) {
      return "Total marks must be greater than 0.";
    }

    if (
      form.passingPercentage === "" ||
      Number(form.passingPercentage) < 0 ||
      Number(form.passingPercentage) > 100
    ) {
      return "Passing percentage must be between 0 and 100.";
    }

    if (
      !form.maxAttempts ||
      Number(form.maxAttempts) < 1
    ) {
      return "Maximum attempts must be at least 1.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setSuccess("");
  setSaving(true);

  try {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    let thumbnailUrl = form.thumbnail?.trim() || "";

    // Upload image first if a new file was selected
    if (thumbnailFile) {
      thumbnailUrl = await uploadThumbnail();
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      difficulty: form.difficulty,
      duration: Number(form.duration),
      totalMarks: Number(form.totalMarks),
      passingPercentage: Number(form.passingPercentage),
      maxAttempts: Number(form.maxAttempts),
      thumbnail: thumbnailUrl,
      status: form.status,
    };

    console.log("Quiz payload:", payload);

    if (editingQuiz) {
      const response = await api.put(
        `/quizzes/${editingQuiz._id}`,
        payload
      );

      const updatedQuiz = response.data?.quiz;

      if (updatedQuiz) {
        setQuizzes((prev) =>
          prev.map((quiz) =>
            quiz._id === updatedQuiz._id
              ? updatedQuiz
              : quiz
          )
        );
      }

      setSuccess("Quiz updated successfully.");
    } else {
      const response = await api.post(
        "/quizzes",
        payload
      );

      const createdQuiz = response.data?.quiz;

      if (createdQuiz) {
        setQuizzes((prev) => [
          createdQuiz,
          ...prev,
        ]);
      }

      setSuccess("Quiz created successfully.");
    }

    // Reset upload state after successful save
    setThumbnailFile(null);
    setThumbnailPreview("");

    setShowForm(false);
    setEditingQuiz(null);
    setForm(EMPTY_FORM);
  } catch (err) {
    console.error("Save quiz error:", err);

    setError(
      err.message ||
        err.response?.data?.message ||
        "Failed to save quiz."
    );
  } finally {
    setSaving(false);
  }
};

  const handleDelete = async (quiz) => {
    const confirmed = window.confirm(
      `Delete "${quiz.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(`delete-${quiz._id}`);
      setError("");
      setSuccess("");

      await api.delete(`/quizzes/${quiz._id}`);

      setQuizzes((prev) =>
        prev.filter(
          (item) => item._id !== quiz._id
        )
      );

      setSuccess("Quiz deleted successfully.");
    } catch (err) {
      console.error("Delete quiz error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete quiz."
      );
    } finally {
      setActionLoading("");
    }
  };

  const handlePublishToggle = async (quiz) => {
    try {
      setActionLoading(`publish-${quiz._id}`);
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/quizzes/${quiz._id}/publish`
      );

      const updatedQuiz = response.data?.quiz;

      if (updatedQuiz) {
        setQuizzes((prev) =>
          prev.map((item) =>
            item._id === updatedQuiz._id
              ? {
                  ...item,
                  ...updatedQuiz,
                }
              : item
          )
        );
      }

      setSuccess(
        response.data?.message ||
          "Quiz status updated successfully."
      );
    } catch (err) {
      console.error(
        "Toggle quiz publish error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update quiz status."
      );
    } finally {
      setActionLoading("");
    }
  };

  const getCategoryName = (quiz) => {
    if (typeof quiz.category === "object") {
      return quiz.category?.name || "Uncategorized";
    }

    const category = categories.find(
      (item) => item._id === quiz.category
    );

    return category?.name || "Uncategorized";
  };

const handleThumbnailChange = (e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    setError("Only JPG, PNG, and WEBP images are allowed.");
    e.target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setError("Image size must be less than 5 MB.");
    e.target.value = "";
    return;
  }

  setError("");
  setThumbnailFile(file);

  const previewUrl = URL.createObjectURL(file);
  setThumbnailPreview(previewUrl);
};


  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              Quiz Management
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Quizzes
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Create, manage, publish and organize
              quizzes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              disabled={loading || refreshing}
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

            <button
              type="button"
              onClick={openCreateForm}
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
                shadow-sm
                shadow-indigo-500/20
                transition
                hover:bg-indigo-600
              "
            >
              <Plus size={17} />
              Create Quiz
            </button>
          </div>
        </section>

        {/* Messages */}
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

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <QuizStat
            label="Total Quizzes"
            value={loading ? "—" : stats.total}
          />

          <QuizStat
            label="Published"
            value={loading ? "—" : stats.published}
          />

          <QuizStat
            label="Drafts"
            value={loading ? "—" : stats.drafts}
          />

          <QuizStat
            label="Closed"
            value={loading ? "—" : stats.closed}
          />
        </section>

        {/* Main Card */}
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

          {/* Filters */}
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
                placeholder="Search quizzes..."
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
            <div className="flex flex-wrap items-center gap-3">

              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Filter size={16} />
                Filters
              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
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
                <option value="DRAFT">
                  Draft
                </option>
                <option value="PUBLISHED">
                  Published
                </option>
                <option value="CLOSED">
                  Closed
                </option>
              </select>

              <select
                value={difficultyFilter}
                onChange={(e) =>
                  setDifficultyFilter(
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
                  All Difficulty
                </option>
                <option value="EASY">
                  Easy
                </option>
                <option value="MEDIUM">
                  Medium
                </option>
                <option value="HARD">
                  Hard
                </option>
              </select>

            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-80 items-center justify-center">
              <div className="text-center">
                <RefreshCw
                  size={24}
                  className="mx-auto animate-spin text-indigo-500"
                />

                <p className="mt-3 text-sm text-slate-400">
                  Loading quizzes...
                </p>
              </div>
            </div>
          ) : filteredQuizzes.length === 0 ? (

            /* Empty */
            <div className="flex min-h-80 items-center justify-center p-6">
              <div className="text-center">

                <ClipboardList
                  size={36}
                  className="mx-auto text-slate-300 dark:text-slate-700"
                />

                <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  No quizzes found
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {quizzes.length === 0
                    ? "Create your first quiz to get started."
                    : "Try changing your search or filters."}
                </p>

                {quizzes.length === 0 && (
                  <button
                    type="button"
                    onClick={openCreateForm}
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
                    <Plus size={16} />
                    Create Quiz
                  </button>
                )}

              </div>
            </div>

          ) : (

            /* Table */
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1050px]">

                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10">

                    <TableHeading>
                      Quiz
                    </TableHeading>

                    <TableHeading>
                      Category
                    </TableHeading>

                    <TableHeading>
                      Difficulty
                    </TableHeading>

                    <TableHeading>
                      Duration
                    </TableHeading>

                    <TableHeading>
                      Passing
                    </TableHeading>

                    <TableHeading>
                      Attempts
                    </TableHeading>

                    <TableHeading>
                      Status
                    </TableHeading>

                    <TableHeading align="right">
                      Actions
                    </TableHeading>

                  </tr>
                </thead>

                <tbody>
                  {filteredQuizzes.map((quiz) => (
                    <tr
                      key={quiz._id}
                      onClick={() =>navigate(`/admin/quizzes/${quiz._id}/questions`)}
                      className="
                        border-b
                        border-slate-100
                        transition
                        hover:bg-slate-50
                        dark:border-white/[0.06]
                        dark:hover:bg-white/[0.025]
                      "
                    >

                      {/* Quiz */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="
                            h-11
                            w-11
                            shrink-0
                            overflow-hidden
                            rounded-xl
                            border
                            border-slate-200
                            bg-slate-100
                            dark:border-white/10
                            dark:bg-white/[0.04]
                          ">
                            {quiz.thumbnail ? (
                              <img
                                src={quiz.thumbnail}
                                alt=""
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ClipboardList
                                  size={18}
                                  className="text-slate-400"
                                />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="
                              truncate
                              text-sm
                              font-semibold
                              text-slate-800
                              dark:text-slate-200
                            ">
                              {quiz.title}
                            </p>

                            <p className="
                              mt-0.5
                              max-w-[260px]
                              truncate
                              text-xs
                              text-slate-400
                            ">
                              {quiz.description ||
                                "No description"}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        <span className="
                          text-sm
                          text-slate-600
                          dark:text-slate-400
                        ">
                          {getCategoryName(quiz)}
                        </span>
                      </td>

                      {/* Difficulty */}
                      <td className="px-5 py-4">
                        <DifficultyBadge
                          difficulty={
                            quiz.difficulty
                          }
                        />
                      </td>

                      {/* Duration */}
                      <td className="
                        px-5
                        py-4
                        text-sm
                        text-slate-600
                        dark:text-slate-400
                      ">
                        {quiz.duration} min
                      </td>

                      {/* Passing */}
                      <td className="
                        px-5
                        py-4
                        text-sm
                        font-medium
                        text-slate-700
                        dark:text-slate-300
                      ">
                        {quiz.passingPercentage}%
                      </td>

                      {/* Attempts */}
                      <td className="
                        px-5
                        py-4
                        text-sm
                        text-slate-600
                        dark:text-slate-400
                      ">
                        {quiz.maxAttempts}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge
                          status={quiz.status}
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">

                          <button
                            type="button"
                            title="Edit quiz"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditForm(quiz);
                            }}
                            className="
                              rounded-lg
                              p-2
                              text-slate-400
                              transition
                              hover:bg-slate-100
                              hover:text-indigo-600
                              dark:hover:bg-white/5
                              dark:hover:text-indigo-400
                            "
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            title={
                              quiz.status ===
                              "PUBLISHED"
                                ? "Unpublish quiz"
                                : "Publish quiz"
                            }
                            disabled={
                              actionLoading ===
                              `publish-${quiz._id}`
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePublishToggle(
                                quiz
                              );
                            }}
                            className="
                              rounded-lg
                              p-2
                              text-slate-400
                              transition
                              hover:bg-slate-100
                              hover:text-indigo-600
                              disabled:opacity-50
                              dark:hover:bg-white/5
                              dark:hover:text-indigo-400
                            "
                          >
                            {quiz.status ===
                            "PUBLISHED" ? (
                              <EyeOff size={17} />
                            ) : (
                              <Eye size={17} />
                            )}
                          </button>

                          <button
                            type="button"
                            title="Delete quiz"
                            disabled={
                              actionLoading ===
                              `delete-${quiz._id}`
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(quiz);
                            }}
                            className="
                              rounded-lg
                              p-2
                              text-slate-400
                              transition
                              hover:bg-red-50
                              hover:text-red-600
                              disabled:opacity-50
                              dark:hover:bg-red-500/10
                              dark:hover:text-red-400
                            "
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

          {/* Footer */}
          {!loading && quizzes.length > 0 && (
            <div className="
              border-t
              border-slate-200
              px-5
              py-4
              dark:border-white/10
            ">
              <p className="text-xs text-slate-400">
                Showing{" "}
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {filteredQuizzes.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {quizzes.length}
                </span>{" "}
                quizzes
              </p>
            </div>
          )}

        </section>
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
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
            max-h-[90vh]
            w-full
            max-w-2xl
            overflow-y-auto
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-2xl
            dark:border-white/10
            dark:bg-slate-900
          ">

            {/* Modal Header */}
            <div className="
              sticky
              top-0
              z-10
              flex
              items-center
              justify-between
              border-b
              border-slate-200
              bg-white
              px-6
              py-5
              dark:border-white/10
              dark:bg-slate-900
            ">
              <div>
                <h2 className="
                  text-lg
                  font-semibold
                  text-slate-900
                  dark:text-white
                ">
                  {editingQuiz
                    ? "Edit Quiz"
                    : "Create Quiz"}
                </h2>

                <p className="
                  mt-1
                  text-sm
                  text-slate-400
                ">
                  {editingQuiz
                    ? "Update quiz information."
                    : "Add a new quiz to QuizHub."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="
                  rounded-lg
                  p-2
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-slate-700
                  dark:hover:bg-white/5
                  dark:hover:text-white
                "
              >
                <X size={19} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {/* Title */}
              <FormField
                label="Quiz Title"
                required
              >
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="JavaScript Fundamentals"
                  className={INPUT_CLASS}
                />
              </FormField>

              {/* Description */}
              <FormField label="Description">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe what this quiz covers..."
                  className={TEXTAREA_CLASS}
                />
              </FormField>

              {/* Category + Difficulty */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
  <FormField label="Category" required>
    <select
      name="category"
      value={form.category}
      onChange={handleChange}
      className={SELECT_CLASS}
    >
      <option value="" className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">
        Select category
      </option>

      {categories.map((category) => (
        <option
          key={category._id}
          value={category._id}
          className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100"
        >
          {category.name}
        </option>
      ))}
    </select>

    {categories.length === 0 && (
      <p className="mt-2 text-xs text-amber-500">
        No categories found. Create a category first.
      </p>
    )}
  </FormField>

  <FormField label="Difficulty" required>
    <select
      name="difficulty"
      value={form.difficulty}
      onChange={handleChange}
      className={SELECT_CLASS}
    >
      <option
        value="EASY"
        className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100"
      >
        Easy
      </option>

      <option
        value="MEDIUM"
        className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100"
      >
        Medium
      </option>

      <option
        value="HARD"
        className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100"
      >
        Hard
      </option>
    </select>
  </FormField>
</div>

              {/* Duration + Total Marks */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FormField label="Duration" required>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          name="duration"
                          value={form.duration}
                          onChange={handleChange}
                          placeholder="20"
                          className={`${INPUT_CLASS} pr-20`}
                        />

                        <span className="
                          pointer-events-none
                          absolute
                          right-4
                          top-1/2
                          -translate-y-1/2
                          text-xs
                          font-medium
                          text-slate-400
                        ">
                          minutes
                        </span>
                      </div>
                    </FormField>

                    <FormField label="Total Marks" required>
                      <input
                        type="number"
                        min="1"
                        name="totalMarks"
                        value={form.totalMarks}
                        onChange={handleChange}
                        placeholder="20"
                        className={INPUT_CLASS}
                      />
                    </FormField>
                  </div>

              {/* Passing + Attempts */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField label="Passing Percentage" required>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      name="passingPercentage"
                      value={form.passingPercentage}
                      onChange={handleChange}
                      placeholder="60"
                      className={`${INPUT_CLASS} pr-10`}
                    />

                    <span className="
                      pointer-events-none
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-sm
                      font-medium
                      text-slate-400
                    ">
                      %
                    </span>
                  </div>
                </FormField>

                <FormField label="Maximum Attempts" required>
                  <input
                    type="number"
                    min="1"
                    name="maxAttempts"
                    value={form.maxAttempts}
                    onChange={handleChange}
                    placeholder="1"
                    className={INPUT_CLASS}
                  />
                </FormField>
              </div>

              {/* Thumbnail */}
              <FormField label="Quiz Thumbnail">
  <div className="
    overflow-hidden
    rounded-xl
    border
    border-slate-200
    bg-slate-50
    dark:border-white/10
    dark:bg-white/[0.03]
  ">

    {thumbnailPreview || form.thumbnail ? (
      <div className="relative">

        <img
          src={thumbnailPreview || form.thumbnail}
          alt="Quiz thumbnail preview"
          className="
            h-48
            w-full
            object-cover
          "
        />

        <div className="
          absolute
          inset-x-0
          bottom-0
          flex
          items-center
          justify-between
          bg-slate-950/70
          px-4
          py-3
        ">
          <label className="
            cursor-pointer
            text-sm
            font-medium
            text-white
            hover:text-indigo-300
          ">
            Change image

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleThumbnailChange}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              setThumbnailFile(null);
              setThumbnailPreview("");
              setForm((prev) => ({
                ...prev,
                thumbnail: "",
              }));
            }}
            className="
              text-sm
              font-medium
              text-red-300
              hover:text-red-200
            "
          >
            Remove
          </button>
        </div>

      </div>
    ) : (
      <label className="
        flex
        min-h-48
        cursor-pointer
        flex-col
        items-center
        justify-center
        px-6
        py-8
        text-center
        transition
        hover:bg-indigo-50
        dark:hover:bg-indigo-500/5
      ">

        <div className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          bg-indigo-500/10
          text-indigo-500
          dark:text-indigo-400
        ">
          <ImageIcon size={22} />
        </div>

        <p className="
          mt-3
          text-sm
          font-semibold
          text-slate-700
          dark:text-slate-200
        ">
          Upload quiz thumbnail
        </p>

        <p className="
          mt-1
          text-xs
          text-slate-400
        ">
          JPG, PNG or WEBP · Max 5 MB
        </p>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleThumbnailChange}
          className="hidden"
        />
      </label>
    )}

  </div>

  <p className="
    mt-2
    text-xs
    text-slate-400
  ">
    Optional. This image will be displayed with the quiz.
  </p>
</FormField>

              {/* Status */}
              <FormField label="Quiz Status" required>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={SELECT_CLASS}
                >
                  <option
                    value="DRAFT"
                    className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  >
                    Draft
                  </option>

                  <option
                    value="PUBLISHED"
                    className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  >
                    Published
                  </option>

                  <option
                    value="CLOSED"
                    className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  >
                    Closed
                  </option>
                </select>
              </FormField>

              {/* Form Error */}
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

              {/* Buttons */}
              <div className="
                flex
                flex-col-reverse
                gap-3
                border-t
                border-slate-200
                pt-5
                sm:flex-row
                sm:justify-end
                dark:border-white/10
              ">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    px-5
                    py-2.5
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
                  type="submit"
                  disabled={saving}
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
                    transition
                    hover:bg-indigo-600
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {saving && (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : editingQuiz
                    ? "Update Quiz"
                    : "Create Quiz"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

/* =========================================================
   Components
========================================================= */

const QuizStat = ({ label, value }) => {
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
      <p className="text-xs font-medium text-slate-400">
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
  );
};

const FormField = ({
  label,
  required = false,
  children,
}) => {
  return (
    <div>
      <label className="
        mb-2
        block
        text-sm
        font-medium
        text-slate-700
        dark:text-slate-300
      ">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
};

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

const DifficultyBadge = ({ difficulty }) => {
  const styles = {
    EASY: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    MEDIUM:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    HARD: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  };

  return (
    <span
      className={`
        inline-flex
        rounded-lg
        px-2.5
        py-1
        text-xs
        font-medium
        ${styles[difficulty] || styles.MEDIUM}
      `}
    >
      {difficulty || "MEDIUM"}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    DRAFT: {
      label: "Draft",
      className:
        "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400",
    },

    PUBLISHED: {
      label: "Published",
      className:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    },

    CLOSED: {
      label: "Closed",
      className:
        "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    },
  };

  const current = config[status] || config.DRAFT;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-lg
        px-2.5
        py-1
        text-xs
        font-medium
        ${current.className}
      `}
    >
      <span className="
        h-1.5
        w-1.5
        rounded-full
        bg-current
      " />

      {current.label}
    </span>
  );
};

export default AdminQuizzes;