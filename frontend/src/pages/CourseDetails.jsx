
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  PlayCircle,
  ClipboardList,
  ExternalLink,
  Clock,
  GraduationCap
} from "lucide-react";
import api from "../services/api";

function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [resources, setResources] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCourseDetails() {
      try {
        const [
          courseResponse,
          topicResponse,
          resourceResponse,
          assessmentResponse
        ] = await Promise.all([
          api.get("courses/"),
          api.get("topics/"),
          api.get("resources/"),
          api.get("assessments/")
        ]);

        const selectedCourse = courseResponse.data.find(
          (item) => Number(item.course_id) === Number(courseId)
        );

        if (!selectedCourse) {
          setError("Course not found.");
          return;
        }

        setCourse(selectedCourse);

        setTopics(
          topicResponse.data
            .filter(
              (topic) =>
                Number(topic.course) === Number(courseId)
            )
            .sort(
              (a, b) =>
                a.sequence_number - b.sequence_number
            )
        );

        setResources(
          resourceResponse.data.filter((resource) =>
            topicResponse.data.some(
              (topic) =>
                Number(topic.topic_id) === Number(resource.topic) &&
                Number(topic.course) === Number(courseId)
            )
          )
        );

        setAssessments(
          assessmentResponse.data.filter(
            (assessment) =>
              Number(assessment.course) === Number(courseId)
          )
        );

      } catch (err) {
        console.error("Unable to load course details:", err);
        setError("Unable to load course details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchCourseDetails();
  }, [courseId]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading course details...
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <p className="text-red-400">
          {error || "Course not found."}
        </p>

        <button
          onClick={() => navigate("/courses")}
          className="mt-5 text-indigo-400"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">

        <button
          onClick={() => navigate("/courses")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8"
        >
          <ArrowLeft size={18} />
          Back to Courses
        </button>

        {/* Course Header */}
        <section className="bg-gradient-to-r from-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-8 mb-10">

          <div className="flex items-center gap-3 text-indigo-400 mb-4">
            <GraduationCap size={24} />
            <span className="text-sm font-semibold">
              COURSE OVERVIEW
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold">
            {course.title}
          </h1>

          <p className="text-slate-300 mt-4 max-w-3xl">
            {course.description || "Explore this learning course."}
          </p>

          <div className="flex flex-wrap gap-4 mt-6 text-sm">

            <span className="bg-slate-800 px-4 py-2 rounded-lg">
              <BookOpen size={16} className="inline mr-2" />
              {topics.length} Topics
            </span>

            <span className="bg-slate-800 px-4 py-2 rounded-lg">
              <PlayCircle size={16} className="inline mr-2" />
              {resources.length} Resources
            </span>

            <span className="bg-slate-800 px-4 py-2 rounded-lg">
              <GraduationCap size={16} className="inline mr-2" />
              {course.level}
            </span>

          </div>
        </section>

        {/* Course Topics */}
        <section className="mb-12">

          <h2 className="text-2xl font-bold mb-6">
            Course Curriculum
          </h2>

          {topics.length > 0 ? (
            <div className="space-y-4">

              {topics.map((topic, index) => {
                const topicResources = resources.filter(
                  (resource) =>
                    Number(resource.topic) === Number(topic.topic_id)
                );

                return (
                  <div
                    key={topic.topic_id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5"
                  >

                    <div className="flex items-start gap-4">

                      <div className="bg-indigo-500/10 text-indigo-400 rounded-lg p-3 font-bold">
                        {topic.sequence_number || index + 1}
                      </div>

                      <div className="flex-1">

                        <h3 className="text-lg font-semibold">
                          {topic.title}
                        </h3>

                        <p className="text-slate-400 text-sm mt-2">
                          {topic.description || "Explore this topic."}
                        </p>

                        <div className="mt-4 space-y-3">

                          {topicResources.map((resource) => {
                            const isPlayable =
                              Boolean(getVideoId(resource.url));

                            return (
                              <div
                                key={resource.resource_id}
                                className="flex flex-wrap items-center justify-between gap-3 bg-slate-800 rounded-lg p-3"
                              >

                                <div className="flex items-center gap-3">
                                  <PlayCircle
                                    size={20}
                                    className="text-indigo-400"
                                  />

                                  <div>
                                    <p className="text-sm font-medium">
                                      {resource.title}
                                    </p>

                                    <p className="text-xs text-slate-400 mt-1">
                                      {resource.resource_type}
                                    </p>
                                  </div>
                                </div>

                                {isPlayable ? (
                                  <button
                                    onClick={() =>
                                      navigate(`/watch/${resource.resource_id}`)
                                    }
                                    className="text-sm text-indigo-400 hover:text-indigo-300"
                                  >
                                    Watch Lesson →
                                  </button>
                                ) : (
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-indigo-400 hover:text-indigo-300"
                                  >
                                    Open Resource
                                    <ExternalLink
                                      size={14}
                                      className="inline ml-1"
                                    />
                                  </a>
                                )}

                              </div>
                            );
                          })}

                          {topicResources.length === 0 && (
                            <p className="text-sm text-slate-500">
                              No resources available for this topic.
                            </p>
                          )}

                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          ) : (
            <p className="text-slate-400">
              No topics available for this course.
            </p>
          )}

        </section>

        {/* Assessments */}
        <section className="mb-12">

          <h2 className="text-2xl font-bold mb-6">
            Course Assessments
          </h2>

          {assessments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {assessments.map((assessment) => (
                <div
                  key={assessment.assessment_id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5"
                >

                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-lg">
                      <ClipboardList size={22} />
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        {assessment.title}
                      </h3>

                      <p className="text-xs text-slate-400 mt-1">
                        {assessment.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock size={16} />
                    Total Marks: {assessment.total_marks}
                  </div>

                  <button
                    onClick={() => navigate("/assessments")}
                    className="w-full mt-5 bg-indigo-600 hover:bg-indigo-500 py-2.5 rounded-lg transition"
                  >
                    View Assessments
                  </button>

                </div>
              ))}

            </div>
          ) : (
            <p className="text-slate-400">
              No assessments available for this course yet.
            </p>
          )}

        </section>

      </div>
    </div>
  );
}

export default CourseDetails;
