
import { useEffect, useState } from "react";
import {
  BookOpen,
  Brain,
  ChartNoAxesColumnIncreasing,
  GraduationCap,
  PlayCircle,
  ClipboardCheck,
} from "lucide-react";

import api from "../services/api";
import FeaturedVideo from "../components/FeaturedVideo";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [resources, setResources] = useState([]);
  const [topics, setTopics] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const results = await Promise.allSettled([
          api.get("dashboard/"),
          api.get("courses/"),
          api.get("assessments/"),
          api.get("resources/"),
          api.get("topics/"),
          api.get("enrollments/"),
        ]);

        if (results[0].status === "rejected") {
          throw results[0].reason;
        }

        setDashboard(results[0].value.data);

        if (results[1].status === "fulfilled") {
          setCourses(results[1].value.data);
        }

        if (results[2].status === "fulfilled") {
          setAssessments(results[2].value.data);
        }

        if (results[3].status === "fulfilled") {
          setResources(results[3].value.data);
        }

        if (results[4].status === "fulfilled") {
          setTopics(results[4].value.data);
        }

        if (results[5].status === "fulfilled") {
          setEnrollments(results[5].value.data);
        }

      } catch (err) {
        setError(
          err.response?.data?.error ||
          "Unable to load dashboard. Please log in again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("student_id");
    localStorage.removeItem("student_name");
    localStorage.removeItem("student_email");

    window.location.href = "/login";
  }

  // Find one valid video for each course
  const getVideoId = (url) => {
    try {
      const parsed = new URL(url);

      if (parsed.hostname.includes("youtu.be")) {
        return parsed.pathname.slice(1);
      }

      if (parsed.hostname.includes("youtube.com")) {
        return parsed.searchParams.get("v");
      }

      return null;
    } catch {
      return null;
    }
  };

  const featuredVideos = courses
    .map((course) => {
      const courseTopicIds = topics
        .filter(
          (topic) =>
            Number(topic.course) === Number(course.course_id)
        )
        .map((topic) => Number(topic.topic_id));

      const video = resources.find(
        (resource) =>
          courseTopicIds.includes(Number(resource.topic)) &&
          resource.resource_type?.toLowerCase().includes("video") &&
          getVideoId(resource.url)
      );
      
      

      return video
        ? {
            resource: video,
            courseName: course.title,
          }
        : null;
    })
    .filter(Boolean);
  
  const enrolledCourses = enrollments
        .filter((enrollment) => enrollment.status === "active")
          .map((enrollment) => enrollment.course_details);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <p className="text-red-400">{error}</p>

        <button
          onClick={handleLogout}
          className="bg-indigo-600 px-5 py-2 rounded-lg"
        >
          Return to Login
        </button>
      </div>
    );
  }

  const student = dashboard.student;

  // Overall learning path progress
const completedTopics = dashboard.progress.filter(
    (item) => item.completion_status === "completed"
).length;

const totalTopics = dashboard.progress.length;

const overallProgress = totalTopics > 0
    ? (completedTopics / totalTopics) * 100
    : 0;


// Course-wise learning path progress
const courseProgress = Object.values(
    dashboard.progress.reduce((groups, item) => {

        const id = item.course_id;

        if (!groups[id]) {
            groups[id] = {
                course_id: id,
                course_title: item.course_title,
                total: 0,
                completed: 0
            };
        }

        groups[id].total += 1;

        if (item.completion_status === "completed") {
            groups[id].completed += 1;
        }

        return groups;

    }, {})
).map((course) => ({
    ...course,
    percentage: course.total > 0
        ? (course.completed / course.total) * 100
        : 0
}));

  

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <main className="p-8 max-w-7xl mx-auto">

        {/* Welcome */}
        <section className="mb-8">
          <p className="text-slate-400">Student Dashboard</p>

          <h2 className="text-3xl font-bold mt-2">
            Welcome back, {student.name}!
          </h2>

          <p className="text-slate-400 mt-2">
            Continue your personalised learning journey.
          </p>
        </section>

        {/* Student Profile */}
<section className="mb-10">
  <SectionTitle
    icon={<GraduationCap />}
    title="Student Profile"
  />

  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

    <div>
      <p className="text-slate-400 text-sm">Full Name</p>
      <p className="font-semibold mt-2">{student.name}</p>
    </div>

    <div>
      <p className="text-slate-400 text-sm">Email Address</p>
      <p className="font-semibold mt-2 break-all">{student.email}</p>
    </div>

    <div>
      <p className="text-slate-400 text-sm">Student ID</p>
      <p className="font-semibold mt-2">#{student.student_id}</p>
    </div>

  </div>
</section>

        {/* Statistics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

            <StatCard
              icon={<BookOpen />}
              title="My Joined Courses"
              value={enrolledCourses.length}
            />

            <StatCard
              icon={<GraduationCap />}
              title="Learning Paths"
              value={dashboard.learning_paths.length}
            />

            <StatCard
              icon={<ClipboardCheck />}
              title="Assessments Completed"
              value={dashboard.assessment_results.length}
            />

        </section>

        {/* Learning Progress */}
<section className="mb-10">
  <SectionTitle
    icon={<ChartNoAxesColumnIncreasing />}
    title="Learning Progress"
  />

  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

    {/* Overall Progress */}
    <div className="mb-8">
      <div className="flex justify-between mb-3">
        <h3 className="font-semibold">Overall Learning Path Progress</h3>

        <span className="text-indigo-400 font-semibold">
          {Math.round(overallProgress)}%
        </span>
      </div>

      <div className="w-full bg-slate-800 rounded-full h-3">
        <div
          className="bg-indigo-500 h-3 rounded-full transition-all"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      <p className="text-slate-400 text-sm mt-2">
        {completedTopics} of {totalTopics} learning path topics completed
      </p>
    </div>

    {/* Course-wise Progress */}
    <h3 className="font-semibold mb-5">Course-wise Progress</h3>

    {courseProgress.length > 0 ? (
      <div className="space-y-6">
        {courseProgress.map((course) => (
          <div key={course.course_id}>
            <div className="flex justify-between mb-2">
              <span className="text-slate-300">
                {course.course_title}
              </span>

              <span className="text-indigo-400 text-sm">
                {Math.round(course.percentage)}%
              </span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${course.percentage}%` }}
              />
            </div>

            <p className="text-slate-500 text-xs mt-2">
              {course.completed} of {course.total} topics completed
            </p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-slate-400">
        No learning progress available yet. Generate a learning path to get started.
      </p>
    )}

  </div>
</section>

        {/* Courses */}
        <section className="mb-10">
          <SectionTitle
          icon={<BookOpen />}
          title="My Joined Courses"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map((course) => (
              <div
              key={course.course_id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5"
              >
              <h3 className="font-semibold text-lg">
              {course.title}
              </h3>

              <p className="text-slate-400 text-sm mt-2">
              {course.description || "Continue learning."}
              </p>

              <p className="text-indigo-400 text-sm mt-4">
              Level: {course.level}
              </p>

              <p className="text-green-400 text-sm mt-3">
              Enrolled
              </p>
              </div>
              ))
            ) : (
            <p className="text-slate-400">
            You haven't joined any courses yet.
            </p>
            )}
          </div>
        </section>

        {/* Recommended Courses */}
        <section className="mb-10">
          <SectionTitle
            icon={<Brain />}
            title="Recommended Courses"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {dashboard.recommendations.length > 0 ? (
              dashboard.recommendations.map((item) => {
                const course = courses.find(
                  (course) =>
                    Number(course.course_id) === Number(item.course)
                );

                return (
                  <div
                    key={item.recommendation_id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5"
                  >
                    <h3 className="font-semibold">
                      {course?.title || `Course #${item.course}`}
                    </h3>

                    <p className="text-slate-400 text-sm mt-2">
                      {item.reason}
                    </p>

                    <p className="text-indigo-400 text-sm mt-3">
                      Suitability score: {item.suitability_score}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-400">
                No course recommendations available yet.
              </p>
            )}
          </div>
        </section>

        {/* Recent Activity */}
<section className="mb-10">
  <SectionTitle
    icon={<ClipboardCheck />}
    title="Recent Activity"
  />

  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

    {dashboard.assessment_results.length > 0 ? (
      [...dashboard.assessment_results]
        .sort((a, b) => {
          if (!a.attempted_at) return 1;
          if (!b.attempted_at) return -1;

          return new Date(b.attempted_at) - new Date(a.attempted_at);
        })
        .slice(0, 5)
        .map((result) => {
          const assessment = assessments.find(
            (item) =>
              Number(item.assessment_id) === Number(result.assessment)
          );

          return (
            <div
              key={result.result_id}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-slate-800 py-4 last:border-0"
            >
              <div>
                <h3 className="font-semibold">
                  {assessment?.title || `Assessment #${result.assessment}`}
                </h3>

                <p className="text-slate-400 text-sm mt-1">
                  {result.attempted_at
                    ? new Date(result.attempted_at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true
                 }) : "Date unavailable"}
            </p>
              </div>

              <span className="text-indigo-400 font-semibold">
                Score: {result.score}
              </span>
            </div>
          );
        })
    ) : (
      <p className="text-slate-400">
        No recent activity available.
      </p>
    )}

  </div>
</section>



      </main>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="text-indigo-400 mb-4">{icon}</div>
      <p className="text-slate-400 text-sm">{title}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <h2 className="flex items-center gap-3 text-xl font-bold mb-5">
      <span className="text-indigo-400">{icon}</span>
      {title}
    </h2>
  );
}

export default Dashboard;
