import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

export interface ProgressEntry {
  grade: number
  subject: string
  topicId: string
  topicTitle: string
  completedAt: string
  score?: number
  totalQuestions?: number
}

interface ProgressCtx {
  entries: ProgressEntry[]
  addEntry: (e: ProgressEntry) => void
  dailyGoal: number
  setDailyGoal: (n: number) => void
  todayCount: number
}

const ProgressContext = createContext<ProgressCtx | null>(null)

const STORAGE_KEY = 'meybi-progress'
const GOAL_KEY = 'meybi-daily-goal'

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ProgressEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const [dailyGoal, setDailyGoalState] = useState(() => {
    const g = localStorage.getItem(GOAL_KEY)
    return g ? Number(g) : 2
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const setDailyGoal = (n: number) => {
    setDailyGoalState(n)
    localStorage.setItem(GOAL_KEY, String(n))
  }

  const addEntry = useCallback((e: ProgressEntry) => {
    setEntries(prev => [e, ...prev].slice(0, 100))
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const todayCount = entries.filter(e => e.completedAt.startsWith(today)).length

  return (
    <ProgressContext.Provider value={{ entries, addEntry, dailyGoal, setDailyGoal, todayCount }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
