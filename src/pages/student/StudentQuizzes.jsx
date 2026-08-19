import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  ClipboardList,
  Clock3,
  Trophy,
  Play,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../../components/student/StudentLayout.jsx";
import api from "../../api/axios";

const StudentQuizzes = () => {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [category, setCategory] = useState("ALL");

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setError("");

      if (quizzes.length > 0) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get("/quizzes");

      const data = response.data;

      const quizList = Array.isArray(data?.quizzes)
        ? data.quizzes
        : [];

      // Student should only see published quizzes.
      const publishedQuizzes = quizList.filter(
        (quiz) => quiz.status === "PUBLISHED"
      );

      setQuizzes(publishedQuizzes);
    } catch (err) {
      console.error("Student quizzes error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load available quizzes."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories = [];

    quizzes.forEach((quiz) => {
      const categoryValue =
        typeof quiz.category === "object"
          ? quiz.category
          : null;

      if (categoryValue?._id) {
        if (
          !uniqueCategories.some(
            (item) => item._id === categoryValue._id
          )
        ) {
          uniqueCategories.push(categoryValue);
        }
      }
    });

    return uniqueCategories;
  }, [quizzes]);

  const getCategoryName = (quiz) => {
    if (typeof quiz.category === "object") {
      return quiz.category?.name || "Uncategorized";
    }

    return "Uncategorized";
  };

  const filteredQuizzes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return quizzes.filter((quiz) => {
      const categoryId =
        typeof quiz.category === "object"
          ? quiz.category?._id
          : quiz.category;

      const categoryName = getCategoryName(quiz);

      const matchesSearch =
        !query ||
        quiz.title?.toLowerCase().includes(query) ||
        quiz.description?.toLowerCase().includes(query) ||
        categoryName.toLowerCase().includes(query);

      const matchesDifficulty =
        difficulty === "ALL" ||
        quiz.difficulty === difficulty;

      const matchesCategory =
        category === "ALL" ||
        categoryId === category;

      return (
        matchesSearch &&
        matchesDifficulty &&
        matchesCategory
      );
    });
  }, [
    quizzes,
    search,
    difficulty,
    category,
  ]);

  const handleStartQuiz = (quiz) => {
    navigate(`/student/quizzes/${quiz._id}`);
  };

  return (
    <StudentLayout>
      <div className="space-y-6">

        {/* Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              Quiz Library
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Available Quizzes
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Choose a quiz and test your knowledge.
            </p>
          </div>

          <button
            type="button"
            onClick={loadQuizzes}
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
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
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
            <AlertCircle size={18} />

            <span>{error}</span>
          </div>
        )}

        {/* Filters */}
        <section className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
          shadow-sm
          dark:border-white/10
          dark:bg-white/[0.03]
          dark:shadow-none
        ">
          <div className="flex flex-col gap-3 lg:flex-row">

            {/* Search */}
            <div className="
              flex
              flex-1
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

            {/* Difficulty */}
            <div className="flex items-center gap-2">
              <Filter
                size={17}
                className="text-slate-400"
              />

              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value)
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

            {/* Category */}
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
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
                All Categories
              </option>

              {categories.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Results count */}
        {!loading && !error && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {filteredQuizzes.length}
              </span>{" "}
              {filteredQuizzes.length === 1
                ? "quiz"
                : "quizzes"}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="
            flex
            min-h-80
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
                Loading available quizzes...
              </p>
            </div>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          /* Empty */
          <div className="
            flex
            min-h-80
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            dark:border-white/10
            dark:bg-white/[0.03]
          ">
            <div className="text-center">

              <ClipboardList
                size={40}
                className="mx-auto text-slate-300 dark:text-slate-700"
              />

              <h3 className="
                mt-4
                text-base
                font-semibold
                text-slate-800
                dark:text-slate-200
              ">
                No quizzes found
              </h3>

              <p className="
                mt-1
                text-sm
                text-slate-400
              ">
                Try changing your search or filters.
              </p>

            </div>
          </div>
        ) : (
          /* Quiz Cards */
          <div className="
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
            xl:grid-cols-3
          ">
            {filteredQuizzes.map((quiz) => (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                categoryName={getCategoryName(quiz)}
                onStart={handleStartQuiz}
              />
            ))}
          </div>
        )}

      </div>
    </StudentLayout>
  );
};

/* =========================================================
   Quiz Card
========================================================= */

const QuizCard = ({
  quiz,
  categoryName,
  onStart,
}) => {
  const difficultyStyles = {
    EASY: `
      bg-emerald-50
      text-emerald-600
      dark:bg-emerald-500/10
      dark:text-emerald-400
    `,
    MEDIUM: `
      bg-amber-50
      text-amber-600
      dark:bg-amber-500/10
      dark:text-amber-400
    `,
    HARD: `
      bg-red-50
      text-red-600
      dark:bg-red-500/10
      dark:text-red-400
    `,
  };

  return (
    <article className="
      group
      overflow-hidden
      rounded-2xl
      border
      border-slate-200
      bg-white
      shadow-sm
      transition
      hover:-translate-y-0.5
      hover:shadow-md
      dark:border-white/10
      dark:bg-white/[0.03]
      dark:shadow-none
    ">

      {/* Thumbnail */}
      <div className="
        relative
        h-44
        overflow-hidden
        bg-slate-100
        dark:bg-white/[0.04]
      ">
        {quiz.thumbnail ? (
          <img
            src={quiz.thumbnail}
            alt={quiz.title}
            className="
              h-full
              w-full
              object-cover
              transition
              duration-300
              group-hover:scale-105
            "
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
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
              size={42}
              className="text-slate-300 dark:text-slate-700"
            />
          </div>
        )}

        {/* Difficulty */}
        <div className="
          absolute
          left-3
          top-3
        ">
          <span
            className={`
              inline-flex
              rounded-lg
              px-2.5
              py-1
              text-xs
              font-semibold
              ${difficultyStyles[quiz.difficulty] || difficultyStyles.MEDIUM}
            `}
          >
            {quiz.difficulty || "MEDIUM"}
          </span>
        </div>

        {/* Published */}
        <div className="
          absolute
          right-3
          top-3
        ">
          <span className="
            inline-flex
            items-center
            gap-1.5
            rounded-lg
            bg-slate-950/70
            px-2.5
            py-1
            text-xs
            font-medium
            text-white
            backdrop-blur
          ">
            <span className="
              h-1.5
              w-1.5
              rounded-full
              bg-emerald-400
            " />

            Available
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">

        {/* Category */}
        <p className="
          text-xs
          font-medium
          text-indigo-600
          dark:text-indigo-400
        ">
          {categoryName}
        </p>

        {/* Title */}
        <h2 className="
          mt-1
          line-clamp-2
          text-lg
          font-semibold
          text-slate-900
          dark:text-white
        ">
          {quiz.title}
        </h2>

        {/* Description */}
        <p className="
          mt-2
          line-clamp-2
          min-h-[40px]
          text-sm
          leading-5
          text-slate-500
          dark:text-slate-400
        ">
          {quiz.description ||
            "Test your knowledge with this quiz."}
        </p>

        {/* Details */}
        <div className="
          mt-5
          grid
          grid-cols-2
          gap-3
        ">

          <InfoItem
            icon={Clock3}
            label="Duration"
            value={`${quiz.duration || 0} min`}
          />

          <InfoItem
            icon={Trophy}
            label="Total Marks"
            value={quiz.totalMarks || 0}
          />

          <InfoItem
            icon={ClipboardList}
            label="Attempts"
            value={quiz.maxAttempts || 1}
          />

          <InfoItem
            icon={Trophy}
            label="Passing"
            value={`${quiz.passingPercentage ?? 0}%`}
          />

        </div>

        {/* Button */}
        <button
          type="button"
          onClick={() => onStart(quiz)}
          className="
            mt-5
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-indigo-500
            px-4
            py-3
            text-sm
            font-semibold
            text-white
            shadow-sm
            shadow-indigo-500/20
            transition
            hover:bg-indigo-600
          "
        >
          <Play size={16} />
          Start Quiz
        </button>

      </div>
    </article>
  );
};

/* =========================================================
   Info Item
========================================================= */

const InfoItem = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="
      rounded-xl
      bg-slate-50
      px-3
      py-2.5
      dark:bg-white/[0.04]
    ">
      <div className="flex items-center gap-2">
        <Icon
          size={15}
          className="text-slate-400"
        />

        <span className="text-[11px] text-slate-400">
          {label}
        </span>
      </div>

      <p className="
        mt-1
        text-sm
        font-semibold
        text-slate-700
        dark:text-slate-200
      ">
        {value}
      </p>
    </div>
  );
};

export default StudentQuizzes;
