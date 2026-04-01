const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  role:    { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
}, { timestamps: true })

const sessionSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:    { type: String, default: 'New Session' },
  messages: [messageSchema],
}, { timestamps: true })

module.exports = mongoose.model('Session', sessionSchema)
