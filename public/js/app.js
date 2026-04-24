const API = 'http://localhost:3000/api';
let currentProjectId = null;
let currentStoryId = null;

// ─── PAGE NAVIGATION ───────────────────────────────────────────
function showPage(page) {
  document.getElementById('page-projects').style.display = 'none';
  document.getElementById('page-stories').style.display = 'none';
  document.getElementById('page-digest').style.display = 'none';
  document.getElementById(`page-${page}`).style.display = 'block';

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  if (page === 'projects') { loadProjects(); document.querySelectorAll('.nav-link')[0].classList.add('active'); }
  if (page === 'digest')   { loadDigest();   document.querySelectorAll('.nav-link')[1].classList.add('active'); }
}

// ─── MODAL HELPERS ─────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// ─── PROJECTS ──────────────────────────────────────────────────
async function loadProjects() {
  const res = await fetch(`${API}/projects`);
  const projects = await res.json();
  const container = document.getElementById('projects-list');

  if (projects.length === 0) {
    container.innerHTML = '<p class="empty">No projects yet. Create your first one!</p>';
    return;
  }

  container.innerHTML = projects.map(p => `
    <div class="card" onclick="openProject(${p.id}, '${escHtml(p.name)}')">
      <h3>${escHtml(p.name)}</h3>
      <p>${escHtml(p.description || 'No description')}</p>
      <div class="card-meta">
        <span class="badge badge-${p.status}">${p.status}</span>
        <button class="btn btn-danger" onclick="event.stopPropagation(); deleteProject(${p.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

async function createProject() {
  const name = document.getElementById('new-project-name').value.trim();
  const description = document.getElementById('new-project-desc').value.trim();
  if (!name) return alert('Project name is required');

  await fetch(`${API}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description })
  });

  document.getElementById('new-project-name').value = '';
  document.getElementById('new-project-desc').value = '';
  closeModal('modal-new-project');
  loadProjects();
}

async function deleteProject(id) {
  if (!confirm('Delete this project and all its stories/tasks?')) return;
  await fetch(`${API}/projects/${id}`, { method: 'DELETE' });
  loadProjects();
}

// ─── STORIES ───────────────────────────────────────────────────
async function openProject(id, name) {
  currentProjectId = id;
  document.getElementById('stories-project-title').textContent = name;
  showPage('stories');
  loadStories();
}

async function loadStories() {
  const res = await fetch(`${API}/stories/project/${currentProjectId}`);
  const stories = await res.json();
  const container = document.getElementById('stories-list');

  if (stories.length === 0) {
    container.innerHTML = '<p class="empty">No user stories yet. Add your first one!</p>';
    return;
  }

  container.innerHTML = stories.map(s => `
    <div class="story-card">
      <div class="story-header">
        <div>
          <div class="story-title">${escHtml(s.title)}</div>
          <div class="story-desc">${escHtml(s.description || '')}</div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
          <div class="story-badges">
            <span class="badge badge-${s.priority}">${s.priority}</span>
            <span class="badge badge-${s.status}">${s.status.replace('_',' ')}</span>
          </div>
          <div class="story-actions">
            <select class="task-status-select" onchange="updateStoryStatus(${s.id}, this.value)">
              <option value="backlog"     ${s.status==='backlog'?'selected':''}>Backlog</option>
              <option value="in_progress" ${s.status==='in_progress'?'selected':''}>In Progress</option>
              <option value="done"        ${s.status==='done'?'selected':''}>Done</option>
            </select>
            <button class="btn btn-danger" onclick="deleteStory(${s.id})">Delete</button>
          </div>
        </div>
      </div>

      <div id="tasks-${s.id}" class="tasks-list"></div>

      <div class="add-task-row">
        <button class="btn btn-primary" style="font-size:13px" onclick="openTaskModal(${s.id})">+ Add Task</button>
      </div>
    </div>
  `).join('');

  // Load tasks for each story
  stories.forEach(s => loadTasks(s.id));
}

async function createStory() {
  const title = document.getElementById('new-story-title').value.trim();
  const description = document.getElementById('new-story-desc').value.trim();
  const priority = document.getElementById('new-story-priority').value;
  if (!title) return alert('Story title is required');

  await fetch(`${API}/stories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id: currentProjectId, title, description, priority })
  });

  document.getElementById('new-story-title').value = '';
  document.getElementById('new-story-desc').value = '';
  closeModal('modal-new-story');
  loadStories();
}

async function updateStoryStatus(id, status) {
  await fetch(`${API}/stories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  loadStories();
}

async function deleteStory(id) {
  if (!confirm('Delete this story and all its tasks?')) return;
  await fetch(`${API}/stories/${id}`, { method: 'DELETE' });
  loadStories();
}

// ─── TASKS ─────────────────────────────────────────────────────
function openTaskModal(storyId) {
  currentStoryId = storyId;
  openModal('modal-new-task');
}

async function loadTasks(storyId) {
  const res = await fetch(`${API}/tasks/story/${storyId}`);
  const tasks = await res.json();
  const container = document.getElementById(`tasks-${storyId}`);
  if (!container) return;

  if (tasks.length === 0) {
    container.innerHTML = '<p style="font-size:13px;color:#bbb;padding:4px 0">No tasks yet</p>';
    return;
  }

  container.innerHTML = tasks.map(t => `
    <div class="task-item ${t.status === 'done' ? 'done' : ''}">
      <span class="task-title">${escHtml(t.title)}</span>
      ${t.assignee ? `<span class="task-meta">👤 ${escHtml(t.assignee)}</span>` : ''}
      ${t.due_date ? `<span class="task-meta">📅 ${t.due_date}</span>` : ''}
      <select class="task-status-select" onchange="updateTaskStatus(${t.id}, this.value, ${storyId})">
        <option value="todo"        ${t.status==='todo'?'selected':''}>Todo</option>
        <option value="in_progress" ${t.status==='in_progress'?'selected':''}>In Progress</option>
        <option value="done"        ${t.status==='done'?'selected':''}>Done</option>
      </select>
      <button class="btn btn-danger" style="padding:4px 10px;font-size:12px" onclick="deleteTask(${t.id}, ${storyId})">✕</button>
    </div>
  `).join('');
}

async function createTask() {
  const title = document.getElementById('new-task-title').value.trim();
  const assignee = document.getElementById('new-task-assignee').value.trim();
  const due_date = document.getElementById('new-task-due').value;
  if (!title) return alert('Task title is required');

  await fetch(`${API}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ story_id: currentStoryId, title, assignee, due_date })
  });

  document.getElementById('new-task-title').value = '';
  document.getElementById('new-task-assignee').value = '';
  document.getElementById('new-task-due').value = '';
  closeModal('modal-new-task');
  loadTasks(currentStoryId);
}

async function updateTaskStatus(id, status, storyId) {
  await fetch(`${API}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  loadTasks(storyId);
}

async function deleteTask(id, storyId) {
  await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
  loadTasks(storyId);
}

// ─── DIGEST ────────────────────────────────────────────────────
async function loadDigest() {
  const res = await fetch(`${API}/digest`);
  const logs = await res.json();
  const container = document.getElementById('digest-list');

  if (logs.length === 0) {
    container.innerHTML = '<p class="empty">No digest generated yet. Wait up to 1 minute.</p>';
    return;
  }

  container.innerHTML = logs.map(l => `
    <div class="digest-card">
      <h3>Generated at ${new Date(l.summary.generated_at).toLocaleString()}</h3>
      <div class="digest-stats">
        <div class="stat-box"><div class="num">${l.summary.projects}</div><div class="label">Projects</div></div>
        <div class="stat-box"><div class="num">${l.summary.stories}</div><div class="label">Stories</div></div>
        <div class="stat-box"><div class="num">${l.summary.tasks.todo}</div><div class="label">Todo</div></div>
        <div class="stat-box"><div class="num">${l.summary.tasks.in_progress}</div><div class="label">In Progress</div></div>
        <div class="stat-box"><div class="num">${l.summary.tasks.done}</div><div class="label">Done</div></div>
      </div>
    </div>
  `).join('');
}

// ─── UTILITY ───────────────────────────────────────────────────
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── INIT ──────────────────────────────────────────────────────
loadProjects();