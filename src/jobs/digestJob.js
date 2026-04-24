const cron = require('node-cron');
const db = require('../db/database');

function generateDigest() {
  db.all('SELECT status, COUNT(*) as count FROM tasks GROUP BY status', [], (err, taskStats) => {
    if (err) return console.error('❌ Digest job failed:', err.message);

    db.get('SELECT COUNT(*) as count FROM projects', [], (err, projectCount) => {
      if (err) return console.error('❌ Digest job failed:', err.message);

      db.get('SELECT COUNT(*) as count FROM stories', [], (err, storyCount) => {
        if (err) return console.error('❌ Digest job failed:', err.message);

        const statsMap = {};
        taskStats.forEach(row => { statsMap[row.status] = row.count; });

        const summary = JSON.stringify({
          generated_at: new Date().toISOString(),
          projects: projectCount.count,
          stories: storyCount.count,
          tasks: {
            todo: statsMap['todo'] || 0,
            in_progress: statsMap['in_progress'] || 0,
            done: statsMap['done'] || 0
          }
        });

        db.run('INSERT INTO digest_log (summary) VALUES (?)', [summary], (err) => {
          if (err) return console.error('❌ Digest save failed:', err.message);
          console.log(`📊 Digest generated at ${new Date().toLocaleTimeString()}`);
        });
      });
    });
  });
}

cron.schedule('* * * * *', generateDigest);
module.exports = { generateDigest };