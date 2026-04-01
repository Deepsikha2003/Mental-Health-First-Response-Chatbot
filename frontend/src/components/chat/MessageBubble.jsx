// ─────────────────────────────────────────────────────────────
//  components/chat/MessageBubble.jsx
// ─────────────────────────────────────────────────────────────
import { format } from 'date-fns'
import SentimentBadge from '../ui/SentimentBadge'

/** Render **bold** markdown in bot messages */
function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const time   = format(new Date(message.created_at), 'HH:mm')

  return (
    <div className={`flex gap-3 msg-enter ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm self-end
          ${isUser
            ? 'bg-gradient-to-br from-[#3d8fa0] to-[#d4a84b]'
            : 'bg-gradient-to-br from-[#3d8fa0] to-[#a8d8b9]'
          }`}
      >
        {isUser ? '🧑' : '🤖'}
      </div>

      {/* Content */}
      <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
            ${isUser
              ? 'bg-gradient-to-br from-[#3d8fa0] to-[#63b3c1] text-white rounded-br-sm'
              : 'bg-[#1e2130] border border-[rgba(99,179,193,0.12)] text-[#e8eef5] rounded-bl-sm'
            }`}
          dangerouslySetInnerHTML={isUser ? undefined : { __html: renderMarkdown(message.content) }}
        >
          {isUser ? message.content : undefined}
        </div>

        {/* Meta row */}
        <div className={`flex items-center gap-2 mt-1.5 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] text-[#7a94ad]">{time}</span>
          {isUser && message.sentiment && (
            <SentimentBadge sentiment={message.sentiment} />
          )}
        </div>
      </div>
    </div>
  )
}
