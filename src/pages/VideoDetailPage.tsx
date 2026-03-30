import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as videosApi from "../api/videos.js";
import type { Video, VideoShare } from "../api/types.js";
import { useAuth } from "../contexts/AuthContext.js";
import { AuthenticatedVideoPlayer } from "../components/AuthenticatedVideoPlayer.js";
import { ApiError } from "../api/errors.js";
import { Alert } from "../components/ui/alert.js";
import { Badge } from "../components/ui/badge.js";
import { Button } from "../components/ui/button.js";
import { Card } from "../components/ui/card.js";
import { Input } from "../components/ui/input.js";

export const VideoDetailPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [shares, setShares] = useState<VideoShare[]>([]);
  const [shareTarget, setShareTarget] = useState("");
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

  if (!videoId) return <Alert>Missing video id</Alert>;
  if (loading) return <div className="text-sm text-slate-400">Loading video...</div>;
  if (error || !video)
    return (
      <Alert>
        {error ?? "Not found"}{" "}
        <Link to="/" className="underline underline-offset-4">
          Back
        </Link>
      </Alert>
    );

  const readyToStream =
    video.status !== "uploaded" &&
    video.status !== "processing" &&
    video.status !== "failed";

  const onCreateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !videoId || !shareTarget.trim()) return;
    setShareBusy(true);
    setError(null);
    try {
      const res = await videosApi.createVideoShare(token, videoId, shareTarget.trim());
      setShares((prev) => [res.share, ...prev]);
      setShareTarget("");
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
      "Delete this video permanently? This removes stored files and all shares.",
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
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        Back
      </Button>

      <Card className="space-y-3">
        <h1 className="text-2xl font-semibold">{video.originalName}</h1>
        <div className="flex flex-wrap gap-2">
          <Badge label={`status: ${video.status}`} />
          <Badge
            label={`sensitivity: ${video.sensitivity}`}
            tone={video.sensitivity === "safe" ? "safe" : video.sensitivity === "flagged" ? "warn" : "neutral"}
          />
          {canDeleteVideo && (
            <Button
              variant="danger"
              size="sm"
              disabled={deleteBusy || shareBusy}
              onClick={() => void onDeleteVideo()}
            >
              {deleteBusy ? "Deleting..." : "Delete video"}
            </Button>
          )}
        </div>
        {video.analysisSummary && (
          <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
            {video.analysisSummary}
          </p>
        )}
        {video.variants && video.variants.length > 0 && (
          <p className="text-xs text-slate-400">
            Variants:{" "}
            {video.variants
              .map((v) => `${v.quality}p (${(v.sizeBytes / 1024).toFixed(0)} KB)`)
              .join(", ")}
          </p>
        )}
      </Card>

      {error && <Alert>{error}</Alert>}

      {readyToStream && token ? (
        <AuthenticatedVideoPlayer
          token={token}
          videoId={video.videoId}
          canPlayFlagged={canPlayFlagged}
          sensitivity={video.sensitivity}
        />
      ) : (
        <Alert tone="info">Video is not ready for playback (status: {video.status}).</Alert>
      )}

      {canManageShares && (
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold">Sharing</h2>
          <p className="text-sm text-slate-400">
            Share this video with a viewer by user ID or email.
          </p>
          <form onSubmit={onCreateShare} className="flex flex-wrap gap-2">
            <Input
              value={shareTarget}
              disabled={shareBusy}
              onChange={(e) => setShareTarget(e.target.value)}
              placeholder="Viewer user ID or email"
            />
            <Button type="submit" disabled={shareBusy || !shareTarget.trim()}>
              Share
            </Button>
          </form>
          {shares.length === 0 ? (
            <p className="text-sm text-slate-400">No active shares.</p>
          ) : (
            <div className="space-y-2">
              {shares.map((share) => (
                <div
                  key={share.shareId}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2.5"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm">{share.sharedWithUserId}</div>
                    <div className="text-xs text-slate-400">
                      shared by {share.sharedByUserId}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={shareBusy}
                    onClick={() => void onDeleteShare(share.shareId)}
                  >
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
