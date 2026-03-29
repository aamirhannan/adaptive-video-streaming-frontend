import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import type { StreamQuality } from "../api/types.js";
import { getVideoStreamUrl } from "../api/videos.js";

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
    return (
      <Alert severity="warning">
        Flagged content cannot be streamed with a viewer role.
      </Alert>
    );
  }

  return (
    <Box className="space-y-2">
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Quality</InputLabel>
        <Select
          label="Quality"
          value={quality}
          onChange={(e) => setQuality(e.target.value as StreamQuality)}
        >
          <MenuItem value="240">240p</MenuItem>
          <MenuItem value="480">480p</MenuItem>
          <MenuItem value="720">720p</MenuItem>
        </Select>
      </FormControl>
      {error && <Alert severity="error">{error}</Alert>}
      {buffering && (
        <Box className="flex items-center gap-2">
          <CircularProgress size={24} />
          <Typography variant="body2">Buffering…</Typography>
        </Box>
      )}
      <video
        key={streamUrl}
        className="w-full max-h-[70vh] rounded bg-black"
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
          setError(
            "Playback failed (check network, CORS, or an expired session).",
          );
        }}
      />
      <Typography variant="caption" color="text.secondary">
        Playback uses the browser’s native stack: it issues HTTP Range requests
        (typically 206 Partial Content) for incremental buffering. The JWT is in
        the query as access_token because a video element cannot send an
        Authorization header.
      </Typography>
    </Box>
  );
};
