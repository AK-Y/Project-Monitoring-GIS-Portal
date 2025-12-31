const db = require("./src/config/db");

async function check() {
  try {
    const table = process.argv[2] || 'assets';
    const { rows } = await db.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [table]);
    
    console.log(`--- ${table.toUpperCase()} ---`);
    rows.forEach(r => {
      console.log(`COLUMN: ${r.column_name.padEnd(20)} | TYPE: ${r.data_type.padEnd(30)} | UDT: ${r.udt_name}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
