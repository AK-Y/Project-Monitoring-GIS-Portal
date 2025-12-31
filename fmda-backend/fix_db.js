const db = require("./src/config/db");

async function fix() {
  try {
    const projectId = 2; // Based on dump
    console.log("Attempting manual sync for project", projectId);
    
    const res = await db.query(
      "UPDATE projects SET physical_progress = $1, financial_progress = $2 WHERE id = $3 RETURNING *",
      ['0%', '0%', projectId]
    );
    
    console.log("UPDATE RESULT:", JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("FIX FAILED:", err);
    process.exit(1);
  }
}

fix();
