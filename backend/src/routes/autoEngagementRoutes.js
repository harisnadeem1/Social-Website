
const express = require('express');
const router = express.Router();
const {scheduleDay1Actions,generateRotationLoop,triggerDailyEngagements} = require('../controllers/autoEngagementController');
const {verifyToken} = require('../middleware/authMiddleware'); // ensure this validates the token

router.post('/rotation', verifyToken, generateRotationLoop);

router.post('/day1', verifyToken, scheduleDay1Actions);

router.post('/daily-engagement', triggerDailyEngagements); // No auth required for cron


module.exports = router;
