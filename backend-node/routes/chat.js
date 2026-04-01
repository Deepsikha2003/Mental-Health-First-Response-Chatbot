const router = require('express').Router()
const { sendMessage, getSessions, getMessages, deleteSession } = require('../controllers/chatController')
const protect = require('../middleware/auth')

router.post('/message',                   protect, sendMessage)
router.get('/sessions',                   protect, getSessions)
router.get('/sessions/:id/messages',      protect, getMessages)
router.delete('/sessions/:id',            protect, deleteSession)

module.exports = router
