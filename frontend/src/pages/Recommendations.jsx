
import { useEffect, useState } from "react";
import { BookOpen, PlayCircle, Brain } from "lucide-react";
import api from "../services/api";
import FeaturedVideo from "../components/FeaturedVideo";

function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [topicMastery, setTopicMastery] = useState([]);
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const [
          recommendationRes,
          resourceRes,
          courseRes,
          topicRes
        ] = await Promise.all([
          api.get("recommendations/"),
          api.get("resources/"),
          api.get("courses/"),
          api.get("topics/")
        ]);

        setRecommendations(
          recommendationRes.data.recommendations || []
        );
        setTopicMastery(
          recommendationRes.data.topic_mastery || []
        );
        setResources(resourceRes.data);
        setCourses(courseRes.data);
        setTopics(topicRes.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load recommendations.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const getCourseName = (courseId) => {
    const course = courses.find(
      (item) => Number(item.course_id) === Number(courseId)
    );

    return course?.title || "Course";
  };

  const getMasteryColor = (level) => {
    switch (level) {
      case "High":
        return "text-green-400 bg-green-400/10";

      case "Medium":
        return "text-yellow-400 bg-yellow-400/10";

      default:
        return "text-red-400 bg-red-400/10";
    }
  };

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

  // Select one valid YouTube video per course
  const featuredVideos = courses
    .map((course) => {
      const courseTopics = topics.filter(
        (topic) => Number(topic.course) === Number(course.course_id)
      );

      const courseTopicIds = courseTopics.map(
        (topic) => Number(topic.topic_id)
      );

      const video = resources.find(
        (resource) =>
          courseTopicIds.includes(Number(resource.topic)) &&
          resource.resource_type?.toLowerCase().includes("video") &&
          getVideoId(resource.url)
      );

      return video
        ? { resource: video, courseName: course.title }
        : null;
    })
    .filter(Boolean);

  if (loading) {
    return (
      <div className="p-8 text-slate-300">
        Loading recommendations...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto text-white">

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Recommendations
        </h1>

        <p className="text-slate-400 mt-2">
          Explore courses and learning resources selected for your learning.
        </p>
      </div>

      {error && (
        <p className="mb-6 text-red-400">{error}</p>
      )}

      {/* Course Recommendations */}

      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <Brain className="text-indigo-400" size={25} />
          <h2 className="text-xl font-semibold">
            Recommended Courses
          </h2>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-5">
            {recommendations.map((item) => (
              <div
                key={item.recommendation_id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="text-indigo-400" />
                  <h3 className="text-lg font-semibold">
                    {getCourseName(item.course)}
                  </h3>
                </div>

                <p className="text-slate-400 text-sm">
                  {item.reason || "Recommended for your learning journey."}
                </p>

                <div className="mt-5">
                  <span className="text-sm text-indigo-400">
                    Suitability Score: {item.suitability_score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 bg-slate-900 p-5 rounded-lg">
            No course recommendations available yet.
          </p>
        )}
      </section>


      {/* AI Topic Mastery Analysis */}

      <section className="mb-12">

        <div className="flex items-center gap-3 mb-5">
          <Brain className="text-indigo-400" size={25} />

          <div>
            <h2 className="text-xl font-semibold">
              AI Topic Mastery Analysis
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Machine learning analysis of your topic performance.
            </p>
          </div>
        </div>

        {topicMastery.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-5">

            {topicMastery.map((item) => (

              <div
                key={item.topic_id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6"
              >

                <div className="flex justify-between items-start gap-3 mb-4">

                  <div>
                    <h3 className="font-semibold text-lg">
                      {item.topic_name}
                    </h3>

                    <p className="text-sm text-slate-400 mt-1">
                      {getCourseName(item.course_id)}
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getMasteryColor(item.mastery_level)}`}>
                    {item.mastery_level} Mastery
                  </span>

                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">

                  <div className="bg-slate-800/70 rounded-lg p-3">
                    <p className="text-xs text-slate-400">
                      Topic Accuracy
                    </p>

                    <p className="text-xl font-bold mt-1">
                      {item.topic_accuracy_pct}%
                    </p>
                  </div>

                  <div className="bg-slate-800/70 rounded-lg p-3">
                    <p className="text-xs text-slate-400">
                      Recent Accuracy
                    </p>

                    <p className="text-xl font-bold mt-1">
                      {item.recent_accuracy_pct}%
                    </p>
                  </div>

                  <div className="bg-slate-800/70 rounded-lg p-3">
                    <p className="text-xs text-slate-400">
                      Questions Attempted
                    </p>

                    <p className="text-xl font-bold mt-1">
                      {item.total_attempts}
                    </p>
                  </div>

                  <div className="bg-slate-800/70 rounded-lg p-3">
                    <p className="text-xs text-slate-400">
                      Model Confidence
                    </p>

                    <p className="text-xl font-bold mt-1">
                      {item.confidence}%
                    </p>
                  </div>

                </div>

                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.mastery_level === "High"
                        ? "bg-green-400"
                        : item.mastery_level === "Medium"
                        ? "bg-yellow-400"
                        : "bg-red-400"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(0, item.topic_accuracy_pct))}%`
                    }}
                  />
                </div>

                <p className="text-xs text-slate-500 mt-3">
                  Average question difficulty: {item.average_difficulty_score}/3
                </p>

              </div>

            ))}

          </div>
        ) : (
          <p className="text-slate-400 bg-slate-900 p-5 rounded-lg">
            Complete some assessments to receive AI-based topic mastery analysis.
          </p>
        )}

      </section>


      {/* Featured Learning Videos */}

      <section>
        <div className="flex items-center gap-3 mb-5">
          <PlayCircle className="text-indigo-400" size={25} />
          <h2 className="text-xl font-semibold">
            Featured Learning Videos
          </h2>
        </div>

        {featuredVideos.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-5">
            {featuredVideos.map(({ resource, courseName }) => (
              <FeaturedVideo
                key={resource.resource_id}
                resource={resource}
                courseName={courseName}
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-400 bg-slate-900 p-5 rounded-lg">
            No embedded videos available yet.
          </p>
        )}
      </section>

    </div>
  );
}

export default Recommendations;
