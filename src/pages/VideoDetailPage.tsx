import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import * as videosApi from "../api/videos.js";
import type { Video, VideoShare } from "../api/types.js";
import { useAuth } from "../contexts/AuthContext.js";
import { AuthenticatedVideoPlayer } from "../components/AuthenticatedVideoPlayer.js";
import { ApiError } from "../api/errors.js";

export const VideoDetailPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [shares, setShares] = useState<VideoShare[]>([]);
  const [shareUserId, setShareUserId] = useState("");
  const [shareBusy, setShareBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !videoId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [videoRes, sharesRes] = await Promise.all([
          videosApi.getVideo(token, videoId),
          user?.role === "viewer"
            ? Promise.resolve({ shares: [] as VideoShare[] })
            : videosApi.listVideoShares(token, videoId),
        ]);
        if (!cancelled) {
          setVideo(videoRes.video);
          setShares(sharesRes.shares);
        }
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
  }, [token, videoId, user?.role]);

  const canPlayFlagged = user?.role !== "viewer";
  const canManageShares = user?.role === "editor" || user?.role === "admin";
  const canDeleteVideo = user?.role === "editor" || user?.role === "admin";

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

  const onCreateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !videoId || !shareUserId.trim()) return;
    setShareBusy(true);
    setError(null);
    try {
      const res = await videosApi.createVideoShare(token, videoId, shareUserId.trim());
      setShares((prev) => [res.share, ...prev]);
      setShareUserId("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to share video");
    } finally {
      setShareBusy(false);
    }
  };

  const onDeleteShare = async (shareId: string) => {
    if (!token || !videoId) return;
    setShareBusy(true);
    setError(null);
    try {
      await videosApi.deleteVideoShare(token, videoId, shareId);
      setShares((prev) => prev.filter((s) => s.shareId !== shareId));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to revoke share");
    } finally {
      setShareBusy(false);
    }
  };

  const onDeleteVideo = async () => {
    if (!token || !videoId) return;
    const ok = window.confirm(
      "Delete this video permanently? This also removes stored files and all sharing assignments.",
    );
    if (!ok) return;
    setDeleteBusy(true);
    setError(null);
    try {
      await videosApi.deleteVideo(token, videoId);
      navigate("/", { replace: true });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete video");
    } finally {
      setDeleteBusy(false);
    }
  };

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
        {canDeleteVideo && (
          <Button
            color="error"
            variant="outlined"
            disabled={deleteBusy || shareBusy}
            onClick={() => void onDeleteVideo()}
          >
            {deleteBusy ? "Deleting..." : "Delete video"}
          </Button>
        )}
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
      {canManageShares && (
        <Paper className="p-4 space-y-3">
          <Typography variant="h6" component="h2">
            Sharing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Share this video with a viewer by user ID.
          </Typography>
          <Box component="form" onSubmit={onCreateShare} className="flex gap-2">
            <TextField
              size="small"
              fullWidth
              label="Viewer user ID"
              value={shareUserId}
              disabled={shareBusy}
              onChange={(e) => setShareUserId(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={shareBusy || !shareUserId.trim()}
            >
              Share
            </Button>
          </Box>
          {shares.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No active shares.
            </Typography>
          ) : (
            <List dense disablePadding>
              {shares.map((share) => (
                <ListItem
                  key={share.shareId}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="revoke share"
                      disabled={shareBusy}
                      onClick={() => void onDeleteShare(share.shareId)}
                    >
                      <Typography variant="button">X</Typography>
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={share.sharedWithUserId}
                    secondary={`shared by ${share.sharedByUserId}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}
    </Box>
  );
};
