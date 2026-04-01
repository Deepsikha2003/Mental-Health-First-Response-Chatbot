// ─────────────────────────────────────────────────────────────
//  pages/SignupPage.jsx
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

function StrengthBar({ password }) {
  let score = 0
  if (password.length >= 6)  score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const colors = ['bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-green-400']
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300
              ${i < score ? colors[score - 1] : 'bg-[#2d3748]'}`}
          />
        ))}
      </div>
      {password && (
        <p className={`text-[10px] mt-1 ${score <= 1 ? 'text-red-400' : score <= 2 ? 'text-amber-400' : 'text-green-400'}`}>
          {labels[score]}
        </p>
      )}
    </div>
  )
}

export default function SignupPage() {
  const { signup }   = useAuth()
  const navigate     = useNavigate()
  const [form, setForm]       = useState({ email: '', username: '', full_name: '', password: '', confirm: '' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const validate = () => {
    const e = {}
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (form.username.length < 3) e.username = 'At least 3 characters'
    if (form.password.length < 6) e.password = 'At least 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await signup({
        email: form.email,
        username: form.username,
        full_name: form.full_name || undefined,
        password: form.password,
      })
      toast.success('Account created! Welcome 🎉')
      navigate('/chat')
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Signup failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-[#7a94ad] uppercase tracking-wider mb-2">
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl bg-[#1a1d27] border text-[#e8eef5] text-sm
          placeholder-[#7a94ad]/60 outline-none transition-all
          ${errors[key] ? 'border-red-500/60' : 'border-[rgba(99,179,193,0.15)] focus:border-[#63b3c1]'}
          focus:ring-2 focus:ring-[#63b3c1]/10`}
      />
      {errors[key] && <p className="text-xs text-red-400 mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0f1117]">
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
          <p className="text-sm text-[#7a94ad] mt-1">Create your free account</p>
        </div>

        <div className="glass rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-[#e8eef5] mb-6">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {field('username', 'Username', 'text', 'johndoe')}
              {field('full_name', 'Full Name (opt.)', 'text', 'John Doe')}
            </div>
            {field('email', 'Email Address', 'email', 'you@example.com')}

            {/* Password with strength */}
            <div>
              <label className="block text-xs font-medium text-[#7a94ad] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a strong password"
                  className={`w-full px-4 py-3 pr-11 rounded-xl bg-[#1a1d27] border text-[#e8eef5] text-sm
                    placeholder-[#7a94ad]/60 outline-none transition-all
                    ${errors.password ? 'border-red-500/60' : 'border-[rgba(99,179,193,0.15)] focus:border-[#63b3c1]'}
                    focus:ring-2 focus:ring-[#63b3c1]/10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a94ad] hover:text-[#b0c4d4]"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <StrengthBar password={form.password} />
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>

            {field('confirm', 'Confirm Password', 'password', 'Repeat password')}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#3d8fa0] to-[#63b3c1]
                text-white font-semibold text-sm flex items-center justify-center gap-2
                hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50
                shadow-lg shadow-[#63b3c1]/20"
            >
              {loading ? <Spinner size="sm" /> : <><UserPlus className="w-4 h-4" /> Create Account</>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[rgba(99,179,193,0.1)]" />
            <span className="text-xs text-[#7a94ad]">or</span>
            <div className="flex-1 h-px bg-[rgba(99,179,193,0.1)]" />
          </div>

          <p className="text-center text-sm text-[#7a94ad]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#63b3c1] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-[#7a94ad]/60 mt-6">
          🔒 Your data is private. We never share your conversations.
        </p>
      </div>
    </div>
  )
}
