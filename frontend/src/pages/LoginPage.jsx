// ─────────────────────────────────────────────────────────────
//  pages/LoginPage.jsx
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

export default function LoginPage() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const validate = () => {
    const e = {}
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (form.password.length < 6) e.password = 'At least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back! 🌿')
      navigate('/chat')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0f1117]">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#63b3c1]/5 blur-3xl" />
        <div className="absolute bottom-10 -right-10 w-60 h-60 rounded-full bg-[#a8d8b9]/4 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#3d8fa0] to-[#a8d8b9]
            flex items-center justify-center text-3xl shadow-lg shadow-[#63b3c1]/20">
            🧠
          </div>
          <h1 className="text-3xl font-bold text-[#e8eef5]">
            Naga <span className="text-[#63b3c1] italic">AI</span>
          </h1>
          <p className="text-sm text-[#7a94ad] mt-1">Mental Health First Response</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-[#e8eef5] mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[#7a94ad] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-xl bg-[#1a1d27] border text-[#e8eef5] text-sm
                  placeholder-[#7a94ad]/60 outline-none transition-all
                  ${errors.email ? 'border-red-500/60 focus:border-red-500' : 'border-[rgba(99,179,193,0.15)] focus:border-[#63b3c1]'}
                  focus:ring-2 focus:ring-[#63b3c1]/10`}
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-[#7a94ad] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Your password"
                  className={`w-full px-4 py-3 pr-11 rounded-xl bg-[#1a1d27] border text-[#e8eef5] text-sm
                    placeholder-[#7a94ad]/60 outline-none transition-all
                    ${errors.password ? 'border-red-500/60 focus:border-red-500' : 'border-[rgba(99,179,193,0.15)] focus:border-[#63b3c1]'}
                    focus:ring-2 focus:ring-[#63b3c1]/10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a94ad] hover:text-[#b0c4d4] transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#3d8fa0] to-[#63b3c1]
                text-white font-semibold text-sm flex items-center justify-center gap-2
                hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg shadow-[#63b3c1]/20"
            >
              {loading ? <Spinner size="sm" /> : <><LogIn className="w-4 h-4" /> Sign In</>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[rgba(99,179,193,0.1)]" />
            <span className="text-xs text-[#7a94ad]">or</span>
            <div className="flex-1 h-px bg-[rgba(99,179,193,0.1)]" />
          </div>

          <p className="text-center text-sm text-[#7a94ad]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#63b3c1] hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-[#7a94ad]/60 mt-6">
          🔒 Your conversations are private and confidential
        </p>
      </div>
    </div>
  )
}
