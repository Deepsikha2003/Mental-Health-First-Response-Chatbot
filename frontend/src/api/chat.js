// ─────────────────────────────────────────────────────────────
//  api/chat.js  — Chat API calls
// ─────────────────────────────────────────────────────────────
import client from './client'

export const chatApi = {
  /** Send a message (creates session if session_id omitted) */
  sendMessage: (content, sessionId = null) =>
    client
      .post('/chat/message', { content, session_id: sessionId })
      .then((r) => r.data),

  /** List all sessions for current user */
  getSessions: () => client.get('/chat/sessions').then((r) => r.data),

  /** Get all messages in a session */
  getMessages: (sessionId) =>
    client.get(`/chat/sessions/${sessionId}/messages`).then((r) => r.data),

  /** Delete a session */
  deleteSession: (sessionId) =>
    client.delete(`/chat/sessions/${sessionId}`),
}
