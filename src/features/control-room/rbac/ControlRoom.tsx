import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface Session {
  user_id: string
  role: string
  branch_id: string
  last_seen: string
  is_active: boolean
}

export default function ControlRoom() {
  const [sessions, setSessions] = useState<Session[]>([])

  const fetchSessions = async () => {
    const { data } = await supabase
      .from("user_sessions")
      .select("*")
      .order("last_seen", { ascending: false })

    if (data) setSessions(data)
  }

  useEffect(() => {
    fetchSessions()

    const channel = supabase
      .channel('live-sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_sessions' }, fetchSessions)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-2xl font-bold text-white">Live Session Monitor</h1>

      <div className="luxury-card p-6">
        {sessions.map(s => (
          <div key={s.user_id} className="border-b border-white/10 py-3 flex justify-between">
            <div>
              <div className="text-white">{s.user_id.slice(0,8)}...</div>
              <div className="text-xs text-white/40">{s.role}</div>
            </div>
            <div className="text-sm text-emerald-400">
              {Math.floor((Date.now() - new Date(s.last_seen).getTime())/1000)}s ago
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
