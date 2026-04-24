const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const projectRoutes = require('./routes/projects');
const storyRoutes = require('./routes/stories');
const taskRoutes = require('./routes/tasks');
const db = require('./db/database');
require('./jobs/digestJob');

const app = express();

// ✅ IMPORTANT: Use dynamic port (for deployment)
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/tasks', taskRoutes);

// Digest API
app.get('/api/digest', (req, res) => {
db.all(
'SELECT * FROM digest_log ORDER BY generated_at DESC LIMIT 10',
[],
(err, rows) => {
if (err) return res.status(500).json({ error: err.message });
res.json(rows.map(l => ({ ...l, summary: JSON.parse(l.summary) })));
}
);
});

// Health check
app.get('/api/health', (req, res) =>
res.json({ status: 'ok', time: new Date() })
);

// Swagger API docs
const swaggerDoc = YAML.load(path.join(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Start server
app.listen(PORT, () => {
console.log(`🚀 SprintDesk running on port ${PORT}`);
});
