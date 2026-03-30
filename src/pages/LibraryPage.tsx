import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../api/errors.js";
import type { Sensitivity, Video, VideoStatus } from "../api/types.js";
import * as videosApi from "../api/videos.js";
import { Alert } from "../components/ui/alert.js";
import { Badge } from "../components/ui/badge.js";
import { Button } from "../components/ui/button.js";
import { Card } from "../components/ui/card.js";
import { useAuth } from "../contexts/AuthContext.js";
import { useVideoProgress } from "../contexts/VideoProgressContext.js";

const statusOptions: (VideoStatus | "")[] = [
  "",
  "uploaded",
  "processing",
  "ready",
  "flagged",
  "failed",
];
const sensitivityOptions: (Sensitivity | "")[] = ["", "safe", "flagged", "unknown"];

export const LibraryPage = () => {
  const { token } = useAuth();
  const { byVideoId } = useVideoProgress();
  const [list, setList] = useState<Video[]>([]);
  const [statusFilter, setStatusFilter] = useState<VideoStatus | "">("");
  const [sensitivityFilter, setSensitivityFilter] = useState<Sensitivity | "">("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      const params: videosApi.ListVideosParams = {};
      if (statusFilter) params.status = statusFilter;
      if (sensitivityFilter) params.sensitivity = sensitivityFilter;
      const res = await videosApi.listVideos(token, params);
      setList(res.videos);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, sensitivityFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const mergedRows = list.map((v) => {
    const live = byVideoId[v.videoId];
    const progress = live?.progress ?? (typeof v.progress === "number" ? v.progress : 0);
    const status = (live?.status as Video["status"]) ?? v.status;
    return { ...v, displayProgress: progress, displayStatus: status };
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Video library</h1>
        <p className="mt-1 text-sm text-slate-400">
          Review uploads, processing state, and open any accessible video.
        </p>
      </div>

      {error && <Alert>{error}</Alert>}

      <Card className="p-3">
        <div className="flex flex-wrap gap-2">
          <select
            className="h-10 min-w-36 rounded-xl border border-white/15 bg-white/5 px-3 text-sm outline-none focus:border-violet-400/50"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as VideoStatus | "")}
          >
            {statusOptions.map((v) => (
              <option key={v || "all"} value={v}>
                {v || "All status"}
              </option>
            ))}
          </select>
          <select
            className="h-10 min-w-36 rounded-xl border border-white/15 bg-white/5 px-3 text-sm outline-none focus:border-violet-400/50"
            value={sensitivityFilter}
            onChange={(e) => setSensitivityFilter(e.target.value as Sensitivity | "")}
          >
            {sensitivityOptions.map((v) => (
              <option key={v || "all"} value={v}>
                {v || "All sensitivity"}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={() => void load()}>
            Refresh
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-300">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Sensitivity</th>
                <th className="px-4 py-3 font-medium">Progress</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={6}>
                    Loading videos...
                  </td>
                </tr>
              ) : mergedRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={6}>
                    No videos found for the selected filters.
                  </td>
                </tr>
              ) : (
                mergedRows.map((row, idx) => (
                  <motion.tr
                    key={row.videoId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="border-b border-white/8 text-slate-200 last:border-none hover:bg-white/5"
                  >
                    <td className="max-w-[28rem] truncate px-4 py-3">{row.originalName}</td>
                    <td className="px-4 py-3">
                      <Badge
                        label={row.displayStatus}
                        tone={row.displayStatus === "failed" ? "danger" : "neutral"}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={row.sensitivity}
                        tone={
                          row.sensitivity === "safe"
                            ? "safe"
                            : row.sensitivity === "flagged"
                              ? "warn"
                              : "neutral"
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-[180px] items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all"
                            style={{ width: `${Math.min(100, row.displayProgress)}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-300">
                          {Math.round(row.displayProgress)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {(row.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/videos/${row.videoId}`}
                        className="inline-flex h-8 items-center rounded-xl border border-white/15 bg-white/5 px-3 text-xs text-slate-200 transition hover:bg-white/10"
                      >
                        Open
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
