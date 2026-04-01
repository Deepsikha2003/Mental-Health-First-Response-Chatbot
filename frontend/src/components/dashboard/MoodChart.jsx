// ─────────────────────────────────────────────────────────────
//  components/dashboard/MoodChart.jsx  — Recharts line chart
// ─────────────────────────────────────────────────────────────
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import { format } from 'date-fns'

const MOOD_COLORS = {
  happy: '#a8d8b9',
  neutral: '#63b3c1',
  anxious: '#d4a84b',
  sad: '#8ecfda',
  depressed: '#e07b8a',
  angry: '#e07b8a',
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-[#1e2130] border border-[rgba(99,179,193,0.2)] rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-[#7a94ad] mb-1">{format(new Date(d.created_at), 'MMM d, HH:mm')}</p>
      <p className="text-[#e8eef5] font-medium capitalize">{d.mood}</p>
      <p className="text-[#63b3c1]">Score: {d.score}/10</p>
    </div>
  )
}

export default function MoodChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-48 text-[#7a94ad] text-sm">
        No mood data yet — start chatting!
      </div>
    )
  }

  const chartData = data.map((d) => ({
    ...d,
    date: format(new Date(d.created_at), 'MMM d'),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,193,0.08)" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#7a94ad', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 10]}
          tick={{ fill: '#7a94ad', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={5} stroke="rgba(99,179,193,0.2)" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#63b3c1"
          strokeWidth={2}
          dot={(props) => {
            const { cx, cy, payload } = props
            return (
              <circle
                key={payload.id}
                cx={cx} cy={cy} r={4}
                fill={MOOD_COLORS[payload.mood] || '#63b3c1'}
                stroke="#0f1117"
                strokeWidth={2}
              />
            )
          }}
          activeDot={{ r: 6, fill: '#63b3c1', stroke: '#0f1117', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
