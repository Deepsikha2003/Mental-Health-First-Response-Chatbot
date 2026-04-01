const router = require('express').Router()
const { createSession, getSessions } = require('../controllers/sessionController')
const protect = require('../middleware/auth')

router.post('/', protect, createSession)
router.get('/:userId', protect, getSessions)

module.exports = router
