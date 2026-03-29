import { getApiBaseUrl } from "../lib/config.js";
import { ApiError } from "./errors.js";
import { apiFetch } from "./client.js";
import type { Video, VideoStatus, Sensitivity, StreamQuality } from "./types.js";

export type ListVideosParams = {
  status?: VideoStatus;
  sensitivity?: Sensitivity;
};

export const listVideos = async (
  token: string,
  params: ListVideosParams = {},
): Promise<{ videos: Video[] }> => {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.sensitivity) qs.set("sensitivity", params.sensitivity);
  const q = qs.toString();
  const path = q ? `/api/videos?${q}` : "/api/videos";
  return apiFetch<{ videos: Video[] }>(path, { method: "GET", token });
};

export const getVideo = async (
  token: string,
  videoId: string,
): Promise<{ video: Video }> => {
  return apiFetch<{ video: Video }>(`/api/videos/${encodeURIComponent(videoId)}`, {
    method: "GET",
    token,
  });
};

export type UploadVideoResult = { video: Video };

export const uploadVideo = (
  file: File,
  token: string,
  onProgress: (percent: number) => void,
): Promise<UploadVideoResult> => {
  const base = getApiBaseUrl();
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${base}/api/videos/upload`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as UploadVideoResult);
        } catch {
          reject(new ApiError(xhr.status, "Invalid response"));
        }
      } else {
        try {
          const j = JSON.parse(xhr.responseText) as { message?: string };
          reject(new ApiError(xhr.status, j.message ?? xhr.statusText));
        } catch {
          reject(new ApiError(xhr.status, xhr.statusText));
        }
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    const fd = new FormData();
    fd.append("video", file);
    xhr.send(fd);
  });
};

/**
 * URL for `<video src>` so the browser can issue HTTP Range requests (206)
 * for incremental buffering. The JWT is passed as `access_token` because
 * `<video>` cannot send Authorization headers.
 */
export const getVideoStreamUrl = (
  token: string,
  videoId: string,
  quality: StreamQuality,
): string => {
  const base = getApiBaseUrl();
  const url = new URL(
    `${base}/api/videos/${encodeURIComponent(videoId)}/stream`,
  );
  url.searchParams.set("quality", quality);
  url.searchParams.set("access_token", token);
  return url.toString();
};
