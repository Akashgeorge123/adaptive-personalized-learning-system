
import { useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import { PlayCircle, ListVideo } from "lucide-react";
import api from "../services/api";

function VideoPlayer({
  resource,
  courseName,
  relatedVideos = [],
  onSelectVideo,
}) {
  const playerRef = useRef(null);
  const timerRef = useRef(null);

  const [initialPosition, setInitialPosition] = useState(0);
  const [historyLoaded, setHistoryLoaded] = useState(false);

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

  const videoId = resource ? getVideoId(resource.url) : null;

  // Load previously saved playback position
  useEffect(() => {
    let active = true;

    async function loadProgress() {
      try {
        const response = await api.get("video-progress/");

        const savedProgress = response.data.find(
          (item) =>
            Number(item.resource) === Number(resource.resource_id)
        );

        if (active && savedProgress) {
          setInitialPosition(
            savedProgress.completed
              ? 0
              : savedProgress.last_position_seconds
          );
        }
      } catch (error) {
        console.error("Unable to load playback history:", error);
      } finally {
        if (active) setHistoryLoaded(true);
      }
    }

    setHistoryLoaded(false);
    setInitialPosition(0);
    loadProgress();

    return () => {
      active = false;
    };
  }, [resource.resource_id]);

  // Save playback progress to Django
  const saveProgress = async (completed = false) => {
    const player = playerRef.current;

    if (!player) return;

    try {
      const position = Math.floor(player.getCurrentTime() || 0);
      const duration = Math.floor(player.getDuration() || 0);

      await api.post("video-progress/", {
        resource: Number(resource.resource_id),
        last_position_seconds: position,
        duration_seconds: duration,
        completed,
      });
    } catch (error) {
      console.error("Unable to save playback progress:", error);
    }
  };

  const onReady = (event) => {
    playerRef.current = event.target;
  };

  const onStateChange = (event) => {
    // YouTube state 1 means playing
    if (event.data === 1) {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          saveProgress();
        }, 10000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Save when paused or ended
      if (event.data === 2 || event.data === 0) {
        saveProgress(event.data === 0);
      }
    }
  };

  // Stop timer and save when leaving the video
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const player = playerRef.current;

      if (player) {
        api.post("video-progress/", {
          resource: Number(resource.resource_id),
          last_position_seconds: Math.floor(
            player.getCurrentTime() || 0
          ),
          duration_seconds: Math.floor(
            player.getDuration() || 0
          ),
          completed: false,
        }).catch((error) => {
          console.error("Unable to save final progress:", error);
        });
      }
    };
  }, [resource.resource_id]);

  if (!resource || !videoId) {
    return <div className="text-white p-8">Video not found.</div>;
  }

  if (!historyLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading video...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <header className="h-16 border-b border-slate-800 px-6 flex items-center">
        <h1 className="text-2xl font-bold text-indigo-400">
          LearnSmart
        </h1>
        <span className="text-slate-500 ml-4 text-sm">
          Video Learning
        </span>
      </header>

      <main className="max-w-[1500px] mx-auto p-5 lg:p-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <section className="lg:col-span-2">

            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              <YouTube
                videoId={videoId}
                className="w-full h-full"
                iframeClassName="w-full h-full"
                opts={{
                  width: "100%",
                  height: "100%",
                  playerVars: {
                    autoplay: 0,
                    rel: 0,
                    start: Math.floor(initialPosition),
                  },
                }}
                onReady={onReady}
                onStateChange={onStateChange}
              />
            </div>

            <div className="mt-6">

              <h2 className="text-2xl font-bold">
                {resource.title}
              </h2>

              <p className="text-indigo-400 mt-2">
                {courseName}
              </p>

              <div className="flex items-center gap-2 text-slate-400 text-sm mt-4">
                <PlayCircle size={17} />
                Learning Resource
              </div>

              <div className="bg-slate-900 rounded-xl p-5 mt-6">
                <h3 className="font-semibold mb-2">
                  About this lesson
                </h3>

                <p className="text-slate-400 text-sm leading-6">
                  Watch this lesson to strengthen your understanding
                  of the topic. Take notes and practise what you learn.
                </p>
              </div>

              {initialPosition > 0 && (
                <p className="text-sm text-green-400 mt-4">
                  Your previous playback position: {initialPosition} seconds
                </p>
              )}

            </div>
          </section>

          <aside>

            <div className="flex items-center gap-2 mb-5">
              <ListVideo className="text-indigo-400" />
              <h3 className="text-lg font-bold">
                Related Videos
              </h3>
            </div>

            <div className="space-y-4">

              {relatedVideos.length > 0 ? (
                relatedVideos.map((item) => {
                  const relatedId = getVideoId(item.url);

                  if (!relatedId) return null;

                  return (
                    <button
                      key={item.resource_id}
                      onClick={() => onSelectVideo?.(item)}
                      className="w-full flex gap-3 text-left group"
                    >
                      <div className="w-36 shrink-0 aspect-video rounded-lg overflow-hidden bg-slate-800">
                        <img
                          src={`https://img.youtube.com/vi/${relatedId}/mqdefault.jpg`}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-medium line-clamp-2 group-hover:text-indigo-400">
                          {item.title}
                        </h4>

                        <p className="text-xs text-slate-500 mt-2">
                          {item.courseName || "LearnSmart"}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500">
                  No related videos available.
                </p>
              )}

            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}

export default VideoPlayer;
