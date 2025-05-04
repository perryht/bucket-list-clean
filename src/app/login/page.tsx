'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.push('/dashboard')
    }
    check()
  }, [router])

  const handleLogin = async () => {
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/dashboard')
  }

  const handleRegister = async () => {
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#202123] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#343541] border border-[#3f4045] p-6 rounded-xl">
        <h1 className="text-xl font-semibold mb-4">Log in / Register</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[#2a2b32] text-white border border-[#3f4045] p-2 mb-3 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-[#2a2b32] text-white border border-[#3f4045] p-2 mb-4 rounded"
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="flex gap-2">
          <button onClick={handleLogin} className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">Log In</button>
          <button onClick={handleRegister} className="w-full bg-[#2a2b32] text-white border border-[#8e8e8e] py-2 rounded hover:bg-[#3a3b40]">Register</button>
        </div>
      </div>
    </main>
  )
}
