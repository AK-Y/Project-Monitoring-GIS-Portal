const db = require("../config/db");
const { getProjectTimeline } = require("../utils/timelineUtils");

exports.getAllProjects = async (req, res) => {
  try {
    const { status, typeOfWork, agency, search } = req.query;
    let query = `
      SELECT id, name_of_work, type_of_work, work_category, status, 
             name_of_agency, aa_amount, budget_during_year, 
             physical_progress, financial_progress, start_date, completion_date,
             revised_completion_date, dlp, project_uid,
             (SELECT array_agg(asset_id) FROM project_assets pa WHERE pa.project_id = projects.id) as asset_ids,
             (SELECT array_agg(asset_code) FROM project_asset_links pal WHERE pal.project_id = projects.id) as linked_asset_codes
      FROM projects 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (typeOfWork) {
      query += ` AND type_of_work ILIKE $${paramCount}`;
      params.push(`%${typeOfWork}%`);
      paramCount++;
    }

    if (agency) {
      query += ` AND name_of_agency ILIKE $${paramCount}`;
      params.push(`%${agency}%`);
      paramCount++;
    }

    if (search) {
      query += ` AND name_of_work ILIKE $${paramCount}`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC`;

    const { rows } = await db.query(query, params);
    
    // Add timeline data to each project
    const projectsWithTimeline = rows.map(project => ({
      ...project,
      timeline: getProjectTimeline(project)
    }));
    
    res.json(projectsWithTimeline);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Fetch Project Details
    const projectQuery = `SELECT * FROM projects WHERE id = $1`;
    const projectRes = await db.query(projectQuery, [id]);

    if (projectRes.rows.length === 0) {
      return res.status(404).json({ msg: "Project not found" });
    }

    const project = projectRes.rows[0];

    // 2. Fetch Associated Assets (Fallback to global inventory data if project-specific metadata is missing)
    const assetsQuery = `
      WITH project_links AS (
        SELECT asset_id::text FROM project_assets WHERE project_id = $1
        UNION
        SELECT a.id::text FROM assets a JOIN project_asset_links pal ON a.asset_code = pal.asset_code WHERE pal.project_id = $1
      )
      SELECT 
        a.id, 
        a.asset_code, 
        a.type as asset_type,
        COALESCE(pa.road_taken_over_from, inv.road_taken_over_from) as road_taken_over_from,
        COALESCE(pa.year_of_taken_over, inv.year_of_taken_over) as year_of_taken_over,
        COALESCE(pa.history_of_road, inv.history_of_road) as history_of_road,
        COALESCE(pa.start_point, inv.start_point) as start_point,
        COALESCE(pa.end_point, inv.end_point) as end_point,
        COALESCE(pa.length, inv.length, a.length::text) as length,
        COALESCE(pa.width_of_carriage_way, inv.width_of_carriage_way) as width_of_carriage_way,
        COALESCE(pa.width_of_central_verge, inv.width_of_central_verge) as width_of_central_verge,
        COALESCE(pa.width_of_footpath, inv.width_of_footpath) as width_of_footpath,
        COALESCE(pa.lhs_green_belt, inv.lhs_green_belt) as lhs_green_belt,
        COALESCE(pa.rhs_green_belt, inv.rhs_green_belt) as rhs_green_belt,
        COALESCE(pa.street_lights, inv.street_lights) as street_lights,
        COALESCE(pa.row_width, inv.row_width, a.width::text) as row_width,
        COALESCE(pa.type_of_road, inv.type_of_road, a.type) as type_of_road,
        COALESCE(pa.paved_portion_lhs, inv.paved_portion_lhs) as paved_portion_lhs,
        COALESCE(pa.paved_portion_rhs, inv.paved_portion_rhs) as paved_portion_rhs,
        COALESCE(pa.cross_section_of_road, inv.cross_section_of_road) as cross_section_of_road,
        COALESCE(pa.storm_water_drain_lhs, inv.storm_water_drain_lhs) as storm_water_drain_lhs,
        COALESCE(pa.storm_water_drain_rhs, inv.storm_water_drain_rhs) as storm_water_drain_rhs,
        COALESCE(pa.start_latitude, inv.start_latitude) as start_latitude,
        COALESCE(pa.start_longitude, inv.start_longitude) as start_longitude,
        COALESCE(pa.end_latitude, inv.end_latitude) as end_latitude,
        COALESCE(pa.end_longitude, inv.end_longitude) as end_longitude
      FROM assets a
      JOIN project_links pl ON a.id::text = pl.asset_id
      LEFT JOIN project_assets pa ON a.id::text = pa.asset_id::text AND pa.project_id = $1
      LEFT JOIN project_assets inv ON a.id::text = inv.asset_id::text AND inv.project_id IS NULL
    `;
    const assetsRes = await db.query(assetsQuery, [id]);

    // 3. Fetch Payments
    const payQuery = `SELECT * FROM payments WHERE project_id = $1 ORDER BY payment_date DESC`;
    const payRes = await db.query(payQuery, [id]);

    // 4. Fetch Progress Logs
    const progQuery = `SELECT * FROM project_progress_log WHERE project_id = $1 ORDER BY updated_on DESC`;
    const progRes = await db.query(progQuery, [id]);

    // 5. Fetch Linked Asset Codes (Manual) - Redundant but kept for frontend compatibility
    const linkQuery = `SELECT asset_code FROM project_asset_links WHERE project_id = $1`;
    const linkRes = await db.query(linkQuery, [id]);
    const linked_asset_codes = linkRes.rows.map(r => r.asset_code);

    // 6. Calculate timeline data
    const timeline = getProjectTimeline(project);

    res.json({
      project: {
        ...project,
        timeline,
        linked_asset_codes 
      },
      assets: assetsRes.rows,
      payments: payRes.rows,
      progress: progRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.getProjectsByAsset = async (req, res) => {
  const { assetId } = req.params;
  try {
    // 1. Get the asset_code for this asset ID
    const assetRes = await db.query('SELECT asset_code FROM assets WHERE id = $1', [assetId]);
    if (assetRes.rows.length === 0) {
      return res.json([]);
    }
    const assetCode = assetRes.rows[0].asset_code;

    // 2. Fetch projects that are linked EITHER via project_assets (legacy/detailed) 
    // OR via project_asset_links (many-to-many by code)
    const query = `
      SELECT DISTINCT ON (p.id)
        p.*, 
        pa.id as project_asset_id,
        pa.road_taken_over_from, pa.year_of_taken_over, pa.history_of_road,
        pa.start_point as pa_start_point, pa.end_point as pa_end_point,
        pa.length as pa_length, pa.width_of_carriage_way, pa.width_of_central_verge,
        pa.width_of_footpath, pa.lhs_green_belt, pa.rhs_green_belt,
        pa.street_lights, pa.row_width, pa.type_of_road,
        pa.paved_portion_lhs, pa.paved_portion_rhs,
        pa.cross_section_of_road, pa.storm_water_drain_lhs, pa.storm_water_drain_rhs,
        pa.start_latitude, pa.start_longitude, pa.end_latitude, pa.end_longitude
      FROM projects p
      LEFT JOIN project_assets pa ON p.id = pa.project_id AND pa.asset_id = $1
      LEFT JOIN project_asset_links pal ON p.id = pal.project_id
      WHERE pa.asset_id = $1 OR pal.asset_code = $2
    `;
    const { rows } = await db.query(query, [assetId, assetCode]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.addProgressLog = async (req, res) => {
  const { id } = req.params; // project_id
  const { physical_progress_percent, financial_progress_percent, remarks, updated_on } = req.body;

  try {
    // 1. Insert Log
    const insertQuery = `
      INSERT INTO project_progress_log 
      (project_id, physical_progress_percent, financial_progress_percent, remarks, updated_on)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const { rows } = await db.query(insertQuery, [
      id, 
      physical_progress_percent, 
      financial_progress_percent, 
      remarks, 
      updated_on || new Date()
    ]);

    // 2. Update Project Main Table
    // Convert percent to text for 'physical_progress' field as per schema
    const physicalText = physical_progress_percent ? `${physical_progress_percent}%` : null;
    const financialText = financial_progress_percent ? `${financial_progress_percent}%` : null;

    const updateProjectQuery = `
      UPDATE projects 
      SET physical_progress = $1, financial_progress = $2
      WHERE id = $3
    `;
    await db.query(updateProjectQuery, [physicalText, financialText, id]);

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.createProject = async (req, res) => {
  const client = await db.pool.connect(); // Use client for transaction
  try {
    const {
      name_of_work, type_of_work, work_category, name_of_agency,
      aa_amount, aa_date, dnit_amount, dnit_date,
      tender_date, allotment_date,
      budget_during_year, start_date, completion_date, revised_completion_date,
      time_limit, dlp,
      physical_progress, financial_progress,
      detail_of_payment, project_monitoring_by, project_category,
      project_uid, // Manual Project ID (Optional)
      project_asset_ids // Comma separated string: "A-101, A-102"
    } = req.body;

    await client.query('BEGIN');

    // Helper to handle empty strings for DB fields
    const toNull = (val) => (val === "" ? null : val);

    const insertProjectQuery = `
      INSERT INTO projects (
        name_of_work, type_of_work, work_category, name_of_agency,
        aa_amount, aa_date, dnit_amount, dnit_date,
        tender_date, allotment_date,
        budget_during_year, start_date, completion_date, revised_completion_date,
        time_limit, dlp,
        physical_progress, financial_progress,
        detail_of_payment, project_monitoring_by,
        status, project_category, project_uid
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 'ONGOING', $21, $22)
      RETURNING *
    `;
    
    const projectValues = [
      name_of_work, type_of_work, toNull(work_category), name_of_agency,
      toNull(aa_amount), toNull(aa_date), toNull(dnit_amount), toNull(dnit_date),
      toNull(tender_date), toNull(allotment_date),
      toNull(budget_during_year), toNull(start_date), toNull(completion_date), toNull(revised_completion_date),
      time_limit, dlp,
      physical_progress, financial_progress,
      detail_of_payment,
      project_monitoring_by,
      project_category || 'Infra-I',
      toNull(project_uid)
    ];

    const { rows: projectRows } = await client.query(insertProjectQuery, projectValues);
    const newProject = projectRows[0];

    // Handle Many-to-Many Asset Links
    if (project_asset_ids && typeof project_asset_ids === 'string') {
      const assetCodes = project_asset_ids.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      for (const code of assetCodes) {
        await client.query(
          `INSERT INTO project_asset_links (project_id, asset_code) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [newProject.id, code]
        );
      }
    }

    await client.query('COMMIT');
    res.json(newProject);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("CONTROLLER ERROR in createProject:", err);
    
    // Debug Logging to file
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(__dirname, '../../backend_error.log');
    const logMsg = `\n[${new Date().toISOString()}] CREATE PROJECT ERROR:\n${err.message}\n${err.stack}\nREQ BODY: ${JSON.stringify(req.body)}\n`;
    fs.appendFileSync(logPath, logMsg);

    res.status(500).send("Server Error: " + err.message);
  } finally {
    client.release();
  }
};

exports.addProjectAsset = async (req, res) => {
  const { id } = req.params; // project_id
  try {
    const {
      asset_id, road_taken_over_from, year_of_taken_over, history_of_road,
      start_point, start_latitude, start_longitude,
      end_point, end_latitude, end_longitude,
      length, width_of_carriage_way, width_of_central_verge, width_of_footpath,
      lhs_green_belt, rhs_green_belt, street_lights, row_width,
      type_of_road, paved_portion_lhs, paved_portion_rhs,
      cross_section_of_road, storm_water_drain_lhs, storm_water_drain_rhs,
      vertices
    } = req.body;

    const toNull = (val) => (val === "" ? null : val);

    const query = `
      INSERT INTO project_assets (
        project_id, asset_id, road_taken_over_from, year_of_taken_over, history_of_road,
        start_point, start_latitude, start_longitude,
        end_point, end_latitude, end_longitude,
        length, width_of_carriage_way, width_of_central_verge, width_of_footpath,
        lhs_green_belt, rhs_green_belt, street_lights, row_width,
        type_of_road, paved_portion_lhs, paved_portion_rhs,
        cross_section_of_road, storm_water_drain_lhs, storm_water_drain_rhs,
        vertices
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      RETURNING *
    `;

    const values = [
      id, toNull(asset_id), road_taken_over_from, toNull(year_of_taken_over), history_of_road,
      start_point, toNull(start_latitude), toNull(start_longitude),
      end_point, toNull(end_latitude), toNull(end_longitude),
      length, width_of_carriage_way, width_of_central_verge, width_of_footpath,
      lhs_green_belt, rhs_green_belt, street_lights, row_width,
      type_of_road, paved_portion_lhs, paved_portion_rhs,
      cross_section_of_road, storm_water_drain_lhs, storm_water_drain_rhs,
      JSON.stringify(vertices || [])
    ];

    const { rows } = await db.query(query, values);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.addPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { bill_no, payment_date, amount } = req.body;

    const toNull = (val) => (val === "" ? null : val);

    const query = `
      INSERT INTO payments (project_id, bill_no, payment_date, amount)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const { rows } = await db.query(query, [id, bill_no, toNull(payment_date), toNull(amount)]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        project_category,
        COUNT(*) as total_projects,
        COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_projects,
        COUNT(*) FILTER (WHERE status = 'ONGOING' OR status = 'PENDING') as ongoing_projects,
        SUM(aa_amount) as total_cost
      FROM projects
      GROUP BY project_category
    `;
    const { rows } = await db.query(query);
    
    const stats = {
      'Infra-I': { total: 0, completed: 0, ongoing: 0, cost: 0 },
      'Infra-II': { total: 0, completed: 0, ongoing: 0, cost: 0 },
      'Mobility': { total: 0, completed: 0, ongoing: 0, cost: 0 }
    };

    rows.forEach(row => {
      const cat = row.project_category || 'Infra-I';
      if (stats[cat]) {
        stats[cat] = {
          total: parseInt(row.total_projects),
          completed: parseInt(row.completed_projects),
          ongoing: parseInt(row.ongoing_projects),
          cost: parseFloat(row.total_cost || 0).toFixed(2)
        };
      }
    });

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const client = await db.pool.connect();
  
  try {
    const { 
      project_asset_ids, // Comma separated string: "A-101, A-102"
      ...fields 
    } = req.body;

    await client.query('BEGIN');
    const toNull = (val) => (val === "" ? null : val);

    // 1. Update Projects Table
    let query = "UPDATE projects SET ";
    const params = [];
    let i = 1;

    for (const [key, value] of Object.entries(fields)) {
      query += `${key} = $${i}, `;
      params.push(toNull(value));
      i++;
    }

    query = query.slice(0, -2); // Remove last comma
    query += ` WHERE id = $${i} RETURNING *`;
    params.push(id);

    const { rows } = await client.query(query, params);
    
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ msg: "Project not found" });
    }

    // 2. Handle Many-to-Many Asset Links (if provided)
    if (project_asset_ids !== undefined) {
      // First, delete existing links
      await client.query(`DELETE FROM project_asset_links WHERE project_id = $1`, [id]);

      // Then insert new ones
      if (typeof project_asset_ids === 'string' && project_asset_ids.trim().length > 0) {
        const assetCodes = project_asset_ids.split(',').map(s => s.trim()).filter(s => s.length > 0);
        
        for (const code of assetCodes) {
          await client.query(
            `INSERT INTO project_asset_links (project_id, asset_code) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [id, code]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.json(rows[0]);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("UPDATE ERROR:", err);
    res.status(500).send("Server Error: " + err.message);
  } finally {
    client.release();
  }
};

exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    // Manual cascading cleanup
    await db.query("DELETE FROM project_progress_log WHERE project_id = $1", [id]);
    await db.query("DELETE FROM project_assets WHERE project_id = $1", [id]);
    await db.query("DELETE FROM payments WHERE project_id = $1", [id]);
    
    const { rowCount } = await db.query("DELETE FROM projects WHERE id = $1", [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ msg: "Project not found" });
    }

    res.json({ msg: "Project deleted successfully", id });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).send("Server Error: " + err.message);
  }
};
exports.updateProjectAsset = async (req, res) => {
  const { assetId } = req.params;
  const fields = req.body;
  const toNull = (val) => (val === "" ? null : val);

  try {
    let query = "UPDATE project_assets SET ";
    const params = [];
    let i = 1;

    for (const [key, value] of Object.entries(fields)) {
      if (key === 'project_id' || key === 'id') continue;
      query += `${key} = $${i}, `;
      params.push(toNull(value));
      i++;
    }

    query = query.slice(0, -2);
    query += ` WHERE id = $${i} RETURNING *`;
    params.push(assetId);

    const { rows } = await db.query(query, params);
    
    if (rows.length === 0) {
      return res.status(404).json({ msg: "Asset not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("UPDATE ASSET ERROR:", err);
    res.status(500).send("Server Error: " + err.message);
  }
};

exports.deleteProjectAsset = async (req, res) => {
  const { assetId } = req.params;
  try {
    const { rowCount } = await db.query("DELETE FROM project_assets WHERE id = $1", [assetId]);
    
    if (rowCount === 0) {
      return res.status(404).json({ msg: "Asset not found" });
    }

    res.json({ msg: "Asset deleted successfully", id: assetId });
  } catch (err) {
    console.error("DELETE ASSET ERROR:", err);
    res.status(500).send("Server Error: " + err.message);
  }
};

exports.updatePayment = async (req, res) => {
  const { paymentId } = req.params;
  const fields = req.body;
  const toNull = (val) => (val === "" ? null : val);

  try {
    let query = "UPDATE payments SET ";
    const params = [];
    let i = 1;

    for (const [key, value] of Object.entries(fields)) {
      if (key === 'project_id' || key === 'id') continue;
      query += `${key} = $${i}, `;
      params.push(toNull(value));
      i++;
    }

    query = query.slice(0, -2);
    query += ` WHERE id = $${i} RETURNING *`;
    params.push(paymentId);

    const { rows } = await db.query(query, params);
    
    if (rows.length === 0) {
      return res.status(404).json({ msg: "Payment not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("UPDATE PAYMENT ERROR:", err);
    res.status(500).send("Server Error: " + err.message);
  }
};

exports.deletePayment = async (req, res) => {
  const { paymentId } = req.params;
  try {
    const { rowCount } = await db.query("DELETE FROM payments WHERE id = $1", [paymentId]);
    if (rowCount === 0) return res.status(404).json({ msg: "Payment not found" });
    res.json({ msg: "Payment deleted", id: paymentId });
  } catch (err) {
    console.error("DELETE PAYMENT ERROR:", err);
    res.status(500).send("Server Error: " + err.message);
  }
};

exports.updateProgressLog = async (req, res) => {
  const { progressId } = req.params;
  const fields = req.body;
  const toNull = (val) => (val === "" ? null : val);

  try {
    // 1. Get project ID before update
    const { rows: initial } = await db.query("SELECT project_id FROM project_progress_log WHERE id = $1", [progressId]);
    if (initial.length === 0) return res.status(404).json({ msg: "Progress log not found" });
    const projectId = initial[0].project_id;

    // 2. Perform Update
    let query = "UPDATE project_progress_log SET ";
    const params = [];
    let i = 1;

    for (const [key, value] of Object.entries(fields)) {
      if (key === 'project_id' || key === 'id') continue;
      query += `${key} = $${i}, `;
      params.push(toNull(value));
      i++;
    }

    query = query.slice(0, -2);
    query += ` WHERE id = $${i} RETURNING *`;
    params.push(progressId);

    const { rows } = await db.query(query, params);
    
    // 3. Sync with main projects table
    const { rows: latestLogs } = await db.query(
      "SELECT physical_progress_percent, financial_progress_percent FROM project_progress_log WHERE project_id = $1 ORDER BY updated_on DESC, created_at DESC LIMIT 1",
      [projectId]
    );

    if (latestLogs.length > 0) {
      const { physical_progress_percent: phys, financial_progress_percent: fin } = latestLogs[0];
      await db.query(
        "UPDATE projects SET physical_progress = $1, financial_progress = $2 WHERE id = $3",
        [`${phys}%`, `${fin}%`, projectId]
      );
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("UPDATE PROGRESS ERROR:", err);
    res.status(500).send("Server Error: " + err.message);
  }
};

exports.deleteProgressLog = async (req, res) => {
  const { progressId } = req.params;
  const logFile = "backend_debug.log";
  const fs = require('fs');
  const log = (msg) => fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);

  log(`ATTEMPTING TO DELETE PROGRESS LOG: ${progressId}`);
  try {
    // 1. Get project ID before deletion
    const { rows: initialRows } = await db.query("SELECT project_id FROM project_progress_log WHERE id = $1", [progressId]);
    
    if (initialRows.length === 0) {
      log(`DELETE FAILED: Progress log ${progressId} not found in DB.`);
      return res.status(404).json({ msg: "Progress log not found" });
    }
    
    const projectId = initialRows[0].project_id;
    log(`FOUND PROJECT ID: ${projectId} FOR LOG: ${progressId}`);

    // 2. Delete the log
    const delRes = await db.query("DELETE FROM project_progress_log WHERE id = $1", [progressId]);
    log(`DELETION SUCCESS. Rows affected: ${delRes.rowCount}`);

    // 3. Sync with projects table (use next latest log)
    log(`SYNCING PROJECT ${projectId}...`);
    const { rows: latestLogs } = await db.query(
      "SELECT physical_progress_percent, financial_progress_percent FROM project_progress_log WHERE project_id = $1 ORDER BY updated_on DESC, created_at DESC LIMIT 1",
      [projectId]
    );

    let phys = 0, fin = 0;
    if (latestLogs.length > 0) {
      phys = latestLogs[0].physical_progress_percent;
      fin = latestLogs[0].financial_progress_percent;
      log(`LATEST LOG FOUND: Phys ${phys}%, Fin ${fin}%`);
    } else {
      log(`NO REMAINING LOGS FOUND. Resetting to 0%`);
    }
    
    const upRes = await db.query(
      "UPDATE projects SET physical_progress = $1, financial_progress = $2 WHERE id = $3 RETURNING *",
      [`${phys}%`, `${fin}%`, projectId]
    );

    if (upRes.rows.length > 0) {
        log(`PROJECT UPDATED SUCCESSFULLY: ${JSON.stringify(upRes.rows[0])}`);
    } else {
        log(`PROJECT UPDATE FAILED: No project found with ID ${projectId}`);
    }

    res.json({ msg: "Progress log deleted", id: progressId });
  } catch (err) {
    log(`CRITICAL ERROR during deleteProgressLog: ${err.message}\nStack: ${err.stack}`);
    res.status(500).json({ error: err.message });
  }
};
