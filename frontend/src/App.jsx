
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/learning-paths" element={<LearningPaths />} />
          <Route path="/watch/:resourceId" element={<Watch />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
