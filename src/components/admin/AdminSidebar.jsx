import {
  LayoutDashboard,
  Users,
  ClipboardList,
  HelpCircle,
  BarChart3,
  Trophy,
  FileBarChart,
  LogOut,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    label: "Users",
    icon: Users,
    path: "/admin/users",
  },
  {
    label: "Quizzes",
    icon: ClipboardList,
    path: "/admin/quizzes",
  },
  {
    label: "Categories",
    icon: HelpCircle,
    path: "/admin/categories",
  },
  {
    label: "Attempts",
    icon: BarChart3,
    path: "/admin/attempts",
  },
  {
    label: "Reports",
    icon: FileBarChart,
    path: "/admin/reports",
  },
  {
    label: "Leaderboard",
    icon: Trophy,
    path: "/admin/leaderboard",
  },
];

const AdminSidebar = ({ mobileOpen, setMobileOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-64
          flex-col
          border-r
          border-slate-200
          bg-white
          transition-transform
          duration-300
          dark:border-white/10
          dark:bg-slate-950

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          lg:translate-x-0
        `}
      >

        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6 dark:border-white/10">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-sm">
              <ClipboardList size={21} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                QuizHub
              </h1>

              <p className="text-xs text-slate-400">
                Admin Panel
              </p>
            </div>

          </div>

          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>

        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">

          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  group
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  font-medium
                  transition

                  ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                  }
                `}
              >
                <Icon
                  size={19}
                  strokeWidth={1.8}
                />

                {item.label}
              </NavLink>
            );
          })}

        </nav>

        {/* Bottom */}
        <div className="border-t border-slate-100 p-4 dark:border-white/10">

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              text-sm
              font-medium
              text-slate-500
              transition
              hover:bg-red-50
              hover:text-red-500
              dark:text-slate-400
              dark:hover:bg-red-500/10
              dark:hover:text-red-400
            "
          >
            <LogOut
              size={19}
              strokeWidth={1.8}
            />

            Logout
          </button>

        </div>

      </aside>
    </>
  );
};

export default AdminSidebar;