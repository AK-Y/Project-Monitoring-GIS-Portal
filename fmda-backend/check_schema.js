const db = require("./src/config/db");

async function check() {
  try {
    const { rows: assetsCols } = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'assets'");
    const { rows: paCols } = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'project_assets'");
    
    console.log("ASSETS_COLUMNS:" + JSON.stringify(assetsCols));
    console.log("PROJECT_ASSETS_COLUMNS:" + JSON.stringify(paCols));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
