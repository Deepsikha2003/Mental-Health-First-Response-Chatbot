const router = require('express').Router()
const { saveMood, getHistory, getStats } = require('../controllers/moodController')
const protect = require('../middleware/auth')

router.post('/log',     protect, saveMood)
router.get('/history',  protect, getHistory)
router.get('/stats',    protect, getStats)

module.exports = router
