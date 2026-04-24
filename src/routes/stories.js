const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/project/:projectId', (req, res) => {
  db.all('SELECT * FROM stories WHERE project_id = ? ORDER BY created_at DESC', [req.params.projectId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  db.get('SELECT * FROM stories WHERE id = ?', [req.params.id], (err, story) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!story) return res.status(404).json({ error: 'Story not found' });
    db.all('SELECT * FROM tasks WHERE story_id = ?', [req.params.id], (err, tasks) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ ...story, tasks });
    });
  });
});

router.post('/', (req, res) => {
  const { project_id, title, description, priority } = req.body;
  if (!project_id || !title) return res.status(400).json({ error: 'project_id and title are required' });
  db.run(
    'INSERT INTO stories (project_id, title, description, priority) VALUES (?, ?, ?, ?)',
    [project_id, title, description || '', priority || 'medium'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT * FROM stories WHERE id = ?', [this.lastID], (err, row) => res.status(201).json(row));
    }
  );
});

router.put('/:id', (req, res) => {
  const { title, description, priority, status } = req.body;
  db.get('SELECT * FROM stories WHERE id = ?', [req.params.id], (err, story) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!story) return res.status(404).json({ error: 'Story not found' });
    db.run(
      'UPDATE stories SET title=?, description=?, priority=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [title||story.title, description??story.description, priority||story.priority, status||story.status, req.params.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.get('SELECT * FROM stories WHERE id = ?', [req.params.id], (err, row) => res.json(row));
      }
    );
  });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM stories WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Story not found' });
    res.json({ message: 'Story deleted successfully' });
  });
});

module.exports = router;