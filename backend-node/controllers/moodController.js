const Mood = require('../models/Mood')

const MOOD_SCORES = { happy: 8, neutral: 5, anxious: 3.5, sad: 2.5, depressed: 1.5, angry: 3 }

// POST /api/mood/log
exports.saveMood = async (req, res) => {
  try {
    const { mood, score, note } = req.body
    if (!mood) return res.status(400).json({ error: 'mood is required' })
    const entry = await Mood.create({
      userId: req.user._id,
      mood,
      note: note || '',
      date: new Date(),
    })
    res.status(201).json({
      id: entry._id, mood: entry.mood, score: score || MOOD_SCORES[mood] || 5,
      note: entry.note, source: 'manual', created_at: entry.date,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/mood/history?days=30
exports.getHistory = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30
    const since = new Date(Date.now() - days * 86400000)
    const moods = await Mood.find({ userId: req.user._id, date: { $gte: since } }).sort({ date: 1 })
    res.json(moods.map(m => ({
      id: m._id, mood: m.mood, score: MOOD_SCORES[m.mood] || 5,
      note: m.note, source: 'manual', created_at: m.date,
    })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/mood/stats?days=30
exports.getStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30
    const since = new Date(Date.now() - days * 86400000)
    const moods = await Mood.find({ userId: req.user._id, date: { $gte: since } })

    if (!moods.length)
      return res.json({ average_score: 5.0, dominant_mood: 'neutral', total_entries: 0, streak_days: 0 })

    const scores = moods.map(m => MOOD_SCORES[m.mood] || 5)
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length

    const counts = {}
    moods.forEach(m => counts[m.mood] = (counts[m.mood] || 0) + 1)
    const dominant = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b)

    // Streak calculation
    const uniqueDays = [...new Set(moods.map(m => new Date(m.date).toDateString()))].reverse()
    let streak = 0
    const today = new Date()
    for (let i = 0; i < uniqueDays.length; i++) {
      const d = new Date(uniqueDays[i])
      const diff = Math.floor((today - d) / 86400000)
      if (diff === i) streak++
      else break
    }

    res.json({ average_score: Math.round(avg * 100) / 100, dominant_mood: dominant, total_entries: moods.length, streak_days: streak })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
