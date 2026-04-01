require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
const Session = require('./models/Session')
const Mood = require('./models/Mood')

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB...')

  // Clear existing data
  await Promise.all([User.deleteMany(), Session.deleteMany(), Mood.deleteMany()])
  console.log('Cleared existing data.')

  // ── Users ─────────────────────────────────────────────────
  const users = await User.insertMany([
    { name: 'Alice Demo',   email: 'alice@demo.com', password: await bcrypt.hash('password123', 10), age: 28 },
    { name: 'Bob Demo',     email: 'bob@demo.com',   password: await bcrypt.hash('password123', 10), age: 34 },
    { name: 'Charlie Demo', email: 'charlie@demo.com', password: await bcrypt.hash('password123', 10), age: 22 },
  ])
  console.log(`✅ Inserted ${users.length} users`)

  // ── Sessions ──────────────────────────────────────────────
  const sessions = await Session.insertMany([
    {
      userId: users[0]._id,
      title: 'Feeling overwhelmed at work',
      messages: [
        { role: 'user',      content: 'I feel really overwhelmed with work lately.' },
        { role: 'assistant', content: 'I hear you. Work stress can be really heavy. What specifically feels most overwhelming right now?' },
        { role: 'user',      content: 'Too many deadlines and I can\'t sleep.' },
        { role: 'assistant', content: 'Sleep disruption from stress is very common. Let\'s talk about some grounding techniques that might help.' },
      ],
    },
    {
      userId: users[1]._id,
      title: 'Anxiety about the future',
      messages: [
        { role: 'user',      content: 'I keep worrying about things that haven\'t happened yet.' },
        { role: 'assistant', content: 'That sounds like anticipatory anxiety. You\'re not alone in this. Can you tell me more about what worries you most?' },
      ],
    },
    {
      userId: users[2]._id,
      title: 'Feeling lonely',
      messages: [
        { role: 'user',      content: 'I don\'t have many friends and feel isolated.' },
        { role: 'assistant', content: 'Loneliness is a deeply human experience. Thank you for sharing that with me. What does connection look like for you?' },
      ],
    },
  ])
  console.log(`✅ Inserted ${sessions.length} sessions`)

  // ── Moods ─────────────────────────────────────────────────
  const now = new Date()
  const daysAgo = (n) => new Date(now - n * 86400000)

  const moods = await Mood.insertMany([
    { userId: users[0]._id, mood: 'anxious',   note: 'Big presentation today',    date: daysAgo(6) },
    { userId: users[0]._id, mood: 'neutral',   note: 'Presentation went okay',    date: daysAgo(5) },
    { userId: users[0]._id, mood: 'happy',     note: 'Got positive feedback!',    date: daysAgo(4) },
    { userId: users[0]._id, mood: 'sad',       note: 'Missed a deadline',         date: daysAgo(3) },
    { userId: users[0]._id, mood: 'neutral',   note: 'Just an average day',       date: daysAgo(2) },
    { userId: users[0]._id, mood: 'happy',     note: 'Weekend plans with family', date: daysAgo(1) },
    { userId: users[1]._id, mood: 'depressed', note: 'Hard to get out of bed',    date: daysAgo(3) },
    { userId: users[1]._id, mood: 'anxious',   note: 'Job interview tomorrow',    date: daysAgo(2) },
    { userId: users[1]._id, mood: 'neutral',   note: 'Interview done',            date: daysAgo(1) },
    { userId: users[2]._id, mood: 'sad',       note: 'Stayed home all day',       date: daysAgo(2) },
    { userId: users[2]._id, mood: 'neutral',   note: 'Went for a walk',           date: daysAgo(1) },
  ])
  console.log(`✅ Inserted ${moods.length} mood entries`)

  console.log('\n🎉 Seed complete! Demo credentials: alice@demo.com / password123')
  await mongoose.disconnect()
}

seed().catch((err) => { console.error(err); process.exit(1) })
