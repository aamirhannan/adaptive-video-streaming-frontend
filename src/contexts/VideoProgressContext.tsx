import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { getApiBaseUrl } from "../lib/config.js";
import { useAuth } from "./AuthContext.js";

export type VideoProgressEntry = {
  videoId: string;
  phase?: string;
  progress: number;
  status?: string;
  sensitivity?: string;
};

type VideoProgressContextValue = {
  byVideoId: Record<string, VideoProgressEntry>;
  socket: Socket | null;
};

const VideoProgressContext = createContext<VideoProgressContextValue | null>(
  null,
);

export const VideoProgressProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [byVideoId, setByVideoId] = useState<Record<string, VideoProgressEntry>>(
    {},
  );
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      setSocket((prev) => {
        prev?.disconnect();
        return null;
      });
      setByVideoId({});
      return;
    }

    const s = io(getApiBaseUrl(), {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    s.on("video:progress", (payload: VideoProgressEntry & { videoId: string }) => {
      setByVideoId((prev) => ({
        ...prev,
        [payload.videoId]: {
          videoId: payload.videoId,
          phase: payload.phase,
          progress: payload.progress,
          status: payload.status,
        },
      }));
    });

    s.on(
      "video:status",
      (payload: {
        videoId: string;
        status: string;
        sensitivity?: string;
      }) => {
        setByVideoId((prev) => ({
          ...prev,
          [payload.videoId]: {
            ...prev[payload.videoId],
            videoId: payload.videoId,
            progress: 100,
            status: payload.status,
            sensitivity: payload.sensitivity,
          },
        }));
      },
    );

    s.on("video:error", (payload: { videoId: string; status: string }) => {
      setByVideoId((prev) => ({
        ...prev,
        [payload.videoId]: {
          videoId: payload.videoId,
          progress: 100,
          status: payload.status,
        },
      }));
    });

    setSocket(s);
    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [token]);

  const value = useMemo(
    () => ({ byVideoId, socket }),
    [byVideoId, socket],
  );

  return (
    <VideoProgressContext.Provider value={value}>
      {children}
    </VideoProgressContext.Provider>
  );
};

export const useVideoProgress = (): VideoProgressContextValue => {
  const ctx = useContext(VideoProgressContext);
  if (!ctx) {
    throw new Error("useVideoProgress must be used within VideoProgressProvider");
  }
  return ctx;
};
