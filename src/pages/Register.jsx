import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.name,
        formData.email,
        formData.password
      );

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white flex transition-colors duration-300">

      {/* Left section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden order-2 bg-slate-100 dark:bg-slate-950 transition-colors duration-300">

        {/* Glows */}
        <div className="absolute -top-40 -right-20 w-[500px] h-[500px] bg-indigo-400/20 dark:bg-indigo-600/25 blur-[120px] rounded-full" />

        <div className="absolute -bottom-40 -left-20 w-[450px] h-[450px] bg-violet-400/20 dark:bg-violet-600/20 blur-[120px] rounded-full" />

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
              Start your journey
            </div>

            {/* Heading */}
            <h1 className="text-5xl font-bold leading-tight tracking-tight">
              Turn knowledge
              <br />
              into{" "}
              <span className="text-indigo-500 dark:text-indigo-400">
                progress.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              Create your account and start challenging yourself
              with quizzes designed to help you learn and improve.
            </p>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-2 gap-4">

              <Stat
                value="∞"
                label="Challenges"
              />

              <Stat
                value="24/7"
                label="Access"
              />

              <Stat
                value="📊"
                label="Analytics"
              />

              <Stat
                value="🏆"
                label="Rankings"
              />

            </div>

          </div>

          {/* Copyright */}
          <p className="text-sm text-slate-500 dark:text-slate-600">
            © {new Date().getFullYear()} QuizHub
          </p>

        </div>
      </div>

      {/* Register form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white dark:bg-slate-900 order-1 transition-colors duration-300">

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
              GET STARTED
            </p>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Create your account
            </h2>

            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Join QuizHub and start testing your knowledge.
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-6 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-300">
              {success}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
                placeholder="Your name"
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
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

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Confirm password
              </label>

              <div className="relative">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  placeholder="Repeat your password"
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
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
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
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>

              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-slate-500 leading-relaxed pt-1">
              By creating an account, you agree to use the
              platform responsibly and follow the assessment
              rules.
            </p>

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
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>

          </form>

          {/* Login */}
          <p className="text-center text-sm text-slate-500 mt-7">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition"
            >
              Sign in
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

const Stat = ({ value, label }) => {
  return (
    <div
      className="
        rounded-xl
        bg-white
        dark:bg-white/[0.04]
        border
        border-slate-200
        dark:border-white/10
        p-5
        shadow-sm
        dark:shadow-none
        transition-colors
      "
    >
      <div className="text-2xl font-bold text-indigo-500 dark:text-indigo-400">
        {value}
      </div>

      <div className="text-sm text-slate-500 mt-1">
        {label}
      </div>
    </div>
  );
};

export default Register;