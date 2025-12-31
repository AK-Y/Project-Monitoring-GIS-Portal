const db = require("../config/db");

// Get financial summary (KPI cards data)
exports.getFinancialSummary = async (req, res) => {
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
        COUNT(*) FILTER (WHERE status = 'ONGOING') as ongoing_projects,
        COALESCE(SUM(aa_amount), 0) as total_approved,
        COALESCE(SUM(budget_during_year), 0) as total_budget_year
      FROM projects
      ${whereClause}
    `;

    // Get total paid amount from payments table
    const paymentsQuery = `
      SELECT COALESCE(SUM(p.amount), 0) as total_paid
      FROM payments p
      INNER JOIN projects pr ON p.project_id = pr.id
      ${whereClause.replace('WHERE 1=1', 'WHERE 1=1')}
    `;

    const [summaryResult, paymentsResult] = await Promise.all([
      db.query(summaryQuery, params),
      db.query(paymentsQuery, params)
    ]);

    const summary = summaryResult.rows[0];
    const totalPaid = parseFloat(paymentsResult.rows[0].total_paid) || 0;
    const totalApproved = parseFloat(summary.total_approved) || 0;
    const totalPending = totalApproved - totalPaid;
    const overallProgress = totalApproved > 0 ? ((totalPaid / totalApproved) * 100).toFixed(2) : 0;

    res.json({
      totalProjects: parseInt(summary.total_projects),
      ongoingProjects: parseInt(summary.ongoing_projects),
      totalApproved: totalApproved,
      totalPaid: totalPaid,
      totalPending: totalPending,
      overallFinancialProgress: parseFloat(overallProgress)
    });
  } catch (err) {
    console.error("Error in getFinancialSummary:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// Get detailed project financial data
exports.getProjectFinancials = async (req, res) => {
  try {
    const { workCategory, typeOfWork, status, riskLevel } = req.query;

    let whereClause = "WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (workCategory) {
      whereClause += ` AND p.work_category = $${paramCount}`;
      params.push(workCategory);
      paramCount++;
    }
    if (typeOfWork) {
      whereClause += ` AND p.type_of_work = $${paramCount}`;
      params.push(typeOfWork);
      paramCount++;
    }
    if (status) {
      whereClause += ` AND p.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    const query = `
      SELECT 
        p.id,
        p.name_of_work,
        p.work_category,
        p.type_of_work,
        p.name_of_agency,
        p.status,
        p.aa_amount as approved_amount,
        p.physical_progress,
        p.financial_progress,
        p.completion_date,
        p.revised_completion_date,
        COALESCE((
          SELECT SUM(amount) 
          FROM payments 
          WHERE project_id = p.id
        ), 0) as paid_amount
      FROM projects p
      ${whereClause}
      ORDER BY p.id DESC
    `;

    const { rows } = await db.query(query, params);

    // Calculate derived fields and risk levels
    const projectsWithCalculations = rows.map(project => {
      const approvedAmount = parseFloat(project.approved_amount) || 0;
      const paidAmount = parseFloat(project.paid_amount) || 0;
      const pendingAmount = approvedAmount - paidAmount;
      const calculatedFinancialProgress = approvedAmount > 0 
        ? ((paidAmount / approvedAmount) * 100).toFixed(2) 
        : 0;

      // Extract numeric values from progress strings (e.g., "75%" -> 75)
      const physicalProgressNum = parseFloat(project.physical_progress) || 0;
      const financialProgressNum = parseFloat(calculatedFinancialProgress);

      // Determine risk level
      let riskLevel = 'low';
      let riskReason = [];

      // High risk: Financial progress significantly exceeds physical progress
      if (financialProgressNum > physicalProgressNum + 10) {
        riskLevel = 'high';
        riskReason.push('Overpayment risk');
      }

      // Medium risk: Has revised completion date or high pending amount
      if (project.revised_completion_date) {
        if (riskLevel !== 'high') riskLevel = 'medium';
        riskReason.push('Delayed project');
      }

      if (pendingAmount > approvedAmount * 0.5 && project.status === 'ONGOING') {
        if (riskLevel !== 'high') riskLevel = 'medium';
        riskReason.push('High pending amount');
      }

      return {
        ...project,
        approved_amount: approvedAmount,
        paid_amount: paidAmount,
        pending_amount: pendingAmount,
        calculated_financial_progress: parseFloat(calculatedFinancialProgress),
        physical_progress_num: physicalProgressNum,
        risk_level: riskLevel,
        risk_reason: riskReason.join(', ') || 'On track'
      };
    });

    // Apply risk level filter if provided
    let filteredProjects = projectsWithCalculations;
    if (riskLevel) {
      filteredProjects = projectsWithCalculations.filter(p => p.risk_level === riskLevel);
    }

    res.json(filteredProjects);
  } catch (err) {
    console.error("Error in getProjectFinancials:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// Get high-risk projects
exports.getRiskProjects = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.name_of_work,
        p.work_category,
        p.name_of_agency,
        p.status,
        p.aa_amount as approved_amount,
        p.physical_progress,
        p.revised_completion_date,
        COALESCE((
          SELECT SUM(amount) 
          FROM payments 
          WHERE project_id = p.id
        ), 0) as paid_amount
      FROM projects p
      WHERE p.status = 'ONGOING'
      ORDER BY p.id DESC
    `;

    const { rows } = await db.query(query);

    // Filter for high-risk projects
    const riskProjects = rows
      .map(project => {
        const approvedAmount = parseFloat(project.approved_amount) || 0;
        const paidAmount = parseFloat(project.paid_amount) || 0;
        const pendingAmount = approvedAmount - paidAmount;
        const financialProgress = approvedAmount > 0 
          ? ((paidAmount / approvedAmount) * 100).toFixed(2) 
          : 0;
        const physicalProgressNum = parseFloat(project.physical_progress) || 0;

        return {
          ...project,
          approved_amount: approvedAmount,
          paid_amount: paidAmount,
          pending_amount: pendingAmount,
          financial_progress: parseFloat(financialProgress),
          physical_progress_num: physicalProgressNum
        };
      })
      .filter(project => {
        // High risk criteria
        const hasOverpayment = project.financial_progress > project.physical_progress_num + 10;
        const hasDelay = project.revised_completion_date !== null;
        const lowProgress = project.financial_progress < 25;
        const highPending = project.pending_amount > project.approved_amount * 0.75;

        return hasOverpayment || hasDelay || lowProgress || highPending;
      })
      .map(project => {
        const reasons = [];
        if (project.financial_progress > project.physical_progress_num + 10) {
          reasons.push('Overpayment risk');
        }
        if (project.revised_completion_date) {
          reasons.push('Project delayed');
        }
        if (project.financial_progress < 25) {
          reasons.push('Low financial progress');
        }
        if (project.pending_amount > project.approved_amount * 0.75) {
          reasons.push('High pending payment');
        }

        return {
          ...project,
          risk_reasons: reasons
        };
      });

    res.json(riskProjects);
  } catch (err) {
    console.error("Error in getRiskProjects:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// Get payment trends (monthly aggregation)
exports.getPaymentTrends = async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(payment_date, 'YYYY-MM') as month,
        COUNT(*) as payment_count,
        SUM(amount) as total_amount
      FROM payments
      WHERE payment_date IS NOT NULL
      GROUP BY TO_CHAR(payment_date, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `;

    const { rows } = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error in getPaymentTrends:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// Get financial progress distribution
exports.getProgressDistribution = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.aa_amount as approved_amount,
        COALESCE((
          SELECT SUM(amount) 
          FROM payments 
          WHERE project_id = p.id
        ), 0) as paid_amount
      FROM projects p
      WHERE p.status = 'ONGOING'
    `;

    const { rows } = await db.query(query);

    // Categorize projects by financial progress
    const distribution = {
      '0-25': 0,
      '26-50': 0,
      '51-75': 0,
      '76-100': 0
    };

    rows.forEach(project => {
      const approvedAmount = parseFloat(project.approved_amount) || 0;
      const paidAmount = parseFloat(project.paid_amount) || 0;
      const progress = approvedAmount > 0 ? (paidAmount / approvedAmount) * 100 : 0;

      if (progress <= 25) distribution['0-25']++;
      else if (progress <= 50) distribution['26-50']++;
      else if (progress <= 75) distribution['51-75']++;
      else distribution['76-100']++;
    });

    res.json(distribution);
  } catch (err) {
    console.error("Error in getProgressDistribution:", err);
    res.status(500).json({ error: "Server Error" });
  }
};
