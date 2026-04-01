// ─────────────────────────────────────────────────────────────
//  api/auth.js  — Authentication API calls
// ─────────────────────────────────────────────────────────────
import client from './client'

export const authApi = {
  signup: (data) =>
    client.post('/auth/register', {
      name: data.full_name || data.username,
      email: data.email,
      password: data.password,
    }).then((r) => ({ access_token: r.data.token, user: r.data.user })),

  login: (email, password) =>
    client
      .post('/auth/login', { email, password })
      .then((r) => ({ access_token: r.data.token, user: r.data.user })),

  me: () => Promise.resolve(JSON.parse(localStorage.getItem('naga_user'))),
}
