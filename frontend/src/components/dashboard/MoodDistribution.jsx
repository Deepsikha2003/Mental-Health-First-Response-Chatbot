// ─────────────────────────────────────────────────────────────
//  components/dashboard/MoodDistribution.jsx  — Pie/bar chart
// ─────────────────────────────────────────────────────────────
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from 'recharts'

const COLORS = {
  happy:     '#a8d8b9',
  neutral:   '#63b3c1',
  anxious:   '#d4a84b',
  sad:       '#8ecfda',
  depressed: '#e07b8a',
  angry:     '#e07b8a',
}

export default function MoodDistribution({ data }) {
  if (!data?.length) return null

  // Count occurrences of each mood
  const counts = data.reduce((acc, d) => {
    acc[d.mood] = (acc[d.mood] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(counts).map(([mood, count]) => ({ mood, count }))

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,193,0.08)" />
        <XAxis
          dataKey="mood"
          tick={{ fill: '#7a94ad', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#7a94ad', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: '#1e2130',
            border: '1px solid rgba(99,179,193,0.2)',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#e8eef5',
          }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.mood} fill={COLORS[entry.mood] || '#63b3c1'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
