import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../api/errors.js";
import * as videosApi from "../api/videos.js";
import { Alert } from "../components/ui/alert.js";
import { Button } from "../components/ui/button.js";
import { Card } from "../components/ui/card.js";
import { useAuth } from "../contexts/AuthContext.js";

export const UploadPage = () => {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !file) return;
    setError(null);
    setDone(null);
    setBusy(true);
    setUploadPct(0);
    try {
      const res = await videosApi.uploadVideo(file, token, setUploadPct);
      setDone(`Uploaded: ${res.video.originalName}`);
      setFile(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Upload video</h1>
        <p className="mt-1 text-sm text-slate-400">
          Allowed: mp4/mov/webm/mkv, max 200MB.
        </p>
      </div>

      {error && <Alert>{error}</Alert>}
      {done && (
        <Alert tone="success">
          {done}{" "}
          <Link to="/" className="font-medium text-emerald-200 underline underline-offset-4">
            View library
          </Link>
        </Alert>
      )}

      <Card className="p-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block cursor-pointer rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center transition-colors hover:bg-white/10">
            <UploadCloud className="mx-auto mb-2 h-7 w-7 text-violet-300" />
            <div className="text-sm text-slate-200">Choose a video file</div>
            <div className="text-xs text-slate-400">Click to browse local files</div>
            <input
              type="file"
              hidden
              accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          {file && (
            <p className="text-sm text-slate-300">
              {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}

          {busy && (
            <div className="space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadPct}%` }}
                  transition={{ duration: 0.25 }}
                />
              </div>
              <p className="text-xs text-slate-400">{uploadPct}% uploaded</p>
            </div>
          )}

          <Button type="submit" disabled={!file || busy}>
            {busy ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </Card>
    </div>
  );
};
