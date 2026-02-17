# TaskBoard-Application

A fully functional Kanban-style Task Board application built with React. Covers every requirement in the assignment spec: static login, drag & drop, persistence, activity log, search/filter/sort, and more.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 (single-file JSX, no build step needed via Vite/CRA/Stackblitz) |
| Styling | Pure CSS-in-JS (inline styles + injected `<style>`) |
| Fonts | Google Fonts — DM Serif Display, DM Sans, DM Mono |
| State | `useState` / `useCallback` / `useEffect` (no external store needed) |
| Persistence | `localStorage` via safe wrappers |
| Drag & Drop | Native HTML5 Drag & Drop API |
| Testing | Vitest + React Testing Library (see `__tests__/`) |

---

## Setup & Run Locally

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### With Vite (recommended)

```bash
# 1. Create a Vite + React project
npm create vite@latest taskboard -- --template react
cd taskboard

# 2. Replace src/App.jsx with TaskBoard.jsx
cp TaskBoard.jsx src/App.jsx

# 3. Install dependencies
npm install

# 4. Start dev server
npm run dev
```

App will be live at `http://localhost:5173`.

### Deploy to Vercel / Netlify

```bash
npm run build        # outputs /dist
# drag /dist into Netlify drop or push repo to Vercel
```

---

## Login Credentials

| Field | Value |
|---|---|
| Email | `intern@demo.com` |
| Password | `intern123` |

"Remember me" stores the email in `localStorage` so it pre-fills on next visit.

---

## Feature Checklist

### Authentication
- [x] Login page with email + password fields
- [x] Hardcoded credential validation
- [x] Inline error messages (empty fields, invalid format, wrong credentials)
- [x] "Remember me" persisted in `localStorage`
- [x] Logout clears auth state
- [x] Board is only accessible when logged in (route protection via conditional render)

### Task Board
- [x] Three fixed columns: **Todo**, **Doing**, **Done**
- [x] Task fields: Title (required), Description, Priority, Due Date, Tags, CreatedAt
- [x] Create task (modal form with validation)
- [x] Edit task (same modal pre-filled)
- [x] Delete task (confirm dialog)
- [x] Drag & Drop tasks across columns (native HTML5 D&D)
- [x] Search by title (live, case-insensitive)
- [x] Filter by priority (All / High / Medium / Low)
- [x] Sort by due date — tasks without a due date appear last

### Persistence & Reliability
- [x] Board state persisted in `localStorage` across page refreshes
- [x] Safe `localStorage` wrappers — catches parse errors, handles missing keys gracefully
- [x] "Reset Board" button with confirmation dialog — clears tasks + activity log

### Activity Log
- [x] Slide-in panel tracks: Task created, edited, moved (with column info), deleted
- [x] Shows action type, task title, detail, and timestamp
- [x] Last 100 entries stored in `localStorage`

### Engineering Quality
- [x] Reusable components: `Modal`, `Confirm`, `TaskForm`, `TagInput`, `Column`, `TaskCard`, `LogPanel`, `Toast`
- [x] Form validation with per-field error messages
- [x] Toast notification system for all mutations
- [x] Consistent CSS variables / design tokens
- [x] At least 3 tests (see `__tests__/`)

---

## Tests

```bash
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
npx vitest run
```

### Test Cases

1. **LoginPage** — renders without crash; shows error on wrong credentials; calls `onLogin` on correct credentials
2. **TaskForm** — blocks submission when title is empty; calls `onSave` with correct data when valid
3. **Board state** — creating a task adds it to the correct column; deleting removes it; drag-and-drop moves task between columns

See `__tests__/TaskBoard.test.jsx` for full test file.

---

## localStorage Keys

| Key | Contents |
|---|---|
| `tb_auth` | `{ loggedIn: true, email }` |
| `tb_remember` | `{ email }` (only if "Remember me" checked) |
| `tb_tasks` | Array of task objects |
| `tb_log` | Array of activity log entries (max 100) |

---

## Project Structure (when split into files)

```
src/
├── App.jsx              ← Root (auth gate)
├── pages/
│   ├── LoginPage.jsx
│   └── BoardPage.jsx
├── components/
│   ├── Column.jsx
│   ├── TaskCard.jsx
│   ├── TaskForm.jsx
│   ├── TagInput.jsx
│   ├── Modal.jsx
│   ├── Confirm.jsx
│   ├── LogPanel.jsx
│   └── Toast.jsx
├── utils/
│   └── storage.js
└── __tests__/
    └── TaskBoard.test.jsx
```

---

## Design Decisions

- **No external state library** — the app is small enough that `useState` + prop-drilling is clean and testable.
- **Single-file delivery** — the entire app ships as one `.jsx` file for easy review and deployment via Stackblitz/CodeSandbox.
- **Native Drag & Drop** — avoids a heavy dependency (react-beautiful-dnd) while meeting the spec. For a production app, `@dnd-kit/core` would be preferred for accessibility.
- **`localStorage` over `IndexedDB`** — simpler API, fully sufficient for this scale.

---

## Submission

- **Deployed URL**: _(paste your Vercel/Netlify URL here)_
- **Source ZIP**: TaskBoard.jsx + README.md
- **Credentials**: `intern@demo.com` / `intern123`
