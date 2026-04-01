require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: false }))
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'))
app.use('/api/chat',     require('./routes/chat'))
app.use('/api/mood',     require('./routes/moods'))
app.use('/api/sessions', require('./routes/sessions'))

// ── Health check ──────────────────────────────────────────────
app.get('/', (_, res) => res.json({ status: 'ok', app: 'Naga AI Node Backend' }))

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route ${req.path} not found` }))

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

// ── Connect to MongoDB then start server ──────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected:', process.env.MONGO_URI)
    const server = app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on http://localhost:${process.env.PORT}`)
    )
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${process.env.PORT} is busy. Kill it and retry.`)
      } else {
        console.error('❌ Server error:', err.message)
      }
      process.exit(1)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  })
