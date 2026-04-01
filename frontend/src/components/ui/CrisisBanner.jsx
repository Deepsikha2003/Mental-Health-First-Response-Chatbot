// ─────────────────────────────────────────────────────────────
//  components/ui/CrisisBanner.jsx  — Tier 2/3 alert banner
// ─────────────────────────────────────────────────────────────
import { AlertTriangle, Phone, MessageSquare, X } from 'lucide-react'
import { useState } from 'react'

export default function CrisisBanner({ tier }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed || tier < 2) return null

  const isCritical = tier === 3

  return (
    <div
      className={`mx-4 mb-3 rounded-xl p-4 border ${
        isCritical
          ? 'bg-red-950/60 border-red-500/40 text-red-200'
          : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isCritical ? 'text-red-400' : 'text-amber-400'}`} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-1">
            {isCritical ? '🚨 Crisis Detected — Please reach out now' : '⚠️ You seem to be struggling'}
          </p>
          <p className="text-xs opacity-80 mb-3">
            {isCritical
              ? "Your safety matters. Please contact a crisis counselor immediately."
              : "It's okay to ask for help. These resources are free and confidential."}
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="tel:988"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> Call 988
            </a>
            <a
              href="sms:741741?body=HELLO"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Text HOME to 741741
            </a>
            {isCritical && (
              <a
                href="tel:911"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-xs font-medium transition-colors"
              >
                🚑 Call 911
              </a>
            )}
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
