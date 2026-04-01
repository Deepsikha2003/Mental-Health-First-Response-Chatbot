// ─────────────────────────────────────────────────────────────
//  pages/ChatPage.jsx  — Main chat interface
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Send, Menu, X, BarChart2, LogOut, Mic, Paperclip } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { chatApi } from '../api/chat'
import MessageBubble from '../components/chat/MessageBubble'
import TypingIndicator from '../components/chat/TypingIndicator'
import QuickReplies from '../components/chat/QuickReplies'
import SessionList from '../components/chat/SessionList'
import CrisisBanner from '../components/ui/CrisisBanner'
import Spinner from '../components/ui/Spinner'

export default function ChatPage() {
  const { user, logout }       = useAuth()
  const [messages, setMessages]     = useState([])
  const [sessions, setSessions]     = useState([])
  const [activeSession, setActive]  = useState(null)
  const [input, setInput]           = useState('')
  const [typing, setTyping]         = useState(false)
  const [loading, setLoading]       = useState(false)
  const [sidebarOpen, setSidebar]   = useState(true)
  const [crisisTier, setCrisisTier] = useState(0)
  const [showQuick, setShowQuick]   = useState(true)
  const messagesEndRef = useRef(null)
  const textareaRef    = useRef(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Load sessions on mount
  useEffect(() => {
    chatApi.getSessions()
      .then(setSessions)
      .catch(() => {})
  }, [])

  // Load messages when active session changes
  useEffect(() => {
    if (!activeSession) return
    setLoading(true)
    chatApi.getMessages(activeSession)
      .then((msgs) => { setMessages(msgs); setShowQuick(msgs.length === 0) })
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoading(false))
  }, [activeSession])

  // Auto-grow textarea
  const autoGrow = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  const sendMessage = useCallback(async (text) => {
    const content = (text || input).trim()
    if (!content || typing) return

    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setShowQuick(false)
    setTyping(true)
    setCrisisTier(0)

    // Optimistic user message
    const tempUser = {
      id: Date.now(),
      role: 'user',
      content,
      sentiment: null,
      crisis_tier: 0,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUser])

    try {
      const res = await chatApi.sendMessage(content, activeSession)

      // Update session list
      if (!activeSession) {
        setActive(res.session_id)
        chatApi.getSessions().then(setSessions)
      }

      // Replace temp message + add bot response
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUser.id),
        { ...res.user_message },
        { ...res.bot_message },
      ])

      setCrisisTier(res.crisis_tier)

      if (res.emergency_triggered) {
        toast.error('🚨 Emergency alert sent to your contact', { duration: 6000 })
      }
    } catch (err) {
      toast.error('Failed to send message')
      setMessages((prev) => prev.filter((m) => m.id !== tempUser.id))
    } finally {
      setTyping(false)
    }
  }, [input, typing, activeSession])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleNewChat = () => {
    setActive(null)
    setMessages([])
    setShowQuick(true)
    setCrisisTier(0)
  }

  const handleDeleteSession = async (id) => {
    try {
      await chatApi.deleteSession(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
      if (activeSession === id) handleNewChat()
      toast.success('Session deleted')
    } catch {
      toast.error('Failed to delete session')
    }
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.username?.slice(0, 2).toUpperCase() || '?'

  return (
    <div className="flex h-screen bg-[#0f1117] overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`flex-shrink-0 flex flex-col bg-[#1a1d27] border-r border-[rgba(99,179,193,0.1)]
          transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[rgba(99,179,193,0.1)]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3d8fa0] to-[#a8d8b9] flex items-center justify-center text-lg">
            🧠
          </div>
          <div>
            <p className="text-sm font-bold text-[#e8eef5]">Naga <span className="text-[#63b3c1]">AI</span></p>
            <p className="text-[10px] text-[#7a94ad]">Mental Health Support</p>
          </div>
        </div>

        {/* Sessions */}
        <div className="flex-1 overflow-hidden py-3">
          <SessionList
            sessions={sessions}
            activeId={activeSession}
            onSelect={(id) => { setActive(id); setCrisisTier(0) }}
            onDelete={handleDeleteSession}
            onNew={handleNewChat}
          />
        </div>

        {/* User info + nav */}
        <div className="border-t border-[rgba(99,179,193,0.1)] p-3 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#7a94ad]
              hover:bg-[#1e2130] hover:text-[#b0c4d4] transition-all"
          >
            <BarChart2 className="w-4 h-4" /> Mood Dashboard
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#7a94ad]
              hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3d8fa0] to-[#d4a84b]
              flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#b0c4d4] truncate">{user?.username}</p>
              <p className="text-[10px] text-[#7a94ad] truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main chat area ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(99,179,193,0.1)]
          bg-[rgba(26,29,39,0.8)] backdrop-blur-md flex-shrink-0">
          <button
            onClick={() => setSidebar(!sidebarOpen)}
            className="p-2 rounded-xl text-[#7a94ad] hover:bg-[#1e2130] hover:text-[#b0c4d4] transition-all"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3d8fa0] to-[#a8d8b9] flex items-center justify-center text-lg">
                🤖
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#1a1d27]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#e8eef5]">MediCare Assistant</p>
              <p className="text-[10px] text-[#63b3c1]">AI-powered · Empathetic · Confidential</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-[#7a94ad]
                border border-[rgba(99,179,193,0.15)] hover:bg-[#1e2130] hover:text-[#b0c4d4] transition-all"
            >
              <BarChart2 className="w-3.5 h-3.5" /> Dashboard
            </Link>
          </div>
        </header>

        {/* Crisis banner */}
        <div className="flex-shrink-0 pt-3">
          <CrisisBanner tier={crisisTier} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {loading && (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-5xl mb-4">🌿</div>
              <h3 className="text-lg font-semibold text-[#e8eef5] mb-2">
                Hi {user?.full_name?.split(' ')[0] || user?.username}! I'm MediCare Assistant
              </h3>
              <p className="text-sm text-[#7a94ad] max-w-sm">
                This is a safe, judgment-free space. Share what's on your mind — I'm here to listen and support you.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {typing && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick replies */}
        {showQuick && !typing && (
          <QuickReplies onSelect={sendMessage} />
        )}

        {/* Input bar */}
        <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-[rgba(99,179,193,0.1)]
          bg-[rgba(26,29,39,0.8)] backdrop-blur-md">
          <div className="flex items-end gap-3">
            <div className="flex-1 flex items-end gap-2 bg-[#1e2130] border border-[rgba(99,179,193,0.15)]
              rounded-2xl px-4 py-2 focus-within:border-[#63b3c1] focus-within:ring-2
              focus-within:ring-[#63b3c1]/10 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoGrow() }}
                onKeyDown={handleKey}
                placeholder="Share what's on your mind…"
                rows={1}
                className="flex-1 bg-transparent text-[#e8eef5] text-sm placeholder-[#7a94ad]/60
                  outline-none resize-none min-h-[38px] max-h-[120px] py-2 leading-relaxed"
              />
              <div className="flex gap-1 pb-1">
                <button className="p-1.5 rounded-lg text-[#7a94ad] hover:bg-[#2d3748] hover:text-[#b0c4d4] transition-all" title="Attach (coming soon)">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg text-[#7a94ad] hover:bg-[#2d3748] hover:text-[#b0c4d4] transition-all" title="Voice (coming soon)">
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              className="w-11 h-11 flex-shrink-0 rounded-full bg-gradient-to-br from-[#3d8fa0] to-[#63b3c1]
                flex items-center justify-center text-white shadow-lg shadow-[#63b3c1]/25
                hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {typing ? <Spinner size="sm" className="border-white/30 border-t-white" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-center text-[10px] text-[#7a94ad]/50 mt-2">
            🔒 Private & confidential · MediCare Assistant is AI — not a substitute for professional care
          </p>
        </div>
      </div>
    </div>
  )
}
