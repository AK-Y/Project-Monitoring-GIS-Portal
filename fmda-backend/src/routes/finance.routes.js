const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');

// Finance Dashboard Routes
router.get('/summary', financeController.getFinancialSummary);
router.get('/projects', financeController.getProjectFinancials);
router.get('/risk-projects', financeController.getRiskProjects);
router.get('/trends', financeController.getPaymentTrends);
router.get('/distribution', financeController.getProgressDistribution);

module.exports = router;
