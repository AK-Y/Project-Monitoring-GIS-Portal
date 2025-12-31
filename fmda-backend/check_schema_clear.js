const db = require("./src/config/db");

async function check() {
  try {
    const { rows: assetsCols } = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'assets'");
    const { rows: paCols } = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'project_assets'");
    
    console.log("--- ASSETS ---");
    assetsCols.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));
    
    console.log("\n--- PROJECT_ASSETS ---");
    paCols.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
