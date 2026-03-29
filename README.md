# Adaptive Video Streaming — Frontend

React (Vite) UI for the assignment workflow: **register/login**, **video library** with filters, **upload** (editor/admin) with progress, **Socket.io** processing updates, **authenticated playback** with quality selection (240p / 480p / 720p), and **admin user management**.

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
2. **Library** — lists your videos; optional filters `status`, `sensitivity`; progress merged from **Socket.io** events.
3. **Upload** (editor/admin) — multipart upload with **XHR progress**; processing phases shown via sockets.
4. **Video detail** — metadata, sensitivity, analysis summary; **player** fetches the stream with `Authorization` and selected `quality` (blob URL; fine for demos; large files load fully into memory).
5. **Admin → Users** — list users and change roles (`GET/PATCH` `/api/admin/...`).

## Integration notes

- HTTP client: `fetch` + `Authorization: Bearer` per [api-doc.json](../adaptive-video-streaming-backend/api-doc.json).
- Realtime: `socket.io-client` connects with `auth: { token }`.
- Video field name for upload: **`video`** (matches Multer).

## Scripts

| Script       | Description        |
|-------------|--------------------|
| `npm run dev`    | Vite dev server    |
| `npm run build`  | Typecheck + bundle |
| `npm run preview`| Preview production build |
| `npm run lint`   | ESLint             |
