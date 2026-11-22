
import { useEffect, useState } from "react";
import {
  Brain,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  PlayCircle,
  RefreshCw,
  Route,
  ExternalLink
} from "lucide-react";
import api from "../services/api";

function LearningPaths() {
  const [paths, setPaths] = useState([]);
  const [items, setItems] = useState([]);
  const [progress, setProgress] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchLearningPaths = async () => {
    try {
      const [
        pathRes,
        itemRes,
        progressRes,
        resourceRes
      ] = await Promise.all([
        api.get("paths/"),
        api.get("learning-path-items/"),
        api.get("progress/"),
        api.get("resources/")
      ]);

      setPaths(pathRes.data);
      setItems(itemRes.data);
      setProgress(progressRes.data);
      setResources(resourceRes.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load learning paths.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  const generatePath = async () => {
    try {
      setGenerating(true);
      setError("");
      setMessage("");

      const response = await api.post("paths/generate/");

      setMessage(response.data.message);
      await fetchLearningPaths();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
        "Unable to generate learning paths."
      );
    } finally {
      setGenerating(false);
    }
  };

  const updateProgress = async (progressId, newStatus) => {
    try {
      setUpdating(progressId);
      setError("");

      await api.patch(`progress/${progressId}/`, {
        completion_status: newStatus
      });

      await fetchLearningPaths();
    } catch (err) {
      console.error(err);
      setError("Unable to update topic progress.");
    } finally {
      setUpdating(null);
    }
  };

  const getPathProgress = (pathId) => {
    const pathProgress = progress.filter(
      (item) =>
        items.some(
          (pathItem) =>
            Number(pathItem.item_id) === Number(item.item) &&
            Number(pathItem.path) === Number(pathId)
        )
    );

    if (pathProgress.length === 0) return 0;

    const completed = pathProgress.filter(
      (item) => item.completion_status === "completed"
    ).length;

    return Math.round(
      (completed / pathProgress.length) * 100
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-400/10";

      case "in progress":
        return "text-yellow-400 bg-yellow-400/10";

      default:
        return "text-slate-400 bg-slate-700";
    }
  };

  const getTopicResources = (topicId) => {
    return resources.filter(
      (resource) =>
        Number(resource.topic) === Number(topicId)
    );
  };

  const getResourceLink = (resource) => {
    if (resource.resource_type?.toLowerCase().includes("video")) {
      return `/watch/${resource.resource_id}`;
    }

    return resource.url;
  };

  if (loading) {
    return (
      <div className="p-8 text-slate-300">
        Loading learning paths...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 text-white">

      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

        <div>
          <h1 className="text-3xl font-bold">
            Personalized Learning Paths
          </h1>

          <p className="text-slate-400 mt-2">
            Follow your AI-generated study plan and improve your weak topics.
          </p>
        </div>

        <button
          onClick={generatePath}
          disabled={generating}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-5 py-3 rounded-lg font-medium transition"
        >
          {generating ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <Brain size={18} />
          )}

          {generating ? "Generating..." : "Generate Learning Path"}
        </button>

      </div>

      {/* Messages */}

      {error && (
        <p className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-5">
          {error}
        </p>
      )}

      {message && (
        <p className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg mb-5">
          {message}
        </p>
      )}

      {/* Empty State */}

      {paths.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center">

          <Brain size={45} className="text-indigo-400 mx-auto mb-4" />

          <h2 className="text-xl font-semibold mb-2">
            No Learning Paths Yet
          </h2>

          <p className="text-slate-400 max-w-lg mx-auto">
            Complete assessments to help the machine learning model
            identify topics that need improvement. Then generate your
            personalized learning path.
          </p>

        </div>
      ) : (

        <div className="space-y-8">

          {paths.map((path) => {

            const pathItems = items
              .filter(
                (item) =>
                  Number(item.path) === Number(path.path_id)
              )
              .sort(
                (a, b) =>
                  a.sequence_number - b.sequence_number
              );

            const percentage = getPathProgress(path.path_id);

            return (

              <section
                key={path.path_id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6"
              >

                {/* Path Header */}

                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Route className="text-indigo-400" size={23} />

                      <h2 className="text-xl font-semibold">
                        {path.title}
                      </h2>
                    </div>

                    <p className="text-sm text-slate-400">
                      {path.description}
                    </p>
                  </div>

                  <span className="text-xs px-3 py-2 rounded-full bg-indigo-500/10 text-indigo-400">
                    {path.status}
                  </span>

                </div>

                {/* Progress */}

                <div className="mb-7">

                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">
                      Overall Progress
                    </span>

                    <span className="font-semibold text-indigo-400">
                      {percentage}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                </div>

                {/* Topics */}

                <div className="space-y-4">

                  <h3 className="font-semibold flex items-center gap-2">
                    <BookOpen size={18} className="text-indigo-400" />
                    Topics to Study
                  </h3>

                  {pathItems.length > 0 ? (

                    pathItems.map((item) => {

                      const topicProgress = progress.find(
                        (record) =>
                          Number(record.item) === Number(item.item_id)
                      );

                      const status =
                        topicProgress?.completion_status || "not started";

                      const topicResources = getTopicResources(
                        item.topic
                      );

                      return (

                        <div
                          key={item.item_id}
                          className="bg-slate-800/60 border border-slate-700 rounded-lg p-5"
                        >

                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

                            <div className="flex items-start gap-3">

                              {status === "completed" ? (
                                <CheckCircle2
                                  className="text-green-400 mt-1"
                                  size={21}
                                />
                              ) : status === "in progress" ? (
                                <Clock
                                  className="text-yellow-400 mt-1"
                                  size={21}
                                />
                              ) : (
                                <Circle
                                  className="text-slate-500 mt-1"
                                  size={21}
                                />
                              )}

                              <div>
                                <p className="text-xs text-slate-500 mb-1">
                                  STEP {item.sequence_number}
                                </p>

                                <h4 className="font-semibold">
                                  {item.topic_title}
                                </h4>

                                <p className="text-sm text-slate-400 mt-1">
                                  {item.course_title}
                                </p>
                              </div>

                            </div>

                            <div className="flex flex-wrap items-center gap-3">

                              <span
                                className={`text-xs px-3 py-2 rounded-full ${getStatusColor(status)}`}
                              >
                                {status}
                              </span>

                              {topicProgress && (
                                <select
                                  value={status}
                                  disabled={updating === topicProgress.progress_id}
                                  onChange={(e) =>
                                    updateProgress(
                                      topicProgress.progress_id,
                                      e.target.value
                                    )
                                  }
                                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                                >
                                  <option value="not started">
                                    Not Started
                                  </option>

                                  <option value="in progress">
                                    In Progress
                                  </option>

                                  <option value="completed">
                                    Completed
                                  </option>
                                </select>
                              )}

                            </div>

                          </div>

                          {/* Resources */}

                          {topicResources.length > 0 && (

                            <div className="mt-5 pt-4 border-t border-slate-700">

                              <p className="text-xs text-slate-400 mb-3">
                                Recommended Learning Resources
                              </p>

                              <div className="space-y-2">

                                {topicResources.map((resource) => {

                                  const link = getResourceLink(resource);

                                  return (

                                    <a
                                      key={resource.resource_id}
                                      href={link}
                                      target={
                                        resource.resource_type?.toLowerCase().includes("video")
                                          ? "_self"
                                          : "_blank"
                                      }
                                      rel="noreferrer"
                                      className="flex items-center gap-3 text-sm text-indigo-400 hover:text-indigo-300"
                                    >

                                      {resource.resource_type?.toLowerCase().includes("video") ? (
                                        <PlayCircle size={17} />
                                      ) : (
                                        <ExternalLink size={17} />
                                      )}

                                      <span>
                                        {resource.title}
                                      </span>

                                    </a>

                                  );
                                })}

                              </div>

                            </div>

                          )}

                        </div>

                      );

                    })

                  ) : (

                    <p className="text-slate-400 text-sm">
                      No topics have been added to this path yet.
                    </p>

                  )}

                </div>

              </section>

            );

          })}

        </div>

      )}

    </div>
  );
}

export default LearningPaths;
