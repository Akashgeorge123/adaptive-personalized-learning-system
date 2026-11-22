
import { PlayCircle, ExternalLink } from "lucide-react";

function FeaturedVideo({ resource, courseName }) {
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

  const videoId = getVideoId(resource.url);

  if (!videoId) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <a
        href={`/watch/${resource.resource_id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative aspect-video group"
      >
        <img
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt={resource.title}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition">
          <PlayCircle size={60} className="text-white" />
        </div>

        <span className="absolute bottom-3 right-3 bg-black/70 px-3 py-2 rounded-lg text-xs text-white flex items-center gap-2">
          Watch video
          <ExternalLink size={14} />
        </span>
      </a>

      <div className="p-4">
        <p className="text-xs text-indigo-400 mb-2">
          {courseName}
        </p>

        <h3 className="font-semibold text-white">
          {resource.title}
        </h3>
      </div>
    </div>
  );
}

export default FeaturedVideo;
