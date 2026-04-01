const jwt = require('jsonwebtoken')
const User = require('../models/User')

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, age } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ error: 'name, email and password are required' })

    if (await User.findOne({ email }))
      return res.status(400).json({ error: 'Email already registered' })

    const user = await User.create({ name, email, password, age })
    const token = signToken(user._id)

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, age: user.age },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'email and password are required' })

    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' })

    const token = signToken(user._id)
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, age: user.age },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
