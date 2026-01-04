const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

// Progress Dashboard Routes - Publically Accessible
router.get('/summary', progressController.getProgressSummary);
router.get('/projects', progressController.getProjectProgress);
router.get('/delayed', progressController.getDelayedProjects);
router.get('/trends', progressController.getProgressTrends);
router.get('/distribution', progressController.getProgressDistribution);

module.exports = router;
