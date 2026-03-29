import { useEffect, useState } from "react";
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
import { fetchVideoStreamBlob } from "../api/videos.js";
import { ApiError } from "../api/errors.js";

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
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canPlayFlagged && sensitivity === "flagged") {
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setError(null);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      try {
        const blob = await fetchVideoStreamBlob(token, videoId, quality);
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Playback failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [token, videoId, quality, canPlayFlagged, sensitivity]);

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
      {loading && (
        <Box className="flex items-center gap-2">
          <CircularProgress size={24} />
          <Typography variant="body2">Loading video…</Typography>
        </Box>
      )}
      {blobUrl && !loading && (
        <video
          className="w-full max-h-[70vh] rounded bg-black"
          src={blobUrl}
          controls
          playsInline
        />
      )}
      <Typography variant="caption" color="text.secondary">
        Playback loads the full rendition into memory (JWT-authenticated fetch),
        suitable for demos. Large files may be slow.
      </Typography>
    </Box>
  );
};
