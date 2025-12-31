const db = require("./src/config/db");

async function audit() {
  try {
    const projectId = 2;
    const { rows: proj } = await db.query("SELECT aa_amount, dnit_amount, budget_during_year FROM projects WHERE id = $1", [projectId]);
    const { rows: pay } = await db.query("SELECT SUM(amount) as total FROM payments WHERE project_id = $1", [projectId]);
    
    const p = proj[0];
    console.log(`DATA_START: AA=${p.aa_amount}, DNIT=${p.dnit_amount}, Budget=${p.budget_during_year}, TotalPaid=${pay[0].total} :DATA_END`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

audit();
