import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import * as videosApi from "../api/videos.js";
import { useAuth } from "../contexts/AuthContext.js";
import { ApiError } from "../api/errors.js";

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
      setDone(`Uploaded: ${res.video.originalName} (${res.video.videoId})`);
      setFile(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box className="max-w-xl space-y-4">
      <Typography variant="h4" component="h1">
        Upload video
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Allowed: mp4, mov, webm, mkv — max 200MB. Field name must be{" "}
        <code>video</code> (handled by the client).
      </Typography>
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {done && (
        <Alert severity="success" onClose={() => setDone(null)}>
          {done}{" "}
          <Button component={RouterLink} to="/" size="small">
            View library
          </Button>
        </Alert>
      )}
      <Paper className="p-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <Button variant="outlined" component="label">
            Choose file
            <input
              type="file"
              hidden
              accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </Button>
          {file && (
            <Typography variant="body2">
              {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </Typography>
          )}
          {busy && (
            <Box>
              <Typography variant="caption">Upload progress</Typography>
              <LinearProgress variant="determinate" value={uploadPct} />
              <Typography variant="caption">{uploadPct}%</Typography>
            </Box>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={!file || busy}
          >
            {busy ? "Uploading…" : "Upload"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};
