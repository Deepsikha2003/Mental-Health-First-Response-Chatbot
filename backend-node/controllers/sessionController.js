const Session = require('../models/Session')

// POST /api/sessions
exports.createSession = async (req, res) => {
  try {
    const { messages, title } = req.body
    const session = await Session.create({
      userId: req.user._id,
      title: title || (messages?.[0]?.content?.slice(0, 40) ?? 'New Session'),
      messages: messages || [],
    })
    res.status(201).json(session)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/sessions/:userId
exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.params.userId })
      .sort({ updatedAt: -1 })
      .select('-messages')   // exclude messages for list view
    res.json(sessions)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
