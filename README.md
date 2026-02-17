# TaskBoard Application

A fully functional Kanban-style Task Board application built with **pure HTML, CSS, and Vanilla JavaScript** — no frameworks, no build tools, no dependencies. Covers every requirement in the assignment spec: static login, drag & drop, persistence, activity log, search/filter/sort, and more.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Markup | HTML5 (semantic, accessible) |
| Styling | CSS3 — custom properties, animations, flexbox/grid |
| Logic | Vanilla JavaScript (ES2020+, `'use strict'`) |
| Fonts | Google Fonts — DM Serif Display, DM Sans, DM Mono |
| Persistence | `localStorage` via safe read/write wrappers |
| Drag & Drop | Native HTML5 Drag & Drop API |
| Framework | None — zero dependencies |

---

## Project Structure

```
taskboard/
├── index.html   ← All markup: login, board, modals, log panel, toasts
├── style.css    ← Full design system, layout, components, animations
└── app.js       ← All logic: auth, CRUD, drag & drop, search, filter, sort
```

---

## Setup & Run Locally

No install, no build step, no server required.

**Option 1 — Open directly in browser:**
```
Double-click index.html
```

**Option 2 — Serve with VS Code Live Server:**
1. Install the **Live Server** extension in VS Code
2. Right-click `index.html` → **Open with Live Server**
3. App runs at `http://127.0.0.1:5500`

**Option 3 — Python local server:**
```bash
cd taskboard
python3 -m http.server 8080
# Open http://localhost:8080
```

**Option 4 — Node.js local server:**
```bash
cd taskboard
npx serve .
# Open the URL shown in terminal
```

---

## Deploy

### Netlify (recommended — free)
1. Go to [netlify.com](https://netlify.com) → **Add new site → Deploy manually**
2. Drag and drop the `taskboard/` folder onto the deploy zone
3. Done — live URL generated instantly

### GitHub Pages
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/taskboard.git
git push -u origin main
# Enable Pages in repo Settings → Pages → Branch: main
```

### Vercel
```bash
npx vercel
# Follow prompts — select the taskboard folder as root
```

---

## Login Credentials

| Field | Value |
|---|---|
| Email | `intern@demo.com` |
| Password | `intern123` |

"Remember me" stores the email in `localStorage` so it pre-fills on the next visit. The password is never stored.

---

## Feature Checklist

### Authentication
- [x] Login page with email + password fields
- [x] Hardcoded credential validation (`intern@demo.com` / `intern123`)
- [x] Inline error messages — empty fields, invalid email format, wrong credentials
- [x] Password visibility toggle
- [x] "Remember me" persisted in `localStorage`
- [x] Logout clears auth state and returns to login
- [x] Board is only accessible when logged in (conditional page rendering)

### Task Board
- [x] Three fixed columns: **Todo**, **Doing**, **Done**
- [x] Task fields: Title (required), Description, Priority, Due Date, Tags, CreatedAt
- [x] Create task via modal form with validation
- [x] Edit task — same modal pre-filled with existing data
- [x] Delete task — with confirmation dialog
- [x] Drag & Drop tasks across columns (native HTML5 D&D with visual drop zones)
- [x] Search by title — live, case-insensitive
- [x] Filter by priority — All / High / Medium / Low
- [x] Sort by due date — tasks without a due date always appear last
- [x] Overdue tasks flagged with ⚠ warning indicator

### Persistence & Reliability
- [x] Board state persisted in `localStorage` — survives page refresh
- [x] Safe `localStorage` wrappers — catches JSON parse errors, handles missing/null keys gracefully
- [x] Reset Board button with confirmation dialog — clears all tasks and activity log

### Activity Log
- [x] Slide-in side panel tracks every action
- [x] Tracked events: Task created, edited, moved (shows from → to column), deleted
- [x] Each entry shows: action icon, task title, detail, and timestamp
- [x] Last 100 entries stored in `localStorage`

### Engineering Quality
- [x] Modular JS functions — each concern isolated (`initLogin`, `renderBoard`, `initDragDrop`, etc.)
- [x] Form validation with per-field error messages
- [x] Tag input with keyboard support (Enter / comma to add, Backspace to remove last)
- [x] Toast notification system for all mutations
- [x] CSS custom properties (design tokens) for consistent theming
- [x] Responsive — works on mobile and desktop
- [x] XSS-safe — all user content escaped via `escHtml()` before DOM insertion

---

## localStorage Keys

| Key | Contents |
|---|---|
| `tb_auth` | `{ loggedIn: true, email }` |
| `tb_remember` | `{ email }` — only written when "Remember me" is checked |
| `tb_tasks` | Array of task objects |
| `tb_log` | Array of activity log entries (capped at 100) |

### Task Object Shape

```json
{
  "id":          "a3f9b2c1",
  "title":       "Design system setup",
  "description": "Define tokens, colors, spacing",
  "priority":    "High",
  "column":      "Todo",
  "dueDate":     "2025-03-01",
  "tags":        ["design", "setup"],
  "createdAt":   "2025-02-17T10:30:00.000Z"
}
```

---

## Code Architecture

`app.js` is organized into clearly separated initialization functions, all wired up at boot:

| Function | Responsibility |
|---|---|
| `initLogin()` | Form validation, credential check, remember me, loading state |
| `renderBoard()` | Re-renders all three columns from current state |
| `renderColumn(col)` | Filters, sorts, and renders cards for a single column |
| `createTaskCard(task)` | Builds a task card DOM element with all events attached |
| `initDragDrop()` | Registers dragover / dragleave / drop handlers on each column |
| `openTaskModal(id)` | Opens create or edit modal, populates form fields |
| `initTaskForm()` | Handles form submit — creates or updates a task |
| `initTagInput()` | Manages tag chip creation, deletion, keyboard shortcuts |
| `showConfirm(msg, fn)` | Reusable confirmation dialog with dynamic callback |
| `openLog()` / `renderLog()` | Activity log panel open/close and rendering |
| `initToolbar()` | Search, priority filter, sort toggle, new task button |
| `initHeader()` | Activity log, reset board, logout buttons |
| `toast(msg, type)` | Temporary notification with auto-dismiss |

---

## Design Decisions

- **Zero dependencies** — The entire app runs from three static files. No npm, no bundler, no runtime. Anyone can inspect or run it instantly.
- **Native Drag & Drop** — Uses the browser's built-in HTML5 D&D API instead of a library. This keeps the bundle at zero bytes and demonstrates understanding of the underlying platform.
- **`localStorage` over `IndexedDB`** — Simpler synchronous API, more than sufficient for this data scale. All reads/writes are wrapped in try/catch to handle private browsing and storage quota errors gracefully.
- **DOM-based rendering** — Rather than a virtual DOM, the app re-renders individual columns on each state change. This is performant at this scale and demonstrates direct DOM manipulation skills.
- **XSS protection** — All user-generated content (titles, descriptions, tags) is passed through `escHtml()` before being set as `innerHTML`, preventing script injection.
- **CSS custom properties** — All colors, spacing, and radii are defined as CSS variables in `:root`, making theming trivial and keeping the stylesheet consistent throughout.

---

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Requires ES2020+ support — no polyfills needed for any supported browser released after 2020.

---

**Deployed URL**: https://legendary-sorbet-46aa20.netlify.app/
