
import { useEffect, useState } from "react";
import { PlayCircle, Clock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import FeaturedVideo from "../components/FeaturedVideo";

function Home() {
  const navigate = useNavigate();

  const [videoProgress, setVideoProgress] = useState([]);
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [resources, setResources] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Home page data
  useEffect(() => {
    async function fetchHomeData() {
      try {
        const results = await Promise.all([
          api.get("courses/"),
          api.get("topics/"),
          api.get("resources/"),
          api.get("video-progress/"),
          api.get("recommendations/"),
        ]);

        setCourses(results[0].data);
        setTopics(results[1].data);
        setResources(results[2].data);
        setVideoProgress(results[3].data);
        setRecommendations(results[4].data.recommendations || []);
      } catch (error) {
        console.error("Unable to load home content:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHomeData();
  }, []);

  // Extract YouTube video ID
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

  // Select featured videos from different courses
  const featuredVideos = courses
    .map((course) => {
      const courseTopicIds = topics
        .filter(
          (topic) =>
            Number(topic.course) === Number(course.course_id)
        )
        .map((topic) => Number(topic.topic_id));

      const resource = resources.find(
        (item) =>
          courseTopicIds.includes(Number(item.topic)) &&
          item.resource_type?.toLowerCase().includes("video") &&
          getVideoId(item.url)
      );

      return resource
        ? { resource, courseName: course.title }
        : null;
    })
    .filter(Boolean);
  

  // Get details of watched videos
  const getVideoDetails = (progress) => {
    const resource = resources.find(
      (item) =>
        Number(item.resource_id) === Number(progress.resource)
    );

    if (!resource) return null;

    const topic = topics.find(
      (item) => Number(item.topic_id) === Number(resource.topic)
    );

    const course = courses.find(
      (item) => Number(item.course_id) === Number(topic?.course)
    );

    return {
      ...progress,
      resource,
      courseName: course?.title || "LearnSmart",
    };
  };

  const watchedVideos = videoProgress
    .map(getVideoDetails)
    .filter(Boolean);

  // Continue Watching
  const continueWatching = watchedVideos.filter(
    (item) =>
      !item.completed && item.last_position_seconds > 0
  );

  // Recently Watched
  const recentlyWatched = watchedVideos;

  // Generate recommended videos from weak topics
  const recommendedVideos = recommendations.flatMap(
  (recommendation) => {
    const weakTopics = recommendation.weak_topics || [];

    return weakTopics.flatMap((weakTopic) => {
      const topic = topics.find(
        (item) =>
          Number(item.topic_id) === Number(weakTopic.topic_id)
      );

      const course = courses.find(
        (item) =>
          Number(item.course_id) === Number(topic?.course)
      );

      return resources
        .filter(
          (resource) =>
            Number(resource.topic) === Number(weakTopic.topic_id) &&
            resource.resource_type?.toLowerCase().includes("video") &&
            getVideoId(resource.url)
        )
        .map((resource) => ({
          resource,
          topicName: weakTopic.topic_name,
          courseName: course?.title || "LearnSmart",
          reason: recommendation.reason,
        }));
    });
  }
);

  if (loading) {
    return (
      <div className="p-8 text-white">
        Loading learning content...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      <h1 className="text-3xl font-bold">
        Your Learning Space
      </h1>

      <p className="text-slate-400 mt-2">
        Discover something new and continue learning.
      </p>

      {/* Continue Watching */}
      <section className="mt-10">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-5">
          <Clock className="text-indigo-400" />
          Continue Watching
        </h2>

        {continueWatching.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {continueWatching.map((item) => {
              const percentage = item.duration_seconds > 0
                ? Math.min(
                    100,
                    Math.round(
                      (item.last_position_seconds /
                        item.duration_seconds) * 100
                    )
                  )
                : 0;

              return (
                <button
                  key={item.video_progress_id}
                  onClick={() =>
                    navigate(`/watch/${item.resource.resource_id}`)
                  }
                  className="text-left bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-indigo-500 transition"
                >
                  <h3 className="font-semibold">
                    {item.resource.title}
                  </h3>

                  <p className="text-sm text-indigo-400 mt-1">
                    {item.courseName}
                  </p>

                  <div className="w-full bg-slate-700 rounded-full h-2 mt-4">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    {percentage}% completed
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500">
            No videos in progress yet. Start watching a lesson!
          </p>
        )}
      </section>

      {/* Recommended Videos */}
      <section className="mt-10">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-5">
          <Sparkles className="text-indigo-400" />
          Recommended Videos
        </h2>

        {recommendedVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedVideos.map(
              ({ resource, topicName, courseName, reason }) => (
                <button
                  key={resource.resource_id}
                  onClick={() =>
                    navigate(`/watch/${resource.resource_id}`)
                  }
                  className="text-left bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-indigo-500 transition"
                >
                  <h3 className="font-semibold">
                    {resource.title}
                  </h3>

                  <p className="text-sm text-indigo-400 mt-1">
                    {courseName} . {topicName}
                  </p>

                  <p className="text-sm text-indigo-400 mt-1">
                    Weak topic: {topicName}
                  </p>

                  <p className="text-xs text-slate-400 mt-3">
                    {reason}
                  </p>

                  <p className="text-sm text-indigo-300 mt-4">
                    Watch lesson →
                  </p>
                </button>
              )
            )}
          </div>
        ) : (
          <p className="text-slate-500">
            No personalised recommendations available yet.
            Complete an assessment to receive recommendations.
          </p>
        )}
      </section>

      {/* Featured Videos */}
      <section className="mt-10">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-5">
          <PlayCircle className="text-indigo-400" />
          Featured Videos
        </h2>

        {featuredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredVideos.map(({ resource, courseName }) => (
              <FeaturedVideo
                key={resource.resource_id}
                resource={resource}
                courseName={courseName}
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-500">
            No featured videos available.
          </p>
        )}
      </section>

      {/* Recently Watched */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-5">
          Recently Watched
        </h2>

        {recentlyWatched.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentlyWatched.slice(0, 6).map((item) => (
              <button
                key={item.video_progress_id}
                onClick={() =>
                  navigate(`/watch/${item.resource.resource_id}`)
                }
                className="text-left bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-indigo-500 transition"
              >
                <h3 className="font-medium">
                  {item.resource.title}
                </h3>

                <p className="text-sm text-indigo-400 mt-1">
                  {item.courseName}
                </p>

                <p className="text-xs text-slate-500 mt-2">
                  {item.completed ? "Completed" : "In progress"}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">
            Your viewing history will appear here.
          </p>
        )}
      </section>

    </div>
  );
}

export default Home;
