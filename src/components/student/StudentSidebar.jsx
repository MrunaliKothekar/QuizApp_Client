
import {
  LayoutDashboard,
  ClipboardList,
  History,
  Trophy,
  User,
  LogOut,
  GraduationCap,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const StudentSidebar = ({
  mobileOpen,
  setMobileOpen,
}) => {
  const { user, logout } = useAuth();

  const navigation = [
    {
      label: "Dashboard",
      path: "/student/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Available Quizzes",
      path: "/student/quizzes",
      icon: ClipboardList,
    },
    {
      label: "My Attempts",
      path: "/student/attempts",
      icon: History,
    },
    {
      label: "Leaderboard",
      path: "/student/leaderboard",
      icon: Trophy,
    },
    {
      label: "Profile",
      path: "/student/profile",
      icon: User,
    },
  ];

  const handleLogout = () => {
    setMobileOpen?.(false);
    logout();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen?.(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-64
          flex-col
          border-r
          border-slate-200
          bg-white
          transition-transform
          duration-300
          dark:border-white/10
          dark:bg-slate-950

          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* Logo */}
        <div className="
          flex
          h-20
          shrink-0
          items-center
          justify-between
          border-b
          border-slate-200
          px-5
          dark:border-white/10
        ">

          <div className="flex items-center gap-3">

            <div className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-indigo-500
              text-white
              shadow-sm
              shadow-indigo-500/20
            ">
              <GraduationCap size={21} />
            </div>

            <div>
              <p className="
                text-sm
                font-bold
                text-slate-900
                dark:text-white
              ">
                QuizHub
              </p>

              <p className="text-xs text-slate-400">
                Student Portal
              </p>
            </div>

          </div>

          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setMobileOpen?.(false)}
            className="
              rounded-lg
              p-2
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
              dark:hover:bg-white/5
              dark:hover:text-white
              lg:hidden
            "
          >
            <X size={19} />
          </button>

        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">

          <p className="
            mb-3
            px-3
            text-[11px]
            font-semibold
            uppercase
            tracking-wider
            text-slate-400
          ">
            Menu
          </p>

          <div className="space-y-1">

            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen?.(false)}
                  className={({ isActive }) => `
                    group
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    transition

                    ${
                      isActive
                        ? `
                          bg-indigo-50
                          text-indigo-600
                          dark:bg-indigo-500/10
                          dark:text-indigo-400
                        `
                        : `
                          text-slate-500
                          hover:bg-slate-50
                          hover:text-slate-800
                          dark:text-slate-400
                          dark:hover:bg-white/5
                          dark:hover:text-slate-200
                        `
                    }
                  `}
                >
                  <Icon
                    size={18}
                    className="shrink-0"
                  />

                  <span>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}

          </div>

        </nav>

        {/* Student Account */}
        <div className="
          shrink-0
          border-t
          border-slate-200
          p-4
          dark:border-white/10
        ">

          <div className="
            flex
            items-center
            gap-3
            rounded-xl
            bg-slate-50
            p-3
            dark:bg-white/[0.03]
          ">

            {/* Avatar */}
            <div className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-indigo-500
              text-sm
              font-semibold
              text-white
            ">
              {user?.name?.charAt(0)?.toUpperCase() || "S"}
            </div>

            {/* User Info */}
            <div className="min-w-0 flex-1">

              <p className="
                truncate
                text-sm
                font-semibold
                text-slate-800
                dark:text-slate-200
              ">
                {user?.name || "Student"}
              </p>

              <p className="
                truncate
                text-xs
                text-slate-400
              ">
                Student
              </p>

            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="
                shrink-0
                rounded-lg
                p-2
                text-slate-400
                transition
                hover:bg-red-50
                hover:text-red-500
                dark:hover:bg-red-500/10
                dark:hover:text-red-400
              "
            >
              <LogOut size={17} />
            </button>

          </div>

        </div>

      </aside>
    </>
  );
};

export default StudentSidebar;

