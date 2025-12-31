/**
 * Timeline & DLP Warning System Utilities
 * Handles date calculations and warning status determination
 */

/**
 * Parse DLP duration string to days
 * Examples: "5 Years" → 1825, "6 Months" → 180, "90 Days" → 90
 */
const parseDLPDuration = (dlpString) => {
  if (!dlpString) return 0;

  const str = dlpString.toLowerCase().trim();
  
  // Extract number
  const numberMatch = str.match(/(\d+)/);
  if (!numberMatch) return 0;
  
  const value = parseInt(numberMatch[1]);

  // Determine unit
  if (str.includes('year')) {
    return value * 365;
  } else if (str.includes('month')) {
    return value * 30;
  } else if (str.includes('day')) {
    return value;
  }

  return 0;
};

/**
 * Calculate days remaining until work completion
 * Uses revised_completion_date if available, otherwise completion_date
 */
const calculateWorkRemainingDays = (project) => {
  // Determine final work end date
  const finalEndDate = project.revised_completion_date || project.completion_date;
  
  if (!finalEndDate) {
    return {
      daysRemaining: null,
      finalDate: null,
      isRevised: false
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endDate = new Date(finalEndDate);
  endDate.setHours(0, 0, 0, 0);

  const diffTime = endDate - today;
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    daysRemaining,
    finalDate: finalEndDate,
    isRevised: !!project.revised_completion_date
  };
};

/**
 * Calculate days remaining until DLP expiration
 * DLP starts after work completion
 */
const calculateDLPRemainingDays = (project) => {
  // Parse DLP duration first
  const dlpDays = parseDLPDuration(project.dlp);
  if (dlpDays === 0) {
    return {
      daysRemaining: null,
      dlpStartDate: null,
      dlpEndDate: null,
      isActive: false,
      status: 'no-dlp'
    };
  }

  // For COMPLETED projects: DLP is active, count from completion date
  if (project.status === 'COMPLETED') {
    // DLP starts from actual completion date
    // Using revised_completion_date or completion_date as proxy for actual completion
    const dlpStartDate = new Date(project.revised_completion_date || project.completion_date);
    dlpStartDate.setHours(0, 0, 0, 0);

    // Calculate DLP end date
    const dlpEndDate = new Date(dlpStartDate);
    dlpEndDate.setDate(dlpEndDate.getDate() + dlpDays);

    // Calculate remaining days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = dlpEndDate - today;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      daysRemaining,
      dlpStartDate: dlpStartDate.toISOString().split('T')[0],
      dlpEndDate: dlpEndDate.toISOString().split('T')[0],
      isActive: true,
      dlpDurationDays: dlpDays,
      status: 'active'
    };
  }

  // For ONGOING projects: Show DLP preview (will start when work completes)
  if (project.status === 'ONGOING') {
    const plannedCompletionDate = project.revised_completion_date || project.completion_date;
    
    if (!plannedCompletionDate) {
      return {
        daysRemaining: null,
        dlpStartDate: null,
        dlpEndDate: null,
        isActive: false,
        status: 'no-date'
      };
    }

    // Calculate when DLP will start (after planned completion)
    const dlpStartDate = new Date(plannedCompletionDate);
    dlpStartDate.setHours(0, 0, 0, 0);

    // Calculate DLP end date
    const dlpEndDate = new Date(dlpStartDate);
    dlpEndDate.setDate(dlpEndDate.getDate() + dlpDays);

    return {
      daysRemaining: null, // Not counting yet
      dlpStartDate: dlpStartDate.toISOString().split('T')[0],
      dlpEndDate: dlpEndDate.toISOString().split('T')[0],
      isActive: false,
      dlpDurationDays: dlpDays,
      status: 'preview' // Preview mode for ongoing projects
    };
  }

  // For PENDING or other statuses
  return {
    daysRemaining: null,
    dlpStartDate: null,
    dlpEndDate: null,
    isActive: false,
    status: 'not-applicable'
  };
};

/**
 * Get work timeline warning status
 * Returns status, color, icon, and message
 */
const getWorkWarningStatus = (daysRemaining) => {
  if (daysRemaining === null) {
    return {
      status: 'unknown',
      color: 'gray',
      icon: '❓',
      message: 'No completion date set',
      badge: 'bg-gray-100 text-gray-700 border-gray-200'
    };
  }

  if (daysRemaining > 60) {
    return {
      status: 'on-track',
      color: 'green',
      icon: '🟢',
      message: `Work is on track – ${daysRemaining} days remaining`,
      badge: 'bg-green-100 text-green-700 border-green-200'
    };
  }

  if (daysRemaining >= 30) {
    return {
      status: 'attention',
      color: 'yellow',
      icon: '🟡',
      message: `Attention: ${daysRemaining} days left to complete`,
      badge: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
  }

  if (daysRemaining >= 1) {
    return {
      status: 'critical',
      color: 'red',
      icon: '🔴',
      message: `Critical: Only ${daysRemaining} days remaining`,
      badge: 'bg-red-100 text-red-700 border-red-200'
    };
  }

  if (daysRemaining === 0) {
    return {
      status: 'due-today',
      color: 'orange',
      icon: '⚠️',
      message: 'Due today – immediate action required',
      badge: 'bg-orange-100 text-orange-700 border-orange-200'
    };
  }

  // daysRemaining < 0
  const overdueDays = Math.abs(daysRemaining);
  return {
    status: 'overdue',
    color: 'dark-red',
    icon: '❌',
    message: `Overdue by ${overdueDays} days`,
    badge: 'bg-red-200 text-red-900 border-red-300'
  };
};

/**
 * Get DLP warning status
 * Returns status, color, icon, and message
 */
const getDLPWarningStatus = (daysRemaining, isActive, dlpStatus, dlpData) => {
  // No DLP defined
  if (dlpStatus === 'no-dlp') {
    return {
      status: 'no-dlp',
      color: 'gray',
      icon: '⚫',
      message: 'No DLP defined',
      badge: 'bg-gray-100 text-gray-700 border-gray-200'
    };
  }

  // No completion date for ongoing project
  if (dlpStatus === 'no-date') {
    return {
      status: 'no-date',
      color: 'gray',
      icon: '❓',
      message: 'No completion date set',
      badge: 'bg-gray-100 text-gray-700 border-gray-200'
    };
  }

  // Preview mode for ongoing projects
  if (dlpStatus === 'preview') {
    return {
      status: 'preview',
      color: 'blue',
      icon: '🔵',
      message: `DLP will start after work completion (${dlpData.dlpDurationDays} days)`,
      badge: 'bg-blue-100 text-blue-700 border-blue-200'
    };
  }

  // Not applicable (pending projects)
  if (dlpStatus === 'not-applicable' || daysRemaining === null) {
    return {
      status: 'not-applicable',
      color: 'gray',
      icon: '⚫',
      message: 'DLP not applicable',
      badge: 'bg-gray-100 text-gray-700 border-gray-200'
    };
  }

  // Active DLP for completed projects
  if (daysRemaining > 90) {
    return {
      status: 'active',
      color: 'green',
      icon: '🟢',
      message: `DLP active – ${daysRemaining} days remaining`,
      badge: 'bg-green-100 text-green-700 border-green-200'
    };
  }

  if (daysRemaining >= 30) {
    return {
      status: 'expiring-soon',
      color: 'yellow',
      icon: '🟡',
      message: `Warning: DLP expires in ${daysRemaining} days`,
      badge: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
  }

  if (daysRemaining >= 1) {
    return {
      status: 'critical',
      color: 'red',
      icon: '🔴',
      message: `Critical: DLP expires in ${daysRemaining} days`,
      badge: 'bg-red-100 text-red-700 border-red-200'
    };
  }

  if (daysRemaining === 0) {
    return {
      status: 'ends-today',
      color: 'orange',
      icon: '⚠️',
      message: 'DLP ends today',
      badge: 'bg-orange-100 text-orange-700 border-orange-200'
    };
  }

  // daysRemaining < 0
  const expiredDays = Math.abs(daysRemaining);
  return {
    status: 'expired',
    color: 'gray',
    icon: '⚫',
    message: `DLP expired ${expiredDays} days ago – contractor liability ended`,
    badge: 'bg-gray-200 text-gray-800 border-gray-300'
  };
};

/**
 * Get complete timeline data for a project
 * Combines work and DLP calculations
 */
const getProjectTimeline = (project) => {
  const workData = calculateWorkRemainingDays(project);
  const workWarning = getWorkWarningStatus(workData.daysRemaining);

  const dlpData = calculateDLPRemainingDays(project);
  const dlpWarning = getDLPWarningStatus(
    dlpData.daysRemaining, 
    dlpData.isActive, 
    dlpData.status,
    dlpData
  );

  return {
    work: {
      ...workData,
      ...workWarning
    },
    dlp: {
      ...dlpData,
      ...dlpWarning
    }
  };
};

module.exports = {
  parseDLPDuration,
  calculateWorkRemainingDays,
  calculateDLPRemainingDays,
  getWorkWarningStatus,
  getDLPWarningStatus,
  getProjectTimeline
};
