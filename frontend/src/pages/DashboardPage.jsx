// ─────────────────────────────────────────────────────────────
//  pages/DashboardPage.jsx  — Mood analytics dashboard
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, LogOut, TrendingUp, Calendar, Flame, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { moodApi } from '../api/mood'
import MoodChart from '../components/dashboard/MoodChart'
import MoodDistribution from '../components/dashboard/MoodDistribution'
import StatCard from '../components/dashboard/StatCard'
import Spinner from '../components/ui/Spinner'

const MOOD_OPTIONS = [
  { value: 'happy',     label: 'Happy',     emoji: '😊', score: 8 },
  { value: 'neutral',   label: 'Neutral',   emoji: '😐', score: 5 },
  { value: 'anxious',   label: 'Anxious',   emoji: '😰', score: 3.5 },
  { value: 'sad',       label: 'Sad',       emoji: '😔', score: 2.5 },
  { value: 'depressed', label: 'Depressed', emoji: '😞', score: 1.5 },
  { value: 'angry',     label: 'Angry',     emoji: '😤', score: 3 },
]

export default function DashboardPage() {
  const { user, logout }     = useAuth()
  const [history, setHistory]   = useState([])
  const [stats, setStats]       = useState(null)
  const [days, setDays]         = useState(30)
  const [loading, setLoading]   = useState(true)
  const [selectedMood, setMood] = useState(null)
  const [note, setNote]         = useState('')
  const [logging, setLogging]   = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [h, s] = await Promise.all([moodApi.history(days), moodApi.stats(days)])
      setHistory(h)
      setStats(s)
    } catch {
      toast.error('Failed to load mood data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [days])

  const handleLogMood = async () => {
    if (!selectedMood) { toast.error('Please select a mood first'); return }
    setLogging(true)
    try {
      const opt = MOOD_OPTIONS.find((o) => o.value === selectedMood)
      await moodApi.log(selectedMood, opt.score, note)
      toast.success('Mood logged! ✓')
      setMood(null)
      setNote('')
      loadData()
    } catch {
      toast.error('Failed to log mood')
    } finally {
      setLogging(false)
    }
  }

  const moodEmoji = {
    happy: '😊', neutral: '😐', anxious: '😰',
    sad: '😔', depressed: '😞', angry: '😤',
  }

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-[#63b3c1]/4 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#a8d8b9]/3 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[rgba(99,179,193,0.1)]
        bg-[rgba(15,17,23,0.85)] backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3d8fa0] to-[#a8d8b9] flex items-center justify-center text-lg">
            🧠
          </div>
          <div>
            <p className="text-sm font-bold text-[#e8eef5]">Naga <span className="text-[#63b3c1]">AI</span></p>
            <p className="text-[10px] text-[#7a94ad]">Mood Dashboard</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/chat"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-[#7a94ad]
                border border-[rgba(99,179,193,0.15)] hover:bg-[#1e2130] hover:text-[#b0c4d4] transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Chat
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-[#7a94ad]
                border border-[rgba(99,179,193,0.15)] hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#e8eef5]">
            Welcome back, {user?.full_name?.split(' ')[0] || user?.username} 👋
          </h1>
          <p className="text-sm text-[#7a94ad] mt-1">Here's your emotional wellness overview</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-6">

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon="📊"
                label="Avg Mood Score"
                value={stats?.average_score?.toFixed(1) ?? '—'}
                sub="out of 10"
                color="teal"
              />
              <StatCard
                icon={moodEmoji[stats?.dominant_mood] || '😐'}
                label="Dominant Mood"
                value={stats?.dominant_mood ? stats.dominant_mood.charAt(0).toUpperCase() + stats.dominant_mood.slice(1) : '—'}
                sub={`Last ${days} days`}
                color="green"
              />
              <StatCard
                icon="📝"
                label="Total Entries"
                value={stats?.total_entries ?? 0}
                sub="mood logs"
                color="amber"
              />
              <StatCard
                icon="🔥"
                label="Day Streak"
                value={stats?.streak_days ?? 0}
                sub="consecutive days"
                color="purple"
              />
            </div>

            {/* Time range selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#7a94ad]">Show:</span>
              {[7, 14, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1 rounded-lg text-xs transition-all
                    ${days === d
                      ? 'bg-[#63b3c1]/20 text-[#63b3c1] border border-[#63b3c1]/30'
                      : 'text-[#7a94ad] hover:text-[#b0c4d4] border border-transparent'
                    }`}
                >
                  {d}d
                </button>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Mood over time */}
              <div className="md:col-span-2 glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-[#63b3c1]" />
                  <h2 className="text-sm font-semibold text-[#e8eef5]">Mood Over Time</h2>
                </div>
                <MoodChart data={history} />
              </div>

              {/* Distribution */}
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-4 h-4 text-[#e07b8a]" />
                  <h2 className="text-sm font-semibold text-[#e8eef5]">Mood Distribution</h2>
                </div>
                <MoodDistribution data={history} />
              </div>
            </div>

            {/* Log mood + recent entries */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Manual mood logger */}
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-[#63b3c1]" />
                  <h2 className="text-sm font-semibold text-[#e8eef5]">Log Today's Mood</h2>
                </div>
                <div className="flex justify-between mb-4">
                  {MOOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setMood(opt.value)}
                      title={opt.label}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl
                        border-2 transition-all hover:scale-110
                        ${selectedMood === opt.value
                          ? 'border-[#63b3c1] bg-[rgba(99,179,193,0.15)] scale-110'
                          : 'border-transparent bg-[#1e2130]'
                        }`}
                    >
                      {opt.emoji}
                    </button>
                  ))}
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note (optional)…"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-[#1a1d27] border border-[rgba(99,179,193,0.15)]
                    text-[#e8eef5] text-sm placeholder-[#7a94ad]/60 outline-none resize-none
                    focus:border-[#63b3c1] transition-all mb-3"
                />
                <button
                  onClick={handleLogMood}
                  disabled={!selectedMood || logging}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#3d8fa0] to-[#63b3c1]
                    text-white text-sm font-medium flex items-center justify-center gap-2
                    hover:opacity-90 transition-all disabled:opacity-40"
                >
                  {logging ? <Spinner size="sm" /> : '✓ Log Mood'}
                </button>
              </div>

              {/* Recent entries */}
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="w-4 h-4 text-[#d4a84b]" />
                  <h2 className="text-sm font-semibold text-[#e8eef5]">Recent Entries</h2>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.length === 0 && (
                    <p className="text-xs text-[#7a94ad] text-center py-4">No entries yet</p>
                  )}
                  {[...history].reverse().slice(0, 10).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#1a1d27]"
                    >
                      <span className="text-lg">{moodEmoji[entry.mood] || '😐'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#b0c4d4] capitalize">{entry.mood}</p>
                        {entry.note && (
                          <p className="text-[10px] text-[#7a94ad] truncate">{entry.note}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-[#63b3c1]">{entry.score}/10</p>
                        <p className="text-[10px] text-[#7a94ad]">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
