const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/story/:storyId', (req, res) => {
  db.all('SELECT * FROM tasks WHERE story_id = ? ORDER BY created_at DESC', [req.params.storyId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id], (err, task) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  });
});

router.post('/', (req, res) => {
  const { story_id, title, description, assignee, due_date } = req.body;
  if (!story_id || !title) return res.status(400).json({ error: 'story_id and title are required' });
  db.run(
    'INSERT INTO tasks (story_id, title, description, assignee, due_date) VALUES (?, ?, ?, ?, ?)',
    [story_id, title, description||'', assignee||'', due_date||''],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, row) => res.status(201).json(row));
    }
  );
});

router.put('/:id', (req, res) => {
  const { title, description, assignee, status, due_date } = req.body;
  db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id], (err, task) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    db.run(
      'UPDATE tasks SET title=?, description=?, assignee=?, status=?, due_date=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [title||task.title, description??task.description, assignee??task.assignee, status||task.status, due_date??task.due_date, req.params.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id], (err, row) => res.json(row));
      }
    );
  });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  });
});

module.exports = router;