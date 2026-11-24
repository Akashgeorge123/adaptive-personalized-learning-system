
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search, Layers, CheckCircle } from "lucide-react";
import api from "../services/api";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [joiningCourse, setJoiningCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCourses() {
      try {
        const [
          courseResponse,
          topicResponse,
          enrollmentResponse,
        ] = await Promise.all([
          api.get("courses/"),
          api.get("topics/"),
          api.get("enrollments/"),
        ]);

        setCourses(courseResponse.data);
        setTopics(topicResponse.data);
        console.log("Courses API:", courseResponse.data);

        const activeEnrollments = enrollmentResponse.data
          .filter((enrollment) => enrollment.status === "active")
          .map((enrollment) => Number(enrollment.course));

        setEnrolledCourses(activeEnrollments);
      } catch (err) {
        setError("Unable to load courses. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  async function handleJoinCourse(courseId) {
    setJoiningCourse(courseId);
    setError("");
    setSuccess("");

    try {
      await api.post("enrollments/", {
        course: courseId,
      });

      setEnrolledCourses((previous) =>
        previous.includes(Number(courseId))
          ? previous
          : [...previous, Number(courseId)]
      );

      setSuccess("You have successfully joined the course.");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Unable to join this course. Please try again."
      );
      console.error(err);
    } finally {
      setJoiningCourse(null);
    }
  }

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  const selectedTopics = topics.filter(
    (topic) => Number(topic.course) === Number(selectedCourse)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading courses...
      </div>
    );
  }

  return (
    <div className="text-white p-8">
      <div className="max-w-7xl mx-auto">

        <header className="mb-8">
          <p className="text-indigo-400 text-sm font-medium">
            YOUR LEARNING LIBRARY
          </p>

          <h1 className="text-3xl font-bold mt-2">
            Explore Courses
          </h1>

          <p className="text-slate-400 mt-2">
            Discover courses and explore their learning topics.
          </p>
        </header>

        <div className="relative mb-8 max-w-md">
          <Search
            className="absolute left-3 top-3 text-slate-400"
            size={20}
          />

          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-11 pr-4 outline-none focus:border-indigo-500"
          />
        </div>

        {error && (
          <p className="text-red-400 mb-5">{error}</p>
        )}

        {success && (
          <p className="text-green-400 mb-5">{success}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredCourses.map((course) => {
            const courseTopics = topics.filter(
              (topic) =>
                Number(topic.course) === Number(course.course_id)
            );

            const isEnrolled = enrolledCourses.includes(
              Number(course.course_id)
            );

            return (
              <div
                key={course.course_id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-indigo-500 transition"
              >

                <div className="flex justify-between items-start mb-5">
                  <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-lg">
                    <BookOpen size={24} />
                  </div>

                  <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
                    {course.level}
                  </span>
                </div>

                <h2 className="text-xl font-semibold">
                  {course.title}
                </h2>

                <p className="text-slate-400 text-sm mt-3 min-h-12">
                  {course.description || "Explore this learning course."}
                </p>

                <div className="flex items-center gap-2 text-slate-400 text-sm mt-5">
                  <Layers size={16} />
                  {courseTopics.length} Topics
                </div>

                {/* Enrollment Button */}
                <button
                  onClick={() => handleJoinCourse(course.course_id)}
                  disabled={isEnrolled || joiningCourse === course.course_id}
                  className={`w-full mt-5 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    isEnrolled
                      ? "bg-green-600/20 text-green-400 cursor-default"
                      : "bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
                  }`}
                >
                  {isEnrolled ? (
                    <>
                      <CheckCircle size={18} />
                      Enrolled
                    </>
                  ) : joiningCourse === course.course_id ? (
                    "Joining..."
                  ) : (
                    "Join Course"
                  )}
                </button>

                {/* Explore Topics Button */}
                <button
                  onClick={() =>
                    setSelectedCourse(
                      selectedCourse === course.course_id
                        ? null
                        : course.course_id
                    )
                  }
                  className="w-full mt-3 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-lg font-medium transition"
                >
                  {selectedCourse === course.course_id
                    ? "Hide Topics"
                    : "Explore Topics"}
                </button>

                {/* Open Course Button */}
                
                <button
                  onClick={() => navigate(`/courses/${course.course_id}`)}
                  className="w-full mt-3 bg-indigo-600 hover:bg-indigo-500 py-2.5 rounded-lg font-medium transition"
                >
                  Open Course
                </button>

                {selectedCourse === course.course_id && (
                  <div className="mt-5 border-t border-slate-700 pt-4">

                    <h3 className="font-semibold mb-3">
                      Course Topics
                    </h3>

                    {selectedTopics.length > 0 ? (
                      <div className="space-y-3">
                        {selectedTopics.map((topic) => (
                          <div
                            key={topic.topic_id}
                            className="bg-slate-800 p-3 rounded-lg"
                          >
                            <p className="font-medium">
                              {topic.sequence_number}. {topic.title}
                            </p>

                            <p className="text-slate-400 text-sm mt-1">
                              {topic.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">
                        No topics added to this course yet.
                      </p>
                    )}

                  </div>
                )}

              </div>
            );
          })}

        </div>

        {filteredCourses.length === 0 && (
          <p className="text-slate-400 mt-8">
            No matching courses found.
          </p>
        )}

      </div>
    </div>
  );
}

export default Courses;
