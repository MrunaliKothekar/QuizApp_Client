import { useState } from "react";
import StudentSidebar from "./StudentSidebar.jsx";
import StudentNavbar from "./StudentNavbar.jsx";

const StudentLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* Student Sidebar */}
      <StudentSidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64">

        {/* Top Navbar */}
        <StudentNavbar
          setMobileOpen={setMobileOpen}
        />

        {/* Page Content */}
        <main className="min-h-[calc(100vh-5rem)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>

      </div>

    </div>
  );
};

export default StudentLayout;

