'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Activity = {
  id: number
  title: string
  duration: number
  durationUnit: string
  frequency: number
  frequencyUnit: string
  user_id: string
}

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState({ name: '', ageNow: 0, ageEnd: 0 })
  const [activities, setActivities] = useState<Activity[]>([])
  const [form, setForm] = useState({
    title: '',
    duration: 30,
    durationUnit: 'minutes',
    frequency: 1,
    frequencyUnit: 'week',
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<Activity>>({})

  const firstName = profile.name.split(' ')[0] || ''
  const yearsLeft = Math.max(profile.ageEnd - profile.ageNow, 0)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile({
          name: profileData.name || '',
          ageNow: Number(profileData.age_now) || 0,
          ageEnd: Number(profileData.age_estimate) || 0,
        })
      }

      const { data: acts } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)

      if (acts) setActivities(acts)
    }

    load()
  }, [router])

  const handleAdd = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!form.title.trim() || !user) return

    const { error } = await supabase.from('activities').insert({
      ...form,
      user_id: user!.id,
      completed: false
    })

    if (error) {
      console.error('Insert error:', error.message)
      return
    }

    setForm({ ...form, title: '' })

    const { data: updated } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user!.id)

    if (updated) setActivities(updated)
  }

  const handleDelete = async (id: number) => {
    await supabase.from('activities').delete().eq('id', id)
    setActivities(prev => prev.filter(a => a.id !== id))
  }

  const handleSaveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').upsert({
      id: user!.id,
      name: profile.name,
      age_now: profile.ageNow,
      age_estimate: profile.ageEnd,
    })
  }

  const handleEdit = (activity: Activity) => {
    setEditingId(activity.id)
    setEditForm({ ...activity })
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    const { error } = await supabase.from('activities').update(editForm).eq('id', editingId)
    if (error) {
      console.error('Update error:', error.message)
      return
    }
    setEditingId(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('activities').select('*').eq('user_id', user!.id)
    if (data) setActivities(data)
  }

  return (
    <main className="min-h-screen bg-[#202123] text-white px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">
        {firstName ? (
          <>
            Hey {firstName}!<br />
            <span className="text-lg font-normal">
              Here's your bucket list for the next {yearsLeft} {yearsLeft === 1 ? 'year' : 'years'}!
            </span>
          </>
        ) : 'Your Bucket List'}
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#343541] p-6 rounded-xl border border-[#3f4045]">
          <h2 className="text-lg font-bold mb-4">Add New Activity</h2>
          <input type="text" placeholder="New activity" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-[#2a2b32] text-white border border-[#3f4045] rounded-md p-2 mb-4" />
          <div className="flex flex-wrap items-center gap-2 mb-6 text-green-400 font-medium">
            <span>For</span>
            <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className="w-20 text-white bg-[#2a2b32] border border-[#3f4045] rounded-md p-2 text-center" />
            <select value={form.durationUnit} onChange={(e) => setForm({ ...form, durationUnit: e.target.value })} className="bg-[#2a2b32] text-white border border-[#3f4045] rounded-md p-2">
              <option value="minutes">minutes</option>
              <option value="hours">hours</option>
              <option value="days">days</option>
            </select>
            <input type="number" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: Number(e.target.value) })} className="w-20 text-white bg-[#2a2b32] border border-[#3f4045] rounded-md p-2 text-center" />
            <span>times a</span>
            <select value={form.frequencyUnit} onChange={(e) => setForm({ ...form, frequencyUnit: e.target.value })} className="bg-[#2a2b32] text-white border border-[#3f4045] rounded-md p-2">
              <option value="day">day</option>
              <option value="week">week</option>
              <option value="month">month</option>
              <option value="year">year</option>
            </select>
          </div>
          <button onClick={handleAdd} className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition">Add Activity</button>
        </div>

        <div className="bg-[#343541] p-6 rounded-xl border border-[#3f4045]">
          <h2 className="text-lg font-bold mb-4">Your Profile</h2>
          <input type="text" placeholder="Full name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full bg-[#2a2b32] text-white border border-[#3f4045] rounded-md p-2 mb-6" />
          <div className="flex flex-wrap items-center gap-2 mb-6 text-green-400 font-medium text-lg">
            <span>I am</span>
            <input type="number" value={profile.ageNow} onChange={(e) => setProfile({ ...profile, ageNow: Number(e.target.value) })} className="w-20 text-white bg-[#2a2b32] border border-[#3f4045] rounded-md p-2 text-center" />
            <span>years old</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-6 text-green-400 font-medium text-lg">
            <span>and hope to live until I’m at least</span>
            <input type="number" value={profile.ageEnd} onChange={(e) => setProfile({ ...profile, ageEnd: Number(e.target.value) })} className="w-20 text-white bg-[#2a2b32] border border-[#3f4045] rounded-md p-2 text-center" />
            <span>years old</span>
          </div>
          <button onClick={handleSaveProfile} className="w-full bg-[#2a2b32] border border-[#8e8e8e] text-white py-2 rounded-md hover:bg-[#3a3b40] transition">Save Profile</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {activities.map((a) => {
          const freqPerYear = a.frequency * (a.frequencyUnit === 'day' ? 365 : a.frequencyUnit === 'week' ? 52 : a.frequencyUnit === 'month' ? 12 : 1)
          const estimatedRemaining = yearsLeft * freqPerYear

          return (
            <div key={a.id} className="bg-[#343541] border border-[#3f4045] rounded-lg p-4 relative">
              {editingId === a.id ? (
                <>
                  <input type="text" value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full bg-[#2a2b32] text-white border border-[#3f4045] rounded-md p-2 mb-2" />
                  <div className="flex gap-2 mb-2">
                    <input type="number" value={editForm.duration || 0} onChange={(e) => setEditForm({ ...editForm, duration: Number(e.target.value) })} className="w-20 bg-[#2a2b32] text-white border border-[#3f4045] rounded-md p-2" />
                    <select value={editForm.durationUnit || 'minutes'} onChange={(e) => setEditForm({ ...editForm, durationUnit: e.target.value })} className="bg-[#2a2b32] text-white border border-[#3f4045] rounded-md p-2">
                      <option value="minutes">minutes</option>
                      <option value="hours">hours</option>
                      <option value="days">days</option>
                    </select>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <input type="number" value={editForm.frequency || 0} onChange={(e) => setEditForm({ ...editForm, frequency: Number(e.target.value) })} className="w-20 bg-[#2a2b32] text-white border border-[#3f4045] rounded-md p-2" />
                    <select value={editForm.frequencyUnit || 'week'} onChange={(e) => setEditForm({ ...editForm, frequencyUnit: e.target.value })} className="bg-[#2a2b32] text-white border border-[#3f4045] rounded-md p-2">
                      <option value="day">day</option>
                      <option value="week">week</option>
                      <option value="month">month</option>
                      <option value="year">year</option>
                    </select>
                  </div>
                  <button onClick={handleSaveEdit} className="text-sm text-white border border-green-500 rounded px-3 py-1 hover:bg-green-500 hover:text-black">Save</button>
                </>
              ) : (
                <>
                  <h3 className="font-medium mb-1">{a.title}</h3>
                  <p className="text-sm text-gray-300 mb-2">{a.duration} {a.durationUnit} / {a.frequency}x per {a.frequencyUnit}</p>
                  <div className="w-full h-2 bg-[#3f4045] rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${profile.ageEnd > 0 ? Math.round((yearsLeft / profile.ageEnd) * 100) : 0}%` }} />
                  </div>
                  <p className="text-xs text-right text-gray-400 mt-1">{profile.ageEnd > 0 ? Math.round((yearsLeft / profile.ageEnd) * 100) : 0}% of your life remains</p>
                  <p className="text-xs text-gray-400 mt-1">~{estimatedRemaining.toLocaleString()} left</p>
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button onClick={() => handleEdit(a)} className="text-sm text-white border border-[#8e8e8e] rounded px-2 hover:text-blue-400 hover:border-blue-400 transition">Edit</button>
                    <button onClick={() => handleDelete(a.id)} className="text-sm text-white border border-[#8e8e8e] rounded px-2 hover:text-red-400 hover:border-red-400 transition">Delete</button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}