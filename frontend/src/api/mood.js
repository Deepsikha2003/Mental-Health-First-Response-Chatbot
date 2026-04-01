// ─────────────────────────────────────────────────────────────
//  api/mood.js  — Mood API calls
// ─────────────────────────────────────────────────────────────
import client from './client'

export const moodApi = {
  /** Manually log a mood */
  log: (mood, score, note = '') =>
    client.post('/mood/log', { mood, score, note }).then((r) => r.data),

  /** Get mood history for past N days */
  history: (days = 30) =>
    client.get(`/mood/history?days=${days}`).then((r) => r.data),

  /** Get aggregated stats */
  stats: (days = 30) =>
    client.get(`/mood/stats?days=${days}`).then((r) => r.data),
}
