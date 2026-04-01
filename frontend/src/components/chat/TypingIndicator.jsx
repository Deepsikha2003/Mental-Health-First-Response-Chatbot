// ─────────────────────────────────────────────────────────────
//  components/chat/TypingIndicator.jsx
// ─────────────────────────────────────────────────────────────
export default function TypingIndicator() {
  return (
    <div className="flex gap-3 msg-enter">
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm bg-gradient-to-br from-[#3d8fa0] to-[#a8d8b9]">
        🤖
      </div>
      <div className="bg-[#1e2130] border border-[rgba(99,179,193,0.12)] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-[#63b3c1] typing-dot"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
    </div>
  )
}
