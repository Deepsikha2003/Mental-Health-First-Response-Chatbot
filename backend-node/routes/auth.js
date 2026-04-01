const router = require('express').Router()
const { register, login, getUser } = require('../controllers/authController')
const protect = require('../middleware/auth')

router.post('/register', register)
router.post('/login', login)
router.get('/users/:id', protect, getUser)

module.exports = router
