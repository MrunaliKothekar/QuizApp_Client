import {
  Bell,
  Search,
  UserCircle,
  Menu,
  Sun,
  Moon,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext.jsx";

const AdminNavbar = ({ setMobileOpen }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/90 sm:px-6 lg:px-8">

      {/* Left */}
      <div className="flex items-center gap-3">

        {/* Mobile menu */}
        <button
          onClick={() => setMobileOpen?.(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white lg:hidden"
        >
          <Menu size={21} />
        </button>

        <div>
          <p className="hidden text-xs font-medium text-slate-400 sm:block">
            Quiz Management Platform
          </p>

          <h2 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
            Admin Dashboard
          </h2>
        </div>

      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-4">

        {/* Search */}
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex dark:border-white/10 dark:bg-white/[0.04]">
          <Search
            size={17}
            className="text-slate-400"
          />

          <input
            type="text"
            placeholder="Search..."
            className="w-36 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
          />
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={
            theme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
        >
          {theme === "dark" ? (
            <Sun size={19} />
          ) : (
            <Moon size={19} />
          )}
        </button>

        {/* Notifications */}
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <Bell size={19} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-600" />
        </button>

        {/* Profile */}
        <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 dark:border-white/10 sm:flex">

          <UserCircle
            size={34}
            className="text-slate-400"
          />

          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Administrator
            </p>

            <p className="text-xs text-slate-400">
              Admin
            </p>
          </div>

        </div>

      </div>

    </header>
  );
};

export default AdminNavbar;