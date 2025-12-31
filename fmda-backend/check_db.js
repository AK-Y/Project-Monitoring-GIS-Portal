const db = require("./src/config/db");

async function check() {
  try {
    console.log("--- ASSETS COUNT ---");
    const { rows: assets } = await db.query("SELECT COUNT(*) FROM assets");
    console.log("Total Assets in Master:", assets[0].count);

    console.log("\n--- PROJECT ASSETS WITHOUT GEOM IN MASTER ---");
    const { rows: orphans } = await db.query(`
      SELECT pa.id, pa.asset_id, pa.project_id, pa.start_latitude, pa.end_latitude 
      FROM project_assets pa
      LEFT JOIN assets a ON pa.asset_id = a.id
      WHERE a.geom IS NULL OR a.id IS NULL
      LIMIT 5
    `);
    console.log("Project Assets with missing/null master geom:", orphans);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
