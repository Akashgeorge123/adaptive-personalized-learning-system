
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import api from "../services/api";
import VideoPlayer from "../components/VideoPlayer";

function Watch() {
  const { resourceId } = useParams();
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [topics, setTopics] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  

useEffect(() => {
  async function fetchVideoData() {
    try {
      setLoading(true);
      setError("");

      const [resourceResponse, topicResponse, courseResponse] =
        await Promise.all([
          api.get("resources/"),
          api.get("topics/"),
          api.get("courses/"),
        ]);

      setResources(resourceResponse.data);
      setTopics(topicResponse.data);
      setCourses(courseResponse.data);

    } catch (err) {
      console.error("Watch page error:", err);

      setError(
        err.response?.data?.error ||
        err.message ||
        "Unable to load video."
      );
    } finally {
      setLoading(false);
    }
  }

  fetchVideoData();
}, []);



  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading video...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-red-400 flex items-center justify-center">
        {error}
      </div>
    );
  }

  const resource = resources.find(
    (item) => Number(item.resource_id) === Number(resourceId)
  );

  if (!resource) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        Video not found.
      </div>
    );
  }

  const topic = topics.find(
    (item) => Number(item.topic_id) === Number(resource.topic)
  );

  const course = courses.find(
    (item) => Number(item.course_id) === Number(topic?.course)
  );

  const relatedVideos = resources
    .filter((item) => {
      if (Number(item.resource_id) === Number(resourceId)) {
        return false;
      }

      if (!item.resource_type?.toLowerCase().includes("video")) {
        return false;
      }

      const itemTopic = topics.find(
        (t) => Number(t.topic_id) === Number(item.topic)
      );

      return (
        Number(itemTopic?.course) === Number(topic?.course) &&
        Boolean(itemTopic)
      );
    })
    .map((item) => ({
      ...item,
      courseName: course?.title || "LearnSmart",
    }));

  return (
    <VideoPlayer
      resource={resource}
      courseName={course?.title || "LearnSmart"}
      relatedVideos={relatedVideos}
      onSelectVideo={(item) =>
        navigate(`/watch/${item.resource_id}`)
      }
    />
  );
}

export default Watch;
