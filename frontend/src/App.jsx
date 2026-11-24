
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import LearningPaths from "./pages/LearningPaths";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import StudentLayout from "./components/StudentLayout";
import Assessments from "./pages/Assessments";
import Recommendations from "./pages/Recommendations";
import Home from "./pages/Home";
import Watch from "./pages/Watch";
import CourseDetails from "./pages/CourseDetails";
import AssessmentAttempt from "./pages/AssessmentAttempt";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCourses from "./pages/AdminCourses";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            localStorage.getItem("admin_token")
              ? <AdminLayout />
              : <Navigate to="/admin/login" replace />
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="courses" element={<AdminCourses />} />
        </Route>

        <Route
          path="/admin"
          element={
            localStorage.getItem("admin_token")
              ? <AdminLayout />
              : <Navigate to="/admin/login" replace />
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Protected student pages */}
        <Route
          element={
            localStorage.getItem("token")
              ? <StudentLayout />
              : <Navigate to="/login" replace />
            }
          >
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/courses/:courseId/assessments/:assessmentId" element={<AssessmentAttempt />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/learning-paths" element={<LearningPaths />} />
          <Route path="/watch/:resourceId" element={<Watch />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
