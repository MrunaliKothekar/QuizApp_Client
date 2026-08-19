import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Public
import LandingPage from "../pages/LandingPage.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";

// Student
import StudentDashboard from "../pages/student/StudentDashboard.jsx";
import StudentQuizzes from "../pages/student/StudentQuizzes.jsx";
import StudentQuizStart from "../pages/student/StudentQuizStart.jsx";
import StudentQuizAttempt from "../pages/student/StudentQuizAttempt.jsx";
import StudentAttemptReview from "../pages/student/StudentAttemptReview.jsx";
import StudentResult from "../pages/student/StudentResult.jsx";
import StudentProfile from "../pages/student/StudentProfile.jsx";
import StudentAttempts from "../pages/student/StudentAttempts.jsx";
import StudentLeaderboard from "../pages/student/StudentLeaderboard.jsx";

// Admin
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import AdminUsers from "../pages/admin/AdminUsers.jsx";
import AdminQuizzes from "../pages/admin/AdminQuizzes.jsx";
import AdminQuestionManagement from "../pages/admin/AdminQuestionManagement.jsx";
import AdminAttempts from "../pages/admin/AdminAttempts.jsx";
import AdminReports from "../pages/admin/AdminReports.jsx";
import AdminLeaderboard from "../pages/admin/AdminLeaderboard.jsx";
import CreateQuiz from "../pages/admin/CreateQuiz.jsx";
import QuizDetails from "../pages/admin/QuizDetails.jsx";
import CategoryManagement from "../pages/admin/CategoryManagement.jsx";
import AdminAttemptDetails from "../pages/admin/AdminAttemptDetails.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            PUBLIC ROUTES
        ===================================================== */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =====================================================
            ADMIN ROUTES
        ===================================================== */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/quizzes"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminQuizzes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/quizzes/create"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <CreateQuiz />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/quizzes/:quizId"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <QuizDetails />
            </ProtectedRoute>
          }
        />

          <Route
            path="/admin/quizzes/:quizId/questions"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminQuestionManagement />
              </ProtectedRoute>
            }
          />
        
        <Route
            path="/admin/categories"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <CategoryManagement />
              </ProtectedRoute>
            }
          />
          

        <Route
          path="/admin/attempts/:attemptId"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminAttemptDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/leaderboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminLeaderboard />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            STUDENT ROUTES
        ===================================================== */}

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/quizzes"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentQuizzes />
            </ProtectedRoute>
          }
        />

        <Route
            path="/student/quizzes/:quizId"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentQuizStart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/quiz/:quizId/attempt/:attemptId"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentQuizAttempt />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/result/:attemptId"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/attempts/:attemptId"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentAttemptReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/attempts"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentAttempts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/leaderboard"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentLeaderboard />
              </ProtectedRoute>
            }
          />

        {/* =====================================================
            FALLBACK
        ===================================================== */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;