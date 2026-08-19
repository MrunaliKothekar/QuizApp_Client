import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const LandingPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // If already logged in, don't show the landing page again
  if (user) {
    if (user.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/student/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white overflow-hidden transition-colors duration-300">

      {/* Navbar */}
      <header className="relative z-10 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight"
          >
            Quiz<span className="text-indigo-500 dark:text-indigo-400">Hub</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-3">

            <ThemeToggle />

            <Link
              to="/login"
              className="hidden sm:block px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition shadow-sm"
            >
              Get Started
            </Link>

          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative">

        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-400/20 dark:bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

        <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">

          <div className="max-w-3xl mx-auto text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 text-sm text-indigo-600 dark:text-indigo-300 mb-8 transition-colors">
              <span className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-pulse" />
              Smarter way to test your knowledge
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Learn.
              <span className="text-indigo-500 dark:text-indigo-400">
                {" "}Challenge.
              </span>
              <br />
              Improve.
            </h1>

            {/* Description */}
            <p className="mt-7 text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto transition-colors">
              Take timed assessments, test your skills across different
              categories, track your performance, and see how you rank.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">

              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition shadow-lg shadow-indigo-500/20"
              >
                Start Learning →
              </Link>

              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-white font-semibold transition"
              >
                Sign In
              </Link>

            </div>

          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-24">

            <FeatureCard
              icon="⏱"
              title="Timed Assessments"
              description="Challenge yourself with timed quizzes and automatic submission when time runs out."
            />

            <FeatureCard
              icon="📊"
              title="Track Performance"
              description="Understand your strengths and weaknesses through detailed quiz results."
            />

            <FeatureCard
              icon="🏆"
              title="Compete & Improve"
              description="Compare your performance on leaderboards and keep improving your score."
            />

          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} QuizHub. Built for learning and assessment.
        </div>
      </footer>

    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div
      className="
        group
        p-7
        rounded-2xl
        bg-white
        dark:bg-white/[0.04]
        border
        border-slate-200
        dark:border-white/10
        hover:border-indigo-300
        dark:hover:border-indigo-400/30
        hover:bg-slate-50
        dark:hover:bg-white/[0.06]
        shadow-sm
        dark:shadow-none
        transition-all
        duration-300
      "
    >

      {/* Icon */}
      <div className="text-3xl mb-5">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
        {title}
      </h3>

      {/* Description */}
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>

    </div>
  );
};

export default LandingPage;