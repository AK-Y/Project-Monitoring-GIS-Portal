const db = require("./src/config/db");

async function check() {
  try {
    const query = `SELECT id, asset_code FROM assets LIMIT 1`;
    const { rows } = await db.query(query);
    console.log("BASE_ASSET:" + JSON.stringify(rows));
    process.exit(0);
  } catch (err) {
    console.error("QUERY_ERROR:", err.message);
    process.exit(1);
  }
}
check();
