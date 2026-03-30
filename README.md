# Adaptive Video Streaming — Frontend

React (Vite) UI for the assignment workflow: **register/login**, modern animated dark UI shell, **video library** with filters, **upload** (editor/admin) with progress, **Socket.io** processing updates, **authenticated playback** with quality selection (240p / 480p / 720p), video sharing management, deletion flow, and **admin user management**.

## Prerequisites

- Backend running from `adaptive-video-streaming-backend` (default `http://localhost:5000`).
- CORS on the backend must allow this origin (e.g. `http://localhost:5173`).

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Environment (optional). Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

   Set `VITE_API_BASE_URL` to your API base (no trailing slash), e.g. `http://localhost:5000`.

3. Development:

   ```bash
   npm run dev
   ```

   Open the printed local URL (typically `http://localhost:5173`).

4. Production build:

   ```bash
   npm run build
   npm run preview
   ```

## User journey (assignment)

1. **Register** or **login** — JWT stored in `localStorage` (`avs_token`, `avs_user`).
2. **Library** — lists accessible videos (owned + shared with me); optional filters `status`, `sensitivity`; progress merged from **Socket.io** events. The table includes **Created By** from `ownerEmail`.
3. **Upload** (editor/admin) — multipart upload with **XHR progress**; processing phases shown via sockets.
4. **Video detail** — metadata, sensitivity, analysis summary; **player** uses `<video src>` with `access_token` and `quality` query params so the browser performs HTTP Range requests (incremental buffering) against the stream URL.
5. **Sharing (editor/admin)** — share a video with a viewer using **userId or email**, list active shares, and revoke share access.
6. **Delete video (editor/admin)** — delete a video and cascade cleanup (video record + shares + files) via backend API.
7. **Admin → Users** — list users and change roles (`GET/PATCH` `/api/admin/...`).

## Integration notes

- HTTP client: `fetch` + `Authorization: Bearer` per [api-doc.json](../adaptive-video-streaming-backend/api-doc.json).
- Realtime: `socket.io-client` connects with `auth: { token }`.
- Video field name for upload: **`video`** (matches Multer).
- Native playback auth: stream URL uses `access_token` query because HTML video elements cannot send custom auth headers.

## Scripts

| Script       | Description        |
|-------------|--------------------|
| `npm run dev`    | Vite dev server    |
| `npm run build`  | Typecheck + bundle |
| `npm run preview`| Preview production build |
| `npm run lint`   | ESLint             |
