// ─────────────────────────────────────────────────────────────
//  components/chat/QuickReplies.jsx
// ─────────────────────────────────────────────────────────────
const QUICK_REPLIES = [
  "I'm feeling anxious 😰",
  "I'm struggling today 😔",
  "I need someone to talk to 💙",
  "I feel overwhelmed 😩",
  "Help me with breathing 🌬️",
  "Just checking in 😊",
]

export default function QuickReplies({ onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-3">
      {QUICK_REPLIES.map((r) => (
        <button
          key={r}
          onClick={() => onSelect(r)}
          className="px-3 py-1.5 rounded-full text-xs border border-[rgba(99,179,193,0.25)]
            bg-[rgba(99,179,193,0.06)] text-[#8ecfda] hover:bg-[rgba(99,179,193,0.15)]
            hover:border-[#63b3c1] transition-all hover:-translate-y-0.5 whitespace-nowrap"
        >
          {r}
        </button>
      ))}
    </div>
  )
}
