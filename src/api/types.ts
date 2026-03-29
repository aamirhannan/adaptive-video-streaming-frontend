export type Role = "admin" | "editor" | "viewer";

export type User = {
  userId: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
};

export type VideoStatus =
  | "uploaded"
  | "processing"
  | "ready"
  | "flagged"
  | "failed";

export type Sensitivity = "safe" | "flagged" | "unknown";

export type VideoVariant = {
  quality: "240" | "480" | "720";
  height: number;
  storagePath: string;
  sizeBytes: number;
};

export type Video = {
  videoId: string;
  ownerUserId: string;
  originalName: string;
  storedFileName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  status: VideoStatus;
  sensitivity: Sensitivity;
  progress: number;
  errorMessage?: string;
  variants?: VideoVariant[];
  analysisSummary?: string;
  createdAt: string;
  updatedAt: string;
};

export type StreamQuality = "240" | "480" | "720";
