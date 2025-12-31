const db = require('./src/config/db');

async function cleanup() {
  try {
    await db.query('BEGIN');
    console.log('Starting cleanup...');

    // 1. Clear ID 1 child data
    console.log('Clearing old Project 1 (Test) child details...');
    await db.query('DELETE FROM project_progress_log WHERE project_id = 1');
    await db.query('DELETE FROM project_assets WHERE project_id = 1');
    await db.query('DELETE FROM payments WHERE project_id = 1');

    // 2. Copy Project 2 details into Project 1
    console.log('Copying Project 2 details into ID 1...');
    const { rows: p2Rows } = await db.query('SELECT * FROM projects WHERE id = 2');
    if (p2Rows.length > 0) {
      const p2 = p2Rows[0];
      const updateQuery = `
        UPDATE projects SET 
          type_of_work = $1, name_of_work = $2, aa_amount = $3, aa_date = $4,
          dnit_amount = $5, dnit_date = $6, tender_date = $7, allotment_date = $8,
          name_of_agency = $9, start_date = $10, time_limit = $11, dlp = $12,
          completion_date = $13, revised_completion_date = $14,
          budget_during_year = $15, physical_progress = $16,
          financial_progress = $17, detail_of_payment = $18,
          project_monitoring_by = $19, status = $20, project_category = $21
        WHERE id = 1
      `;
      await db.query(updateQuery, [
        p2.type_of_work, p2.name_of_work, p2.aa_amount, p2.aa_date,
        p2.dnit_amount, p2.dnit_date, p2.tender_date, p2.allotment_date,
        p2.name_of_agency, p2.start_date, p2.time_limit, p2.dlp,
        p2.completion_date, p2.revised_completion_date,
        p2.budget_during_year, p2.physical_progress,
        p2.financial_progress, p2.detail_of_payment,
        p2.project_monitoring_by, p2.status, p2.project_category
      ]);

      // 3. Move child records from 2 to 1
      console.log('Moving child records from ID 2 to ID 1...');
      await db.query('UPDATE project_assets SET project_id = 1 WHERE project_id = 2');
      await db.query('UPDATE project_progress_log SET project_id = 1 WHERE project_id = 2');
      await db.query('UPDATE payments SET project_id = 1 WHERE project_id = 2');

      // 4. Delete Project 2
      console.log('Deleting ID 2...');
      await db.query('DELETE FROM projects WHERE id = 2');
    } else {
      console.log('Project 2 not found, only deleted Project 1 data.');
      await db.query('DELETE FROM projects WHERE id = 1');
    }

    // 5. Reset Sequence
    await db.query("SELECT setval('projects_id_seq', (SELECT COALESCE(MAX(id), 0) FROM projects))");
    
    await db.query('COMMIT');
    console.log('Cleanup and Re-indexing completed successfully.');
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('ERROR DURING CLEANUP:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
  } finally {
    process.exit(0);
  }
}

cleanup();
