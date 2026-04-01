const Session = require('../models/Session')
const Mood = require('../models/Mood')

// Simple keyword-based AI responses
const getAIResponse = (text) => {
  const t = text.toLowerCase()
  if (/suicid|kill myself|end my life|want to die/.test(t))
    return { reply: "I'm really concerned about you right now. Please reach out to a crisis helpline immediately — call or text 988 (Suicide & Crisis Lifeline). You are not alone and help is available 24/7. 💙", tier: 3 }
  if (/self.harm|hurt myself|cutting/.test(t))
    return { reply: "I hear that you're in a lot of pain. Please consider reaching out to a counselor or crisis line. You deserve support and care. 🧡", tier: 2 }
  if (/anxious|anxiety|panic|overwhelm|stress/.test(t))
    return { reply: "It sounds like you're feeling really overwhelmed. Try taking a slow deep breath — inhale for 4 counts, hold for 4, exhale for 4. You're doing great by talking about it. 💚", tier: 1 }
  if (/depress|hopeless|empty|numb|worthless/.test(t))
    return { reply: "I'm sorry you're feeling this way. Depression can feel very isolating, but you're not alone. Would you like to talk more about what's been going on? 💙", tier: 1 }
  if (/sad|cry|upset|hurt|lonely/.test(t))
    return { reply: "I'm here with you. It's okay to feel sad sometimes. Would you like to share more about what's been happening? I'm listening. 🌿", tier: 1 }
  if (/happy|good|great|better|grateful/.test(t))
    return { reply: "That's wonderful to hear! It's important to celebrate the good moments. What's been making you feel this way? 😊", tier: 0 }
  return { reply: "Thank you for sharing that with me. I'm here to listen and support you. Can you tell me more about how you're feeling? 🌱", tier: 0 }
}

const getMoodFromTier = (tier) => {
  if (tier === 3 || tier === 2) return 'depressed'
  if (tier === 1) return 'anxious'
  return 'neutral'
}

// POST /api/chat/message
exports.sendMessage = async (req, res) => {
  try {
    const { content, session_id } = req.body
    if (!content) return res.status(400).json({ error: 'content is required' })

    const { reply, tier } = getAIResponse(content)

    let session
    if (session_id) {
      session = await Session.findOne({ _id: session_id, userId: req.user._id })
      if (!session) return res.status(404).json({ error: 'Session not found' })
    } else {
      session = await Session.create({
        userId: req.user._id,
        title: content.slice(0, 40),
        messages: [],
      })
    }

    const userMsg = { role: 'user', content, createdAt: new Date() }
    const botMsg  = { role: 'assistant', content: reply, createdAt: new Date() }

    session.messages.push(userMsg, botMsg)
    await session.save()

    const savedUser = session.messages[session.messages.length - 2]
    const savedBot  = session.messages[session.messages.length - 1]

    // Auto-log mood
    await Mood.create({ userId: req.user._id, mood: getMoodFromTier(tier), note: content.slice(0, 80) })

    res.json({
      session_id: session._id,
      user_message: { id: savedUser._id, role: 'user', content: savedUser.content, sentiment: null, crisis_tier: tier, created_at: savedUser.createdAt },
      bot_message:  { id: savedBot._id,  role: 'assistant', content: savedBot.content, sentiment: null, crisis_tier: 0, created_at: savedBot.createdAt },
      crisis_tier: tier,
      sentiment: getMoodFromTier(tier),
      emergency_triggered: false,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/chat/sessions
exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select('-messages')
    res.json(sessions.map(s => ({ id: s._id, title: s.title, created_at: s.createdAt, updated_at: s.updatedAt })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/chat/sessions/:id/messages
exports.getMessages = async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.user._id })
    if (!session) return res.status(404).json({ error: 'Session not found' })
    res.json(session.messages.map(m => ({
      id: m._id, role: m.role, content: m.content,
      sentiment: null, crisis_tier: 0, created_at: m.createdAt,
    })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// DELETE /api/chat/sessions/:id
exports.deleteSession = async (req, res) => {
  try {
    await Session.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
