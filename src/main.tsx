import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import { VideoProgressProvider } from "./contexts/VideoProgressContext";
import { UIProvider } from "./contexts/UIContext";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6f7fff" },
    secondary: { main: "#22d3ee" },
    background: {
      default: "#070b16",
      paper: "#0d1424",
    },
    divider: "rgba(148, 163, 184, 0.2)",
    text: {
      primary: "#e5e7eb",
      secondary: "#94a3b8",
    },
  },
  shape: {
    borderRadius: 12,
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <UIProvider>
            <VideoProgressProvider>
              <App />
            </VideoProgressProvider>
          </UIProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
