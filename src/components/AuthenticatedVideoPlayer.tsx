import { useEffect, useMemo, useState } from "react";
import type { StreamQuality } from "../api/types.js";
import { getVideoStreamUrl } from "../api/videos.js";
import { Alert } from "./ui/alert.js";
import { Spinner } from "./ui/spinner.js";

type Props = {
  token: string;
  videoId: string;
  canPlayFlagged: boolean;
  sensitivity: "safe" | "flagged" | "unknown";
};

export const AuthenticatedVideoPlayer = ({
  token,
  videoId,
  canPlayFlagged,
  sensitivity,
}: Props) => {
  const [quality, setQuality] = useState<StreamQuality>("720");
  const [buffering, setBuffering] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const streamUrl = useMemo(
    () => getVideoStreamUrl(token, videoId, quality),
    [token, videoId, quality],
  );

  useEffect(() => {
    if (!canPlayFlagged && sensitivity === "flagged") {
      setError(null);
      return;
    }
    setBuffering(true);
    setError(null);
  }, [streamUrl, canPlayFlagged, sensitivity]);

  if (!canPlayFlagged && sensitivity === "flagged") {
    return <Alert tone="warning">Flagged content is restricted for viewers.</Alert>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm text-slate-300">
          Quality
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as StreamQuality)}
            className="ml-2 h-9 rounded-lg border border-white/15 bg-white/5 px-2 text-sm outline-none"
          >
            <option value="240">240p</option>
            <option value="480">480p</option>
            <option value="720">720p</option>
          </select>
        </label>
      </div>

      {error && <Alert>{error}</Alert>}
      {buffering && (
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Spinner />
          Buffering...
        </div>
      )}

      <video
        key={streamUrl}
        className="w-full max-h-[70vh] rounded-2xl border border-white/10 bg-black/70"
        src={streamUrl}
        crossOrigin="anonymous"
        controls
        playsInline
        preload="auto"
        onLoadStart={() => {
          setBuffering(true);
          setError(null);
        }}
        onCanPlay={() => setBuffering(false)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onError={() => {
          setBuffering(false);
          setError("Playback failed (network/CORS/session).");
        }}
      />

      <p className="text-xs text-slate-400">
        Browser-native range streaming (206). JWT is passed as access_token for
        the video element URL playback.
      </p>
    </div>
  );
};
