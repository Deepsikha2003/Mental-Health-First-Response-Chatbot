// ─────────────────────────────────────────────────────────────
//  components/dashboard/StatCard.jsx
// ─────────────────────────────────────────────────────────────
export default function StatCard({ icon, label, value, sub, color = 'teal' }) {
  const colors = {
    teal:   'from-[#3d8fa0]/20 to-[#63b3c1]/10 border-[rgba(99,179,193,0.2)]',
    green:  'from-green-900/30 to-green-800/10 border-green-500/20',
    amber:  'from-amber-900/30 to-amber-800/10 border-amber-500/20',
    purple: 'from-purple-900/30 to-purple-800/10 border-purple-500/20',
  }
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-4`}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-2xl font-bold text-[#e8eef5]">{value}</p>
      <p className="text-xs font-medium text-[#b0c4d4] mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-[#7a94ad] mt-1">{sub}</p>}
    </div>
  )
}
