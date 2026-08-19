import { useTheme } from "../context/ThemeContext.jsx";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      title={
        theme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      className="
        w-10
        h-10
        rounded-xl
        flex
        items-center
        justify-center
        border
        border-slate-200
        dark:border-white/10
        bg-white
        dark:bg-white/5
        hover:bg-slate-100
        dark:hover:bg-white/10
        text-slate-700
        dark:text-slate-200
        transition-all
        duration-200
        cursor-pointer
      "
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
};

export default ThemeToggle;