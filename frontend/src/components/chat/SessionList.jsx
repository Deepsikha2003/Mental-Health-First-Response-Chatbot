// ─────────────────────────────────────────────────────────────
//  components/chat/SessionList.jsx  — Sidebar session history
// ─────────────────────────────────────────────────────────────
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Trash2, Plus } from 'lucide-react'

export default function SessionList({ sessions, activeId, onSelect, onDelete, onNew }) {
  return (
    <div className="flex flex-col h-full">
      {/* New chat button */}
      <button
        onClick={onNew}
        className="flex items-center gap-2 mx-3 mb-3 px-4 py-2.5 rounded-xl
          bg-gradient-to-r from-[#3d8fa0] to-[#63b3c1] text-white text-sm font-medium
          hover:opacity-90 transition-opacity"
      >
        <Plus className="w-4 h-4" /> New Chat
      </button>

      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7a94ad] px-4 mb-2">
        Recent Sessions
      </p>

      <div className="flex-1 overflow-y-auto space-y-1 px-2">
        {sessions.length === 0 && (
          <p className="text-xs text-[#7a94ad] text-center py-6">No sessions yet</p>
        )}
        {sessions.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all
              ${activeId === s.id
                ? 'bg-[rgba(99,179,193,0.12)] border border-[rgba(99,179,193,0.25)]'
                : 'hover:bg-[#1e2130] border border-transparent'
              }`}
          >
            <MessageSquare className="w-4 h-4 text-[#63b3c1] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#b0c4d4] truncate">{s.title}</p>
              <p className="text-[10px] text-[#7a94ad]">
                {formatDistanceToNow(new Date(s.updated_at), { addSuffix: true })}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(s.id) }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/20
                text-[#7a94ad] hover:text-red-400 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
