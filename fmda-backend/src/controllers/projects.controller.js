const pool = require("../config/db");

// All projects under one asset (MAP CLICK / DASHBOARD)
exports.getProjectsByAsset = async (req, res) => {
  try {
    const { assetId } = req.params;

    res.set("Cache-Control", "no-store");

    const result = await pool.query(
      "SELECT * FROM projects WHERE asset_id = $1",
      [assetId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Full project detail (with payments)
exports.getProjectDetail = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await pool.query("SELECT * FROM projects WHERE id = $1", [
      projectId,
    ]);

    const payments = await pool.query(
      "SELECT * FROM payments WHERE project_id = $1",
      [projectId]
    );

    const progress = await pool.query(
      "SELECT * FROM project_progress_log WHERE project_id = $1",
      [projectId]
    );

    res.json({
      project: project.rows[0],
      payments: payments.rows,
      progress: progress.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const { status, type } = req.query;

    let query = `
      SELECT 
        id,
        asset_id,
        name_of_work,
        type_of_work,
        status,
        budget_during_year
      FROM projects
      WHERE 1=1
    `;

    const values = [];

    if (status && status !== "") {
      values.push(status);
      query += ` AND status = $${values.length}`;
    }

    if (type && type !== "") {
      values.push(type);
      query += ` AND type_of_work = $${values.length}`;
    }

    query += " ORDER BY id DESC";

    const result = await pool.query(query, values);

    res.set("Cache-Control", "no-store");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
