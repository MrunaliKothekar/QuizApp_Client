import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await login(
        formData.email,
        formData.password
      );

      if (data.user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white flex transition-colors duration-300">

      {/* Left visual section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-100 dark:bg-slate-950 transition-colors duration-300">

        {/* Glows */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-indigo-400/20 dark:bg-indigo-600/25 blur-[120px] rounded-full" />

        <div className="absolute -bottom-40 -right-20 w-[450px] h-[450px] bg-violet-400/20 dark:bg-violet-600/20 blur-[120px] rounded-full" />

        <div className="relative z-10 flex flex-col justify-between w-full p-12">

          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight"
          >
            Quiz<span className="text-indigo-500 dark:text-indigo-400">Hub</span>
          </Link>

          {/* Main message */}
          <div className="max-w-lg">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 text-sm text-indigo-600 dark:text-indigo-300 mb-7">
              <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400" />
              Welcome back
            </div>

            {/* Heading */}
            <h1 className="text-5xl font-bold leading-tight tracking-tight">
              Keep learning.
              <br />
              Keep{" "}
              <span className="text-indigo-500 dark:text-indigo-400">
                improving.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              Sign in to continue your assessments, track your
              performance, and discover new challenges.
            </p>

            {/* Benefits */}
            <div className="mt-10 space-y-4">

              <Benefit
                icon="✓"
                text="Access your personalized quizzes"
              />

              <Benefit
                icon="✓"
                text="Track your assessment performance"
              />

              <Benefit
                icon="✓"
                text="Review your previous attempts"
              />

            </div>

          </div>

          {/* Copyright */}
          <p className="text-sm text-slate-500 dark:text-slate-600">
            © {new Date().getFullYear()} QuizHub
          </p>

        </div>
      </div>

      {/* Login section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white dark:bg-slate-900 transition-colors duration-300">

        <div className="w-full max-w-md">

          {/* Top controls */}
          <div className="flex items-center justify-between mb-10">

            {/* Mobile logo */}
            <Link
              to="/"
              className="lg:hidden text-2xl font-bold"
            >
              Quiz<span className="text-indigo-500 dark:text-indigo-400">Hub</span>
            </Link>

            {/* Theme toggle */}
            <div className="ml-auto">
              <ThemeToggle />
            </div>

          </div>

          {/* Heading */}
          <div className="mb-8">

            <p className="text-indigo-500 dark:text-indigo-400 text-sm font-medium mb-3">
              ACCOUNT
            </p>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Welcome back
            </h2>

            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Sign in to continue to your account.
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
              <span className="font-semibold">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  dark:border-white/10
                  bg-slate-50
                  dark:bg-white/5
                  px-4
                  py-3.5
                  text-slate-900
                  dark:text-white
                  placeholder:text-slate-400
                  dark:placeholder:text-slate-600
                  outline-none
                  transition
                  focus:border-indigo-500
                  focus:ring-2
                  focus:ring-indigo-500/20
                "
              />
            </div>

            {/* Password */}
            <div>

              <div className="flex items-center justify-between mb-2">

                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>

                <Link
  to="/forgot-password"
  className="text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition"
>
  Forgot password?
</Link>

              </div>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    dark:border-white/10
                    bg-slate-50
                    dark:bg-white/5
                    px-4
                    py-3.5
                    pr-16
                    text-slate-900
                    dark:text-white
                    placeholder:text-slate-400
                    dark:placeholder:text-slate-600
                    outline-none
                    transition
                    focus:border-indigo-500
                    focus:ring-2
                    focus:ring-indigo-500/20
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-sm
                    text-slate-500
                    hover:text-slate-800
                    dark:hover:text-slate-300
                    transition
                  "
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                rounded-xl
                bg-indigo-500
                py-3.5
                font-semibold
                text-white
                transition
                hover:bg-indigo-600
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading ? "Signing you in..." : "Sign In"}
            </button>

          </form>

          {/* Register */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-500 mt-8">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition"
            >
              Create an account
            </Link>
          </p>

          {/* Back */}
          <Link
            to="/"
            className="
              block
              text-center
              text-sm
              text-slate-500
              dark:text-slate-600
              hover:text-slate-800
              dark:hover:text-slate-400
              mt-5
              transition
            "
          >
            ← Back to home
          </Link>

        </div>
      </div>

    </div>
  );
};

const Benefit = ({ icon, text }) => {
  return (
    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">

      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm">
        {icon}
      </span>

      <span>{text}</span>

    </div>
  );
};

export default Login;