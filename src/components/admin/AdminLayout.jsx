import { useState } from "react";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminNavbar from "./AdminNavbar.jsx";

const AdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">

      <AdminSidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content */}
      <div className="min-h-screen lg:ml-64">

        <AdminNavbar
          setMobileOpen={setMobileOpen}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;