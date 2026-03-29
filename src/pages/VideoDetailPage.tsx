import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import * as videosApi from "../api/videos.js";
import type { Video } from "../api/types.js";
import { useAuth } from "../contexts/AuthContext.js";
import { AuthenticatedVideoPlayer } from "../components/AuthenticatedVideoPlayer.js";
import { ApiError } from "../api/errors.js";

export const VideoDetailPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const { token, user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !videoId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await videosApi.getVideo(token, videoId);
        if (!cancelled) setVideo(res.video);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Failed to load video");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, videoId]);

  const canPlayFlagged = user?.role !== "viewer";

  if (!videoId) {
    return <Alert severity="error">Missing video id</Alert>;
  }

  if (loading) {
    return <LinearProgress />;
  }

  if (error || !video) {
    return (
      <Alert severity="error">
        {error ?? "Not found"}{" "}
        <Button component={RouterLink} to="/">
          Back
        </Button>
      </Alert>
    );
  }

  const readyToStream =
    video.status !== "uploaded" &&
    video.status !== "processing" &&
    video.status !== "failed";

  return (
    <Box className="space-y-4">
      <Button component={RouterLink} to="/" variant="text">
        ← Library
      </Button>
      <Typography variant="h4" component="h1">
        {video.originalName}
      </Typography>
      <Box className="flex flex-wrap gap-2">
        <Chip label={`status: ${video.status}`} />
        <Chip label={`sensitivity: ${video.sensitivity}`} />
      </Box>
      {video.analysisSummary && (
        <Paper className="p-3">
          <Typography variant="subtitle2" color="text.secondary">
            Analysis
          </Typography>
          <Typography variant="body2" className="break-all">
            {video.analysisSummary}
          </Typography>
        </Paper>
      )}
      {video.variants && video.variants.length > 0 && (
        <Typography variant="body2" color="text.secondary">
          Variants:{" "}
          {video.variants.map((v) => `${v.quality}p (${(v.sizeBytes / 1024).toFixed(0)} KB)`).join(", ")}
        </Typography>
      )}
      {readyToStream && token ? (
        <AuthenticatedVideoPlayer
          token={token}
          videoId={video.videoId}
          canPlayFlagged={canPlayFlagged}
          sensitivity={video.sensitivity}
        />
      ) : (
        <Alert severity="info">
          Video is not ready for playback yet (status: {video.status}).
        </Alert>
      )}
    </Box>
  );
};
