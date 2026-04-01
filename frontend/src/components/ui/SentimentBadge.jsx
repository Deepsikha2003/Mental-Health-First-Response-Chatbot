// ─────────────────────────────────────────────────────────────
//  components/ui/SentimentBadge.jsx
// ─────────────────────────────────────────────────────────────
const CONFIG = {
  happy:     { emoji: '😊', label: 'Happy',     color: 'bg-green-500/15 text-green-300 border-green-500/25' },
  sad:       { emoji: '😔', label: 'Sad',       color: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
  anxious:   { emoji: '😰', label: 'Anxious',   color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25' },
  depressed: { emoji: '😞', label: 'Depressed', color: 'bg-purple-500/15 text-purple-300 border-purple-500/25' },
  angry:     { emoji: '😤', label: 'Angry',     color: 'bg-red-500/15 text-red-300 border-red-500/25' },
  neutral:   { emoji: '😐', label: 'Neutral',   color: 'bg-gray-500/15 text-gray-300 border-gray-500/25' },
}

export default function SentimentBadge({ sentiment }) {
  const cfg = CONFIG[sentiment] || CONFIG.neutral
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${cfg.color}`}>
      {cfg.emoji} {cfg.label}
    </span>
  )
}
