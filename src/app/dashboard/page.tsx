'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ActivityCard from '@/components/ActivityCard'
import ProgressBar from '@/components/ProgressBar'

export default function Dashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [form, setForm] = useState({
    name: '',
    frequency: '',
    duration: '',
    unit: 'minutes'
  })

  const percentageOfLifeLeft = () => {
    if (!profile) return 100
    const currentAge = profile.current_age
    const deathAge = profile.estimated_death_age
    return Math.max(0, Math.min(100, ((deathAge - currentAge) / deathAge) * 100))
  }

  const daysLeft = () => {
    if (!profile) return 0
    const yearsLeft = profile.estimated_death_age - profile.current_age
    return Math.max(0, Math.floor(yearsLeft * 365.25))
  }

  useEffect(() => {
    const getUserAndData = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/')
        return
      }

      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      const { data: activityData } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)

      setActivities(activityData || [])
    }

    getUserAndData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const userId = user?.id ?? ''
    if (!userId) {
      throw new Error('User not found. Please sign in.')
    }

    const { error } = await supabase.from('activities').insert({
      ...form,
      user_id: userId,
      completed: false
    })

    if (!error) {
      const { data: updatedActivities } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)

      setActivities(updatedActivities || [])
      setForm({
        name: '',
        frequency: '',
        duration: '',
        unit: 'minutes'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Navbar />
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-2">Your Dashboard</h1>
        <p className="text-lg">You have approximately <strong>{daysLeft()}</strong> days left to live.</p>
        <ProgressBar percentage={percentageOfLifeLeft()} />
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Activity</h2>
        <input
          type="text"
          name="name"
          placeholder="Activity name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full p-2 mb-3 border rounded"
        />
        <input
          type="number"
          name="frequency"
          placeholder="Frequency (e.g. 3)"
          value={form.frequency}
          onChange={handleChange}
          required
          className="w-full p-2 mb-3 border rounded"
        />
        <select
          name="unit"
          value={form.unit}
          onChange={handleChange}
          className="w-full p-2 mb-3 border rounded"
        >
          <option value="day">Per Day</option>
          <option value="week">Per Week</option>
          <option value="month">Per Month</option>
          <option value="year">Per Year</option>
        </select>
        <input
          type="number"
          name="duration"
          placeholder="Duration (e.g. 60)"
          value={form.duration}
          onChange={handleChange}
          required
          className="w-full p-2 mb-3 border rounded"
        />
        <select
          name="unit"
          value={form.unit}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded"
        >
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
          <option value="days">Days</option>
        </select>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Add Activity
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} profile={profile} />
        ))}
      </div>
    </div>
  )
}