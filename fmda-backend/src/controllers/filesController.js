const db = require("../config/db");

// 1. Create a new File (JE only)
exports.createFile = async (req, res) => {
  const { name_of_work, type_of_work, work_category, project_category } = req.body;
  const created_by = req.user.id;
  const role = req.user.role;

  try {
    const query = `
      INSERT INTO project_files (name_of_work, type_of_work, work_category, project_category, created_by, current_holder_id, current_holder_role)
      VALUES ($1, $2, $3, $4, $5, $5, $6)
      RETURNING *
    `;
    const { rows } = await db.query(query, [name_of_work, type_of_work, work_category, project_category || 'Infra-I', created_by, role]);
    
    // Create initial empty estimate
    await db.query(`INSERT INTO estimate_master (file_id) VALUES ($1)`, [rows[0].id]);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// 2. Get all files accessible to the current user/role
exports.getFiles = async (req, res) => {
  const { role, id: userId } = req.user;
  
  try {
    let query = `
      SELECT pf.*, u.username as creator_name
      FROM project_files pf
      JOIN users u ON pf.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // Filter logic:
    // JEs see files they created or currently hold
    // Higher roles see files where they are the current_holder_role or have been in the movement log
    if (role === 'JE') {
      query += ` AND (pf.created_by = $1 OR pf.current_holder_id = $1)`;
      params.push(userId);
    } else if (role !== 'ADMIN') {
      query += ` AND (pf.current_holder_role = $1 OR EXISTS (SELECT 1 FROM file_movement_logs fml WHERE fml.file_id = pf.id AND (fml.from_user_id = $2 OR fml.to_user_id = $2)))`;
      params.push(role, userId);
    }
    // Admin sees everything

    query += ` ORDER BY pf.updated_at DESC`;
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// 3. Get File Detail (inc Estimate and Assets)
exports.getFileById = async (req, res) => {
  const { id } = req.params;
  try {
    const fileRes = await db.query(`SELECT pf.*, u.username as creator_name FROM project_files pf JOIN users u ON pf.created_by = u.id WHERE pf.id = $1`, [id]);
    if (fileRes.rows.length === 0) return res.status(404).json({ msg: "File not found" });

    const estimateRes = await db.query(`SELECT em.*, (SELECT json_agg(ei) FROM estimate_items ei WHERE ei.estimate_id = em.id) as items FROM estimate_master em WHERE em.file_id = $1 AND em.is_active = TRUE`, [id]);
    const assetsRes = await db.query(`SELECT * FROM file_assets WHERE file_id = $1`, [id]);
    const logsRes = await db.query(`
      SELECT fml.*, u1.username as from_user, u2.username as to_user 
      FROM file_movement_logs fml
      LEFT JOIN users u1 ON fml.from_user_id = u1.id
      LEFT JOIN users u2 ON fml.to_user_id = u2.id
      WHERE file_id = $1 ORDER BY created_at ASC
    `, [id]);

    res.json({
      file: fileRes.rows[0],
      estimate: estimateRes.rows[0] || null,
      assets: assetsRes.rows,
      timeline: logsRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// 4. Forward File
exports.forwardFile = async (req, res) => {
  const { id } = req.params;
  const { to_user_id, to_role, remarks } = req.body;
  const from_user_id = req.user.id;
  const from_role = req.user.role;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // VALIDATION: Check if file has estimate and assets before forwarding
    const { rows: fileCheck } = await client.query(`
      SELECT estimated_amount, (SELECT COUNT(*) FROM file_assets WHERE file_id = $1) as asset_count 
      FROM project_files WHERE id = $1
    `, [id]);

    if (fileCheck[0].estimated_amount <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ msg: "Cannot forward file with zero estimated amount. Please update estimate first." });
    }
    if (fileCheck[0].asset_count === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ msg: "Cannot forward file without assets. Please propose assets on the map first." });
    }

    // Update Project File
    await client.query(
      `UPDATE project_files SET current_holder_id = $1, current_holder_role = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
      [to_user_id || null, to_role, id]
    );

    // Log movement
    await client.query(
      `INSERT INTO file_movement_logs (file_id, from_user_id, to_user_id, from_role, to_role, action, remarks)
       VALUES ($1, $2, $3, $4, $5, 'FORWARD', $6)`,
      [id, from_user_id, to_user_id || null, from_role, to_role, remarks]
    );

    await client.query('COMMIT');
    res.json({ msg: "File forwarded successfully" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send("Server Error");
  } finally {
    client.release();
  }
};

// 5. Approve File (Final Approval by CEO)
exports.approveFile = async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;
  const from_user_id = req.user.id;
  const from_role = req.user.role;

  if (from_role !== 'ADMIN' && from_role !== 'CEO') {
    return res.status(403).json({ msg: "Only CEO can approve files" });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // VALIDATION: Check if file has estimate and assets before approving
    const { rows: fileCheck } = await client.query(`
      SELECT estimated_amount, (SELECT COUNT(*) FROM file_assets WHERE file_id = $1) as asset_count 
      FROM project_files WHERE id = $1
    `, [id]);

    if (!fileCheck[0] || fileCheck[0].estimated_amount <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ msg: "Cannot approve file with zero estimated amount." });
    }
    if (fileCheck[0].asset_count === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ msg: "Cannot approve file without assets." });
    }

    // 1. Update File Status
    const { rows: fileRows } = await client.query(
      `UPDATE project_files SET status = 'APPROVED', current_holder_id = NULL, current_holder_role = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );
    const file = fileRows[0];

    // 2. Log Approval
    await client.query(
      `INSERT INTO file_movement_logs (file_id, from_user_id, action, remarks)
       VALUES ($1, $2, 'APPROVE', $3)`,
      [id, from_user_id, remarks]
    );

    // 3. AUTO-CONVERSION: Create Work (Project)
    const insertWorkQuery = `
      INSERT INTO projects (
        name_of_work, type_of_work, work_category, project_category, 
        aa_amount, status, file_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, 'ONGOING', $6, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    const { rows: workRows } = await client.query(insertWorkQuery, [
      file.name_of_work, file.type_of_work, file.work_category, file.project_category,
      file.estimated_amount, file.id
    ]);
    const newProjectId = workRows[0].id;

    // 4. Bind Assets (file_assets -> project_assets)
    const fileAssets = await client.query(`SELECT * FROM file_assets WHERE file_id = $1`, [id]);
    for (const fa of fileAssets.rows) {
      await client.query(`
        INSERT INTO project_assets (
          project_id, asset_id, start_latitude, start_longitude, end_latitude, end_longitude, vertices
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [newProjectId, fa.asset_id, fa.start_latitude, fa.start_longitude, fa.end_latitude, fa.end_longitude, fa.location_data]);
    }

    await client.query('COMMIT');
    res.json({ msg: "File approved and Work created", projectId: newProjectId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send("Server Error");
  } finally {
    client.release();
  }
};

// 6. Return File
exports.returnFile = async (req, res) => {
  const { id } = req.params;
  const { to_user_id, to_role, remarks } = req.body;
  const from_user_id = req.user.id;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE project_files SET current_holder_id = $1, current_holder_role = $2, status = 'RETURNED', updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
      [to_user_id, to_role, id]
    );

    await client.query(
      `INSERT INTO file_movement_logs (file_id, from_user_id, to_user_id, to_role, action, remarks)
       VALUES ($1, $2, $3, $4, 'RETURN', $5)`,
      [id, from_user_id, to_user_id, to_role, remarks]
    );

    await client.query('COMMIT');
    res.json({ msg: "File returned successfully" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send("Server Error");
  } finally {
    client.release();
  }
};

// 7. Estimate Management
exports.updateEstimate = async (req, res) => {
  const { id } = req.params; // file_id
  const { items } = req.body; // Array of { description, quantity, unit, rate, amount }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Get active estimate_id
    const estRes = await client.query(`SELECT id FROM estimate_master WHERE file_id = $1 AND is_active = TRUE`, [id]);
    if (estRes.rows.length === 0) return res.status(404).json({ msg: "Estimate not found" });
    const estId = estRes.rows[0].id;

    // Clear old items
    await client.query(`DELETE FROM estimate_items WHERE estimate_id = $1`, [estId]);

    // Insert new items and calc total
    let totalAmt = 0;
    for (const item of items) {
      const amt = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0);
      totalAmt += amt;
      await client.query(`
        INSERT INTO estimate_items (estimate_id, description, quantity, unit, rate, amount)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [estId, item.description, item.quantity, item.unit, item.rate, amt]);
    }

    // Update totals
    await client.query(`UPDATE estimate_master SET total_amount = $1 WHERE id = $2`, [totalAmt, estId]);
    await client.query(`UPDATE project_files SET estimated_amount = $1 WHERE id = $2`, [totalAmt, id]);

    await client.query('COMMIT');
    res.json({ msg: "Estimate updated", total: totalAmt });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send("Server Error");
  } finally {
    client.release();
  }
};

// 8. Asset Proposal
exports.updateProposedAssets = async (req, res) => {
  const { id } = req.params; // file_id
  const { assets } = req.body; // Array of { asset_id, start_lat, start_lng, end_lat, end_lng, vertices }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`DELETE FROM file_assets WHERE file_id = $1`, [id]);

    for (const asset of assets) {
      await client.query(`
        INSERT INTO file_assets (file_id, asset_id, start_latitude, start_longitude, end_latitude, end_longitude, location_data)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [id, asset.asset_id, asset.start_latitude, asset.start_longitude, asset.end_latitude, asset.end_longitude, JSON.stringify(asset.vertices || [])]);
    }

    await client.query('COMMIT');
    res.json({ msg: "Proposed assets updated" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send("Server Error");
  } finally {
    client.release();
  }
};

// 9. Admin edit file metadata
exports.updateFile = async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ msg: "Admin only" });
  
  const { id } = req.params;
  const { name_of_work, type_of_work, work_category, project_category } = req.body;
  
  try {
    await db.query(
      `UPDATE project_files SET name_of_work = $1, type_of_work = $2, work_category = $3, project_category = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5`,
      [name_of_work, type_of_work, work_category, project_category, id]
    );
    res.json({ msg: "File metadata updated" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// 10. Admin delete file
exports.deleteFile = async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ msg: "Admin only" });
  
  const { id } = req.params;
  
  try {
    await db.query(`DELETE FROM project_files WHERE id = $1`, [id]);
    res.json({ msg: "File deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
