/* ═══════════════════════════════════════════
   app.js — TaskBoard
   Vanilla JS, no dependencies
═══════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const VALID_EMAIL    = 'intern@demo.com';
const VALID_PASSWORD = 'intern123';
const COLUMNS        = ['Todo', 'Doing', 'Done'];
const PRIORITIES     = ['High', 'Medium', 'Low'];

const LS = {
  AUTH:     'tb_auth',
  REMEMBER: 'tb_remember',
  TASKS:    'tb_tasks',
  LOG:      'tb_log',
};

const DEFAULT_TASKS = [
  {
    id: 't1', column: 'Todo',
    title: 'Design system setup',
    description: 'Define tokens, colors, spacing scale',
    priority: 'High', dueDate: '2025-03-01',
    tags: ['design', 'setup'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 't2', column: 'Doing',
    title: 'Authentication flow',
    description: 'Login, logout, remember me',
    priority: 'High', dueDate: '2025-02-20',
    tags: ['auth'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 't3', column: 'Done',
    title: 'Project scaffolding',
    description: 'Init repo, configure tooling',
    priority: 'Low', dueDate: '',
    tags: ['infra'],
    createdAt: new Date().toISOString(),
  },
];

/* ─────────────────────────────────────────
   UTILS
───────────────────────────────────────── */
const uid    = () => Math.random().toString(36).slice(2, 10);
const now    = () => new Date().toISOString();
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function safeGet(key, def) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : def;
  } catch { return def; }
}

function safeSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* quota or private */ }
}

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isOverdue(due) {
  if (!due) return false;
  return new Date(due) < new Date(new Date().toDateString());
}

/* ─────────────────────────────────────────
   STATE
───────────────────────────────────────── */
const state = {
  tasks:      safeGet(LS.TASKS, DEFAULT_TASKS),
  log:        safeGet(LS.LOG, []),
  search:     '',
  filterPri:  'All',
  sortDue:    false,
  draggingId: null,
  editingId:  null,
  pendingDelete: null,
  pendingReset:  false,
  formTags:   [],
  logOpen:    false,
};

function saveTasks() { safeSet(LS.TASKS, state.tasks); }
function saveLog()   { safeSet(LS.LOG,   state.log);   }

function addLog(type, title, detail) {
  state.log.push({ type, title, detail, ts: now() });
  if (state.log.length > 100) state.log.shift();
  saveLog();
  if (state.logOpen) renderLog();
}

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
function toast(msg, type = 'success') {
  const container = $('#toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 220);
  }, 2600);
}

/* ─────────────────────────────────────────
   AUTH
───────────────────────────────────────── */
function isLoggedIn() {
  return safeGet(LS.AUTH, null)?.loggedIn === true;
}

function showPage(page) {
  $('#login-page').classList.toggle('hidden', page !== 'login');
  $('#board-page').classList.toggle('hidden', page !== 'board');
}

/* ─────────────────────────────────────────
   LOGIN
───────────────────────────────────────── */
function initLogin() {
  const emailInput = $('#email-input');
  const passInput  = $('#password-input');
  const rememberCb = $('#remember-checkbox');
  const form       = $('#login-form');
  const errBox     = $('#login-error');
  const loginBtn   = $('#login-btn');
  const togglePw   = $('#toggle-pw');

  // Pre-fill remembered email
  const remembered = safeGet(LS.REMEMBER, null);
  if (remembered?.email) {
    emailInput.value = remembered.email;
    rememberCb.classList.add('checked');
    rememberCb.setAttribute('aria-checked', 'true');
    $('#remember-me').checked = true;
  }

  // Toggle password visibility
  togglePw.addEventListener('click', () => {
    const isText = passInput.type === 'text';
    passInput.type = isText ? 'password' : 'text';
    togglePw.textContent = isText ? '👁' : '🙈';
  });

  // Custom checkbox
  rememberCb.addEventListener('click', toggleRemember);
  rememberCb.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleRemember(); } });
  function toggleRemember() {
    const checked = !rememberCb.classList.contains('checked');
    rememberCb.classList.toggle('checked', checked);
    rememberCb.setAttribute('aria-checked', String(checked));
    $('#remember-me').checked = checked;
  }

  // Form submit
  form.addEventListener('submit', handleLogin);

  function handleLogin(e) {
    e.preventDefault();
    errBox.classList.add('hidden');
    errBox.textContent = '';

    const email    = emailInput.value.trim();
    const password = passInput.value;
    const remember = $('#remember-me').checked;

    // Validation
    if (!email) return showError('Email is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('Enter a valid email address.');
    if (!password) return showError('Password is required.');

    // Loading state
    loginBtn.disabled = true;
    $('.btn-text', loginBtn).classList.add('hidden');
    $('.btn-spinner', loginBtn).classList.remove('hidden');

    setTimeout(() => {
      if (email.toLowerCase() === VALID_EMAIL && password === VALID_PASSWORD) {
        if (remember) safeSet(LS.REMEMBER, { email });
        else localStorage.removeItem(LS.REMEMBER);
        safeSet(LS.AUTH, { loggedIn: true, email });
        showPage('board');
        renderBoard();
      } else {
        showError('Invalid email or password. Please try again.');
        loginBtn.disabled = false;
        $('.btn-text', loginBtn).classList.remove('hidden');
        $('.btn-spinner', loginBtn).classList.add('hidden');
      }
    }, 550);
  }

  function showError(msg) {
    errBox.textContent = msg;
    errBox.classList.remove('hidden');
  }
}

/* ─────────────────────────────────────────
   BOARD RENDERING
───────────────────────────────────────── */
function getFilteredTasks(col) {
  let tasks = state.tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(state.search.toLowerCase());
    const matchPri    = state.filterPri === 'All' || t.priority === state.filterPri;
    return t.column === col && matchSearch && matchPri;
  });

  if (state.sortDue) {
    tasks = [...tasks].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }

  return tasks;
}

function renderBoard() {
  updateProgress();
  COLUMNS.forEach(col => renderColumn(col));
}

function updateProgress() {
  const total = state.tasks.length;
  const done  = state.tasks.filter(t => t.column === 'Done').length;
  const pct   = total ? Math.round((done / total) * 100) : 0;
  $('#header-progress').textContent = `${pct}% done`;
}

function renderColumn(col) {
  const body  = $(`#body-${col}`);
  const tasks = getFilteredTasks(col);

  // Update count (use actual col tasks, not filtered)
  const actual = state.tasks.filter(t => t.column === col).length;
  $(`#count-${col}`).textContent = actual;

  body.innerHTML = '';

  if (tasks.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'col-empty';
    empty.textContent = 'Drop tasks here';
    body.appendChild(empty);
    return;
  }

  tasks.forEach(task => {
    body.appendChild(createTaskCard(task));
  });
}

function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.draggable = true;
  card.dataset.id = task.id;

  const overdue = isOverdue(task.dueDate);
  const dueText = task.dueDate
    ? `${overdue ? '⚠ ' : ''}${formatDate(task.dueDate)}`
    : '<span class="task-due-none">No due date</span>';

  const tagsHtml = task.tags.length
    ? `<div class="task-tags">${task.tags.map(t => `<span class="task-tag">#${t}</span>`).join('')}</div>`
    : '';

  const descHtml = task.description
    ? `<p class="task-desc">${escHtml(task.description.length > 90 ? task.description.slice(0, 90) + '…' : task.description)}</p>`
    : '';

  card.innerHTML = `
    <div class="task-card-top">
      <span class="task-title">${escHtml(task.title)}</span>
      <span class="priority-badge badge-${task.priority}">
        <span class="dot dot-${task.priority}"></span>
        ${task.priority}
      </span>
    </div>
    ${descHtml}
    ${tagsHtml}
    <div class="task-footer">
      <span class="task-due ${overdue ? 'overdue' : ''}">${dueText}</span>
      <div class="task-actions">
        <button class="btn-icon btn-edit" data-edit="${task.id}" title="Edit">✏</button>
        <button class="btn-icon btn-del"  data-del="${task.id}"  title="Delete">✕</button>
      </div>
    </div>
  `;

  // Drag events
  card.addEventListener('dragstart', e => {
    state.draggingId = task.id;
    e.dataTransfer.effectAllowed = 'move';
    requestAnimationFrame(() => card.classList.add('dragging'));
  });
  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    state.draggingId = null;
  });

  // Edit / Delete
  $('[data-edit]', card).addEventListener('click', () => openTaskModal(task.id));
  $('[data-del]',  card).addEventListener('click', () => confirmDelete(task.id));

  return card;
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ─────────────────────────────────────────
   DRAG & DROP
───────────────────────────────────────── */
function initDragDrop() {
  COLUMNS.forEach(col => {
    const body = $(`#body-${col}`);

    body.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      body.classList.add(`drag-over-${col.toLowerCase()}`);
    });

    body.addEventListener('dragleave', e => {
      if (!body.contains(e.relatedTarget)) {
        body.classList.remove(`drag-over-${col.toLowerCase()}`);
      }
    });

    body.addEventListener('drop', e => {
      e.preventDefault();
      body.classList.remove(`drag-over-${col.toLowerCase()}`);
      if (!state.draggingId) return;

      const task = state.tasks.find(t => t.id === state.draggingId);
      if (task && task.column !== col) {
        const prev = task.column;
        task.column = col;
        saveTasks();
        addLog('moved', task.title, `${prev} → ${col}`);
        toast(`Moved to ${col}`, 'info');
        renderBoard();
      }
      state.draggingId = null;
    });
  });
}

/* ─────────────────────────────────────────
   TASK MODAL
───────────────────────────────────────── */
function openTaskModal(taskId = null, defaultCol = 'Todo') {
  state.editingId  = taskId;
  state.formTags   = [];

  const modal    = $('#task-modal');
  const title    = $('#modal-title');
  const idInput  = $('#task-id');
  const titleIn  = $('#task-title');
  const descIn   = $('#task-desc');
  const priIn    = $('#task-priority');
  const colIn    = $('#task-column');
  const dueIn    = $('#task-due');
  const tagIn    = $('#tag-input');
  const tagsCont = $('#tags-container');
  const errEl    = $('#title-error');

  errEl.classList.add('hidden');

  if (taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    title.textContent  = 'Edit Task';
    idInput.value      = task.id;
    titleIn.value      = task.title;
    descIn.value       = task.description;
    priIn.value        = task.priority;
    colIn.value        = task.column;
    dueIn.value        = task.dueDate;
    state.formTags     = [...task.tags];
  } else {
    title.textContent  = 'Create Task';
    idInput.value      = '';
    titleIn.value      = '';
    descIn.value       = '';
    priIn.value        = 'Medium';
    colIn.value        = defaultCol;
    dueIn.value        = '';
    state.formTags     = [];
  }

  renderFormTags();
  modal.classList.remove('hidden');
  setTimeout(() => titleIn.focus(), 50);
}

function closeTaskModal() {
  $('#task-modal').classList.add('hidden');
  state.editingId = null;
  state.formTags  = [];
}

function renderFormTags() {
  const container = $('#tags-container');
  container.innerHTML = '';
  state.formTags.forEach(tag => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.innerHTML = `${escHtml(tag)} <button class="tag-chip-remove" data-tag="${escHtml(tag)}" type="button">×</button>`;
    chip.querySelector('.tag-chip-remove').addEventListener('click', () => {
      state.formTags = state.formTags.filter(t => t !== tag);
      renderFormTags();
    });
    container.appendChild(chip);
  });
}

function initTagInput() {
  const input = $('#tag-input');
  const wrap  = $('#tag-input-wrap');

  wrap.addEventListener('click', () => input.focus());

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = input.value.trim().toLowerCase();
      if (val && !state.formTags.includes(val)) {
        state.formTags.push(val);
        renderFormTags();
      }
      input.value = '';
    }
    // Backspace on empty removes last tag
    if (e.key === 'Backspace' && !input.value && state.formTags.length) {
      state.formTags.pop();
      renderFormTags();
    }
  });
}

function initTaskForm() {
  $('#task-form').addEventListener('submit', e => {
    e.preventDefault();

    const titleVal = $('#task-title').value.trim();
    const errEl    = $('#title-error');

    if (!titleVal) {
      errEl.classList.remove('hidden');
      $('#task-title').focus();
      return;
    }
    errEl.classList.add('hidden');

    const formData = {
      title:       titleVal,
      description: $('#task-desc').value.trim(),
      priority:    $('#task-priority').value,
      column:      $('#task-column').value,
      dueDate:     $('#task-due').value,
      tags:        [...state.formTags],
    };

    if (state.editingId) {
      const idx = state.tasks.findIndex(t => t.id === state.editingId);
      if (idx !== -1) {
        state.tasks[idx] = { ...state.tasks[idx], ...formData };
        addLog('edited', formData.title, `Updated in ${formData.column}`);
        toast('Task updated ✓');
      }
    } else {
      const task = { id: uid(), createdAt: now(), ...formData };
      state.tasks.push(task);
      addLog('created', formData.title, `Added to ${formData.column}`);
      toast('Task created ✓');
    }

    saveTasks();
    renderBoard();
    closeTaskModal();
  });

  $('#task-title').addEventListener('input', () => {
    if ($('#task-title').value.trim()) $('#title-error').classList.add('hidden');
  });
}

/* ─────────────────────────────────────────
   CONFIRM MODAL
───────────────────────────────────────── */
function showConfirm(msg, onConfirm) {
  $('#confirm-msg').textContent = msg;
  $('#confirm-modal').classList.remove('hidden');

  const doConfirm = () => {
    onConfirm();
    closeConfirm();
  };

  $('#confirm-ok').onclick     = doConfirm;
  $('#confirm-close').onclick  = closeConfirm;
  $('#confirm-cancel').onclick = closeConfirm;
}

function closeConfirm() {
  $('#confirm-modal').classList.add('hidden');
}

function confirmDelete(id) {
  showConfirm('Delete this task? This cannot be undone.', () => {
    const task = state.tasks.find(t => t.id === id);
    if (task) addLog('deleted', task.title, `Removed from ${task.column}`);
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveTasks();
    renderBoard();
    toast('Task deleted', 'error');
  });
}

/* ─────────────────────────────────────────
   ACTIVITY LOG
───────────────────────────────────────── */
const LOG_ICONS = { created: '✦', edited: '✎', moved: '⇄', deleted: '✕' };

function renderLog() {
  const body = $('#log-body');
  body.innerHTML = '';

  if (!state.log.length) {
    const empty = document.createElement('p');
    empty.className = 'log-empty';
    empty.textContent = 'No activity yet.';
    body.appendChild(empty);
    return;
  }

  [...state.log].reverse().forEach((entry, i) => {
    const el = document.createElement('div');
    el.className = 'log-entry';
    el.style.animationDelay = `${i * 0.02}s`;
    el.innerHTML = `
      <div class="log-entry-top">
        <span class="log-icon log-icon-${entry.type}">${LOG_ICONS[entry.type] || '·'}</span>
        <span class="log-entry-name">${escHtml(entry.title)}</span>
      </div>
      <p class="log-entry-detail">${escHtml(entry.detail)}</p>
      <p class="log-entry-time">${new Date(entry.ts).toLocaleString()}</p>
    `;
    body.appendChild(el);
  });
}

function openLog() {
  state.logOpen = true;
  $('#log-panel').classList.add('open');
  $('#log-overlay').classList.remove('hidden');
  renderLog();
}

function closeLog() {
  state.logOpen = false;
  $('#log-panel').classList.remove('open');
  $('#log-overlay').classList.add('hidden');
}

/* ─────────────────────────────────────────
   TOOLBAR CONTROLS
───────────────────────────────────────── */
function initToolbar() {
  $('#search-input').addEventListener('input', e => {
    state.search = e.target.value;
    renderBoard();
  });

  $('#filter-priority').addEventListener('change', e => {
    state.filterPri = e.target.value;
    renderBoard();
  });

  const sortBtn = $('#sort-btn');
  sortBtn.addEventListener('click', () => {
    state.sortDue = !state.sortDue;
    sortBtn.dataset.active  = String(state.sortDue);
    sortBtn.textContent = state.sortDue ? '↑ Due Date' : 'Sort by Due';
    renderBoard();
  });

  $('#new-task-btn').addEventListener('click', () => openTaskModal(null, 'Todo'));

  // Column add buttons
  $$('.col-add-btn').forEach(btn => {
    btn.addEventListener('click', () => openTaskModal(null, btn.dataset.col));
  });
}

/* ─────────────────────────────────────────
   HEADER BUTTONS
───────────────────────────────────────── */
function initHeader() {
  $('#log-btn').addEventListener('click', () => {
    state.logOpen ? closeLog() : openLog();
  });
  $('#log-close').addEventListener('click', closeLog);
  $('#log-overlay').addEventListener('click', closeLog);

  $('#reset-btn').addEventListener('click', () => {
    showConfirm('Reset the board? All tasks and activity will be cleared.', () => {
      state.tasks = [...DEFAULT_TASKS.map(t => ({ ...t, id: uid(), createdAt: now() }))];
      state.log   = [];
      saveTasks();
      saveLog();
      renderBoard();
      toast('Board reset', 'info');
    });
  });

  $('#logout-btn').addEventListener('click', () => {
    localStorage.removeItem(LS.AUTH);
    showPage('login');
  });
}

/* ─────────────────────────────────────────
   MODAL CLOSE EVENTS
───────────────────────────────────────── */
function initModalClose() {
  // Task modal
  $('#modal-close').addEventListener('click',  closeTaskModal);
  $('#modal-cancel').addEventListener('click', closeTaskModal);
  $('#task-modal').addEventListener('click', e => {
    if (e.target === $('#task-modal')) closeTaskModal();
  });

  // Confirm modal
  $('#confirm-modal').addEventListener('click', e => {
    if (e.target === $('#confirm-modal')) closeConfirm();
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!$('#task-modal').classList.contains('hidden'))    closeTaskModal();
      if (!$('#confirm-modal').classList.contains('hidden')) closeConfirm();
      if (state.logOpen) closeLog();
    }
  });
}

/* ─────────────────────────────────────────
   BOOT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initModalClose();
  initTagInput();
  initTaskForm();
  initDragDrop();
  initToolbar();
  initHeader();
  initLogin();

  if (isLoggedIn()) {
    showPage('board');
    renderBoard();
  } else {
    showPage('login');
  }
});
