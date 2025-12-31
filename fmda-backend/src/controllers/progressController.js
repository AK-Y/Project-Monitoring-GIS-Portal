const db = require("../config/db");

// Get progress summary (KPI cards data)
exports.getProgressSummary = async (req, res) => {
  try {
    const { workCategory, typeOfWork, status } = req.query;

    // Build WHERE clause for filters
    let whereClause = "WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (workCategory) {
      whereClause += ` AND work_category = $${paramCount}`;
      params.push(workCategory);
      paramCount++;
    }
    if (typeOfWork) {
      whereClause += ` AND type_of_work = $${paramCount}`;
      params.push(typeOfWork);
      paramCount++;
    }
    if (status) {
      whereClause += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_projects,
        COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_projects,
        COUNT(*) FILTER (WHERE status = 'ONGOING') as ongoing_projects,
        COUNT(*) FILTER (WHERE status = 'PENDING') as pending_projects,
        COUNT(*) FILTER (WHERE revised_completion_date IS NOT NULL) as delayed_projects,
        AVG(
          CASE 
            WHEN physical_progress ~ '^[0-9]+\.?[0-9]*%?$' 
            THEN CAST(REPLACE(physical_progress, '%', '') AS NUMERIC)
            ELSE 0 
          END
        ) as avg_progress
      FROM projects
      ${whereClause}
    `;

    const { rows } = await db.query(summaryQuery, params);
    const summary = rows[0];

    const totalProjects = parseInt(summary.total_projects) || 0;
    const completedProjects = parseInt(summary.completed_projects) || 0;
    const completionRate = totalProjects > 0 
      ? ((completedProjects / totalProjects) * 100).toFixed(2) 
      : 0;

    res.json({
      totalProjects: totalProjects,
      completedProjects: completedProjects,
      ongoingProjects: parseInt(summary.ongoing_projects) || 0,
      pendingProjects: parseInt(summary.pending_projects) || 0,
      delayedProjects: parseInt(summary.delayed_projects) || 0,
      completionRate: parseFloat(completionRate),
      averageProgress: parseFloat(summary.avg_progress || 0).toFixed(2)
    });
  } catch (err) {
    console.error("Error in getProgressSummary:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// Get detailed project progress data
exports.getProjectProgress = async (req, res) => {
  try {
    const { workCategory, typeOfWork, status, progressRange, timelineStatus } = req.query;

    let whereClause = "WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (workCategory) {
      whereClause += ` AND work_category = $${paramCount}`;
      params.push(workCategory);
      paramCount++;
    }
    if (typeOfWork) {
      whereClause += ` AND type_of_work = $${paramCount}`;
      params.push(typeOfWork);
      paramCount++;
    }
    if (status) {
      whereClause += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    const query = `
      SELECT 
        id,
        name_of_work,
        work_category,
        type_of_work,
        name_of_agency,
        status,
        physical_progress,
        financial_progress,
        start_date,
        completion_date,
        revised_completion_date,
        time_limit,
        dlp
      FROM projects
      ${whereClause}
      ORDER BY id DESC
    `;

    const { rows } = await db.query(query, params);

    // Calculate derived fields
    const projectsWithCalculations = rows.map(project => {
      // Extract numeric progress value
      const physicalProgressStr = project.physical_progress || '0';
      const physicalProgressNum = parseFloat(physicalProgressStr.replace('%', '')) || 0;

      // Calculate days remaining
      const targetDate = project.revised_completion_date || project.completion_date;
      const daysRemaining = targetDate 
        ? Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

      // Determine timeline status
      let timelineStatus = 'on-time';
      let timelineReason = 'On track';

      if (project.revised_completion_date) {
        timelineStatus = 'delayed';
        timelineReason = 'Revised completion date';
      } else if (daysRemaining !== null && daysRemaining < 0 && project.status !== 'COMPLETED') {
        timelineStatus = 'overdue';
        timelineReason = 'Past completion date';
      } else if (daysRemaining !== null && daysRemaining < 30 && physicalProgressNum < 75) {
        timelineStatus = 'at-risk';
        timelineReason = 'Approaching deadline with low progress';
      }

      // Determine progress status
      let progressStatus = 'good';
      if (physicalProgressNum < 25) progressStatus = 'critical';
      else if (physicalProgressNum < 50) progressStatus = 'low';
      else if (physicalProgressNum < 75) progressStatus = 'medium';

      return {
        ...project,
        physical_progress_num: physicalProgressNum,
        days_remaining: daysRemaining,
        timeline_status: timelineStatus,
        timeline_reason: timelineReason,
        progress_status: progressStatus,
        is_delayed: project.revised_completion_date !== null
      };
    });

    // Apply additional filters
    let filteredProjects = projectsWithCalculations;

    if (progressRange) {
      const [min, max] = progressRange.split('-').map(Number);
      filteredProjects = filteredProjects.filter(p => 
        p.physical_progress_num >= min && p.physical_progress_num <= max
      );
    }

    if (timelineStatus) {
      filteredProjects = filteredProjects.filter(p => p.timeline_status === timelineStatus);
    }

    res.json(filteredProjects);
  } catch (err) {
    console.error("Error in getProjectProgress:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// Get delayed/at-risk projects
exports.getDelayedProjects = async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        name_of_work,
        work_category,
        name_of_agency,
        status,
        physical_progress,
        start_date,
        completion_date,
        revised_completion_date,
        time_limit
      FROM projects
      WHERE status IN ('ONGOING', 'PENDING')
      ORDER BY id DESC
    `;

    const { rows } = await db.query(query);

    // Filter for delayed/at-risk projects
    const delayedProjects = rows
      .map(project => {
        const physicalProgressNum = parseFloat((project.physical_progress || '0').replace('%', '')) || 0;
        const targetDate = project.revised_completion_date || project.completion_date;
        const daysRemaining = targetDate 
          ? Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24))
          : null;

        return {
          ...project,
          physical_progress_num: physicalProgressNum,
          days_remaining: daysRemaining
        };
      })
      .filter(project => {
        // Delayed criteria
        const hasRevisedDate = project.revised_completion_date !== null;
        const isPastDue = project.days_remaining !== null && project.days_remaining < 0;
        const lowProgress = project.physical_progress_num < 25;
        const atRisk = project.days_remaining !== null && 
                       project.days_remaining < 30 && 
                       project.physical_progress_num < 75;

        return hasRevisedDate || isPastDue || lowProgress || atRisk;
      })
      .map(project => {
        const reasons = [];
        if (project.revised_completion_date) reasons.push('Revised completion date');
        if (project.days_remaining !== null && project.days_remaining < 0) reasons.push('Overdue');
        if (project.physical_progress_num < 25) reasons.push('Low progress');
        if (project.days_remaining !== null && 
            project.days_remaining < 30 && 
            project.physical_progress_num < 75) {
          reasons.push('At risk of delay');
        }

        return {
          ...project,
          delay_reasons: reasons
        };
      });

    res.json(delayedProjects);
  } catch (err) {
    console.error("Error in getDelayedProjects:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// Get progress trends from logs
exports.getProgressTrends = async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(updated_on, 'YYYY-MM') as month,
        AVG(physical_progress_percent) as avg_physical_progress,
        COUNT(DISTINCT project_id) as projects_updated
      FROM project_progress_log
      WHERE updated_on IS NOT NULL
      GROUP BY TO_CHAR(updated_on, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `;

    const { rows } = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error in getProgressTrends:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// Get progress distribution
exports.getProgressDistribution = async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        physical_progress,
        status
      FROM projects
      WHERE status IN ('ONGOING', 'PENDING')
    `;

    const { rows } = await db.query(query);

    // Categorize projects by progress
    const distribution = {
      '0-25': 0,
      '26-50': 0,
      '51-75': 0,
      '76-100': 0
    };

    const statusDistribution = {
      'ONGOING': 0,
      'COMPLETED': 0,
      'PENDING': 0
    };

    rows.forEach(project => {
      const progressNum = parseFloat((project.physical_progress || '0').replace('%', '')) || 0;

      if (progressNum <= 25) distribution['0-25']++;
      else if (progressNum <= 50) distribution['26-50']++;
      else if (progressNum <= 75) distribution['51-75']++;
      else distribution['76-100']++;
    });

    // Get status distribution for all projects
    const statusQuery = `
      SELECT status, COUNT(*) as count
      FROM projects
      GROUP BY status
    `;
    const statusResult = await db.query(statusQuery);
    statusResult.rows.forEach(row => {
      statusDistribution[row.status] = parseInt(row.count);
    });

    res.json({
      progressRanges: distribution,
      statusCounts: statusDistribution
    });
  } catch (err) {
    console.error("Error in getProgressDistribution:", err);
    res.status(500).json({ error: "Server Error" });
  }
};
