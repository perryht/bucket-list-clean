'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      <nav className="bg-[#343541] text-white px-4 py-3 flex items-center justify-between border-b border-[#3f4045]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(!open)}
            className="text-xl px-2 py-1 rounded hover:bg-[#2a2b32] focus:outline-none"
          >
            ☰
          </button>
          <div className="font-semibold text-lg">🧭 BucketList</div>
        </div>
      </nav>

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#343541] border-r border-[#3f4045] p-6 transform transition-transform duration-300 ease-in-out z-40 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <h2 className="text-xl font-bold mb-6">Menu</h2>
        <ul className="flex flex-col gap-4 text-sm">
          <li>
            <Link href="/" className="hover:text-green-400" onClick={() => setOpen(false)}>
              🏠 Home
            </Link>
          </li>
          <li>
            <Link href="/stats" className="hover:text-green-400" onClick={() => setOpen(false)}>
              📊 Stats
            </Link>
          </li>
          <li>
            <button
              onClick={() => {
                handleLogout()
                setOpen(false)
              }}
              className="hover:text-red-400"
            >
              🚪 Logout
            </button>
          </li>
        </ul>
      </div>

      {/* background overlay when open */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
