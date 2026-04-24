const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/', (req, res) => {
  db.all('SELECT * FROM projects ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  db.get('SELECT * FROM projects WHERE id = ?', [req.params.id], (err, project) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    db.all('SELECT * FROM stories WHERE project_id = ?', [req.params.id], (err, stories) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ ...project, stories });
    });
  });
});

router.post('/', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name is required' });
  db.run('INSERT INTO projects (name, description) VALUES (?, ?)', [name, description || ''], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM projects WHERE id = ?', [this.lastID], (err, row) => {
      res.status(201).json(row);
    });
  });
});

router.put('/:id', (req, res) => {
  const { name, description, status } = req.body;
  db.get('SELECT * FROM projects WHERE id = ?', [req.params.id], (err, project) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    db.run(
      'UPDATE projects SET name=?, description=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [name||project.name, description??project.description, status||project.status, req.params.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.get('SELECT * FROM projects WHERE id = ?', [req.params.id], (err, row) => res.json(row));
      }
    );
  });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM projects WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  });
});

module.exports = router;