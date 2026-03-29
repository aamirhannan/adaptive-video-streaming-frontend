import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { Video, VideoStatus, Sensitivity } from "../api/types.js";
import * as videosApi from "../api/videos.js";
import { useAuth } from "../contexts/AuthContext.js";
import { useVideoProgress } from "../contexts/VideoProgressContext.js";
import { ApiError } from "../api/errors.js";

export const LibraryPage = () => {
  const { token } = useAuth();
  const { byVideoId } = useVideoProgress();
  const [list, setList] = useState<Video[]>([]);
  const [statusFilter, setStatusFilter] = useState<VideoStatus | "">("");
  const [sensitivityFilter, setSensitivityFilter] = useState<Sensitivity | "">(
    "",
  );
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
    const progress =
      live?.progress ?? (typeof v.progress === "number" ? v.progress : 0);
    const status = (live?.status as Video["status"]) ?? v.status;
    return { ...v, displayProgress: progress, displayStatus: status };
  });

  return (
    <Box className="space-y-4">
      <Typography variant="h4" component="h1">
        Video library
      </Typography>
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Paper className="p-4 flex flex-wrap gap-4 items-end">
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as VideoStatus | "")
            }
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="uploaded">uploaded</MenuItem>
            <MenuItem value="processing">processing</MenuItem>
            <MenuItem value="ready">ready</MenuItem>
            <MenuItem value="flagged">flagged</MenuItem>
            <MenuItem value="failed">failed</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Sensitivity</InputLabel>
          <Select
            label="Sensitivity"
            value={sensitivityFilter}
            onChange={(e) =>
              setSensitivityFilter(e.target.value as Sensitivity | "")
            }
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="safe">safe</MenuItem>
            <MenuItem value="flagged">flagged</MenuItem>
            <MenuItem value="unknown">unknown</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={() => void load()}>
          Refresh
        </Button>
      </Paper>

      {loading ? (
        <LinearProgress />
      ) : (
        <Table component={Paper} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sensitivity</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Size</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {mergedRows.map((row) => (
              <TableRow key={row.videoId} hover>
                <TableCell>{row.originalName}</TableCell>
                <TableCell>
                  <Chip size="small" label={row.displayStatus} />
                </TableCell>
                <TableCell>
                  <Chip size="small" label={row.sensitivity} />
                </TableCell>
                <TableCell>
                  <Box className="flex items-center gap-2 min-w-[120px]">
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, row.displayProgress)}
                      className="flex-1"
                    />
                    <Typography variant="caption">
                      {Math.round(row.displayProgress)}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {(row.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                </TableCell>
                <TableCell>
                  <Button
                    component={RouterLink}
                    to={`/videos/${row.videoId}`}
                    size="small"
                  >
                    Open
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};
