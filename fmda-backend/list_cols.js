const db = require('./src/config/db');
db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'projects'")
  .then(r => {
    console.log(r.rows.map(c => c.column_name).join(', '));
    process.exit(0);
  });
