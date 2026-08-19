import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Tag,
  MoreHorizontal,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout.jsx";
import api from "../../api/axios";

const EMPTY_FORM = {
  name: "",
  description: "",
};

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  /* =========================================================
     LOAD CATEGORIES
  ========================================================= */

  const loadCategories = async () => {
    try {
      setError("");

      if (categories.length > 0) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get("/categories");

      const data = response.data;

      setCategories(
        Array.isArray(data?.categories)
          ? data.categories
          : []
      );
    } catch (err) {
      console.error("Load categories error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load categories."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) => {
      return (
        category.name
          ?.toLowerCase()
          .includes(query) ||
        category.description
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [categories, search]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    return {
      total: categories.length,
      visible: filteredCategories.length,
    };
  }, [categories, filteredCategories]);

  /* =========================================================
     CREATE
  ========================================================= */

  const openCreateForm = () => {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const openEditForm = (category) => {
    setEditingCategory(category);

    setForm({
      name: category.name || "",
      description: category.description || "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  /* =========================================================
     CLOSE FORM
  ========================================================= */

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingCategory(null);
    setForm(EMPTY_FORM);
  };

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Category name is required.";
    }

    if (form.name.trim().length < 2) {
      return "Category name must contain at least 2 characters.";
    }

    if (form.name.trim().length > 100) {
      return "Category name cannot exceed 100 characters.";
    }

    if (form.description.trim().length > 500) {
      return "Description cannot exceed 500 characters.";
    }

    return "";
  };

  /* =========================================================
     CREATE / UPDATE
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
    };

    try {
      setSaving(true);

      if (editingCategory) {
        const response = await api.put(
          `/categories/${editingCategory._id}`,
          payload
        );

        const updatedCategory =
          response.data?.category;

        if (updatedCategory) {
          setCategories((prev) =>
            prev.map((category) =>
              category._id === updatedCategory._id
                ? updatedCategory
                : category
            )
          );
        }

        setSuccess(
          "Category updated successfully."
        );
      } else {
        const response = await api.post(
          "/categories",
          payload
        );

        const createdCategory =
          response.data?.category;

        if (createdCategory) {
          setCategories((prev) => [
            createdCategory,
            ...prev,
          ]);
        }

        setSuccess(
          "Category created successfully."
        );
      }

      setShowForm(false);
      setEditingCategory(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error("Save category error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Delete "${category.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(`delete-${category._id}`);
      setError("");
      setSuccess("");

      await api.delete(
        `/categories/${category._id}`
      );

      setCategories((prev) =>
        prev.filter(
          (item) => item._id !== category._id
        )
      );

      setSuccess(
        "Category deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete category error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete category."
      );
    } finally {
      setActionLoading("");
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              Management
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Categories
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Create and manage categories used to organize quizzes.
            </p>
          </div>

          <div className="flex items-center gap-3">

            {/* Refresh */}
            <button
              type="button"
              onClick={loadCategories}
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

            {/* Create */}
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
              Create Category
            </button>

          </div>
        </section>

        {/* =====================================================
            MESSAGES
        ===================================================== */}

        {error && (
          <div
            className="
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
            "
          >
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
          <div
            className="
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
            "
          >
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

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <CategoryStat
            label="Total Categories"
            value={loading ? "—" : stats.total}
            icon={<Tag size={20} />}
          />

          <CategoryStat
            label="Visible Results"
            value={loading ? "—" : stats.visible}
            icon={<Search size={20} />}
          />

        </section>

        {/* =====================================================
            MAIN CARD
        ===================================================== */}

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

          {/* =================================================
              SEARCH
          ================================================= */}

          <div
            className="
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
            "
          >
            <div
              className="
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
              "
            >
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
                placeholder="Search categories..."
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

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <p className="text-sm text-slate-400">
              {filteredCategories.length}{" "}
              {filteredCategories.length === 1
                ? "category"
                : "categories"}
            </p>
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="flex min-h-80 items-center justify-center">
              <div className="text-center">

                <RefreshCw
                  size={24}
                  className="mx-auto animate-spin text-indigo-500"
                />

                <p className="mt-3 text-sm text-slate-400">
                  Loading categories...
                </p>

              </div>
            </div>
          ) : filteredCategories.length === 0 ? (

            /* =================================================
               EMPTY
            ================================================= */

            <div className="flex min-h-80 items-center justify-center p-6">
              <div className="text-center">

                <div
                  className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-indigo-50
                    text-indigo-500
                    dark:bg-indigo-500/10
                    dark:text-indigo-400
                  "
                >
                  <Tag size={26} />
                </div>

                <p
                  className="
                    mt-4
                    text-sm
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  No categories found
                </p>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {categories.length === 0
                    ? "Create your first category to organize quizzes."
                    : "Try changing your search."}
                </p>

                {categories.length === 0 && (
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
                      transition
                      hover:bg-indigo-600
                    "
                  >
                    <Plus size={16} />
                    Create Category
                  </button>
                )}

              </div>
            </div>

          ) : (

            /* =================================================
               TABLE
            ================================================= */

            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px]">

                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10">

                    <TableHeading>
                      Category
                    </TableHeading>

                    <TableHeading>
                      Description
                    </TableHeading>

                    <TableHeading>
                      Created
                    </TableHeading>

                    <TableHeading align="right">
                      Actions
                    </TableHeading>

                  </tr>
                </thead>

                <tbody>

                  {filteredCategories.map(
                    (category) => (
                      <tr
                        key={category._id}
                        className="
                          border-b
                          border-slate-100
                          transition
                          hover:bg-slate-50
                          dark:border-white/[0.06]
                          dark:hover:bg-white/[0.025]
                        "
                      >

                        {/* Category */}
                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div
                              className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-indigo-50
                                text-indigo-500
                                dark:bg-indigo-500/10
                                dark:text-indigo-400
                              "
                            >
                              <Tag size={18} />
                            </div>

                            <div className="min-w-0">

                              <p
                                className="
                                  truncate
                                  text-sm
                                  font-semibold
                                  text-slate-900
                                  dark:text-slate-100
                                "
                              >
                                {category.name}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Description */}
                        <td className="px-5 py-4">

                          <p
                            className="
                              max-w-[450px]
                              truncate
                              text-sm
                              text-slate-600
                              dark:text-slate-400
                            "
                          >
                            {category.description ||
                              "No description"}
                          </p>

                        </td>

                        {/* Created */}
                        <td className="px-5 py-4">

                          <span
                            className="
                              text-sm
                              text-slate-600
                              dark:text-slate-400
                            "
                          >
                            {category.createdAt
                              ? new Date(
                                  category.createdAt
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "—"}
                          </span>

                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-1">

                            {/* Edit */}
                            <button
                              type="button"
                              title="Edit category"
                              onClick={() =>
                                openEditForm(
                                  category
                                )
                              }
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

                            {/* Delete */}
                            <button
                              type="button"
                              title="Delete category"
                              disabled={
                                actionLoading ===
                                `delete-${category._id}`
                              }
                              onClick={() =>
                                handleDelete(
                                  category
                                )
                              }
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
                              {actionLoading ===
                              `delete-${category._id}` ? (
                                <RefreshCw
                                  size={17}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={17} />
                              )}
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          {!loading && categories.length > 0 && (
            <div
              className="
                border-t
                border-slate-200
                px-5
                py-4
                dark:border-white/10
              "
            >
              <p className="text-xs text-slate-400">
                Showing{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {filteredCategories.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {categories.length}
                </span>{" "}
                categories
              </p>
            </div>
          )}

        </section>
      </div>

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {showForm && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-slate-950/50
            p-4
            backdrop-blur-sm
          "
        >

          <div
            className="
              w-full
              max-w-lg
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-2xl
              dark:border-white/10
              dark:bg-slate-900
            "
          >

            {/* Modal Header */}
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-slate-200
                px-6
                py-5
                dark:border-white/10
              "
            >
              <div>

                <h2
                  className="
                    text-lg
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  {editingCategory
                    ? "Edit Category"
                    : "Create Category"}
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {editingCategory
                    ? "Update the category information."
                    : "Add a new category for your quizzes."}
                </p>

              </div>

              <button
                type="button"
                onClick={closeForm}
                className="
                  rounded-lg
                  p-2
                  text-slate-400
                  transition
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

              {/* Category Name */}
                <FormField label="Category Name" required>
                <div className="relative">
                    <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="e.g. Programming"
                    className="
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        py-3
                        pr-16
                        text-sm
                        text-slate-800
                        outline-none
                        transition
                        placeholder:text-slate-400
                        focus:border-indigo-500
                        focus:ring-2
                        focus:ring-indigo-500/10

                        dark:border-white/10
                        dark:bg-white/[0.04]
                        dark:text-slate-200
                        dark:placeholder:text-slate-500
                        dark:focus:border-indigo-500
                        dark:focus:ring-indigo-500/10
                    "
                    />

                    <span className="
                    pointer-events-none
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-xs
                    text-slate-400
                    ">
                    {form.name.length}/100
                    </span>
                </div>
                </FormField>


                {/* Description */}
                <FormField label="Description">
                <div className="relative">
                    <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    maxLength={500}
                    rows={4}
                    placeholder="Describe what this category covers..."
                    className="
                        w-full
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
                        focus:ring-indigo-500/10

                        dark:border-white/10
                        dark:bg-white/[0.04]
                        dark:text-slate-200
                        dark:placeholder:text-slate-500
                        dark:focus:border-indigo-500
                        dark:focus:ring-indigo-500/10
                    "
                    />

                    <div className="
                    mt-1
                    flex
                    justify-end
                    text-xs
                    text-slate-400
                    ">
                    {form.description.length}/500
                    </div>
                </div>
                </FormField>


              {/* Form Error */}
              {error && (
                <div
                  className="
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
                  "
                >
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div
                className="
                  flex
                  flex-col-reverse
                  gap-3
                  border-t
                  border-slate-200
                  pt-5
                  sm:flex-row
                  sm:justify-end
                  dark:border-white/10
                "
              >

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
                    : editingCategory
                    ? "Update Category"
                    : "Create Category"}

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
   COMPONENTS
========================================================= */

const CategoryStat = ({
  label,
  value,
  icon,
}) => {
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
      <div className="flex items-center justify-between">

        <div>
          <p className="text-xs font-medium text-slate-400">
            {label}
          </p>

          <p
            className="
              mt-2
              text-2xl
              font-bold
              text-slate-900
              dark:text-white
            "
          >
            {value}
          </p>
        </div>

        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-indigo-50
            text-indigo-500
            dark:bg-indigo-500/10
            dark:text-indigo-400
          "
        >
          {icon}
        </div>

      </div>
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

      <label
        className="
          mb-2
          block
          text-sm
          font-medium
          text-slate-700
          dark:text-slate-300
        "
      >
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

export default CategoryManagement;