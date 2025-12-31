const db = require('./src/config/db');
db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'projects'")
  .then(r => {
    const cols = r.rows.map(c => c.column_name);
    console.log(JSON.stringify(cols));
    process.exit(0);
  });
