export type Priority = 'low' | 'medium' | 'high'
export type TaskStatus = 'pending' | 'in_progress' | 'done'
export type GoalTimeframe = 'short' | 'medium' | 'long'
export type FinanceType = 'income' | 'expense'
export type AreaSlug = 'college' | 'work' | 'health' | 'personal' | 'finances' | 'goals'

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
}

export interface LifeArea {
  id: string
  user_id: string
  name: string
  slug: AreaSlug | string
  icon: string
  color: string
  sort_order: number
  created_at: string
  _count?: {
    tasks: number
    goals: number
  }
}

export interface Task {
  id: string
  user_id: string
  area_id?: string
  page_id?: string
  title: string
  description?: string
  priority: Priority
  status: TaskStatus
  due_date?: string
  created_at: string
  area?: LifeArea
  subtasks?: Subtask[]
}

export interface Subtask {
  id: string
  task_id: string
  title: string
  completed: boolean
}

export interface Goal {
  id: string
  user_id: string
  area_id?: string
  title: string
  timeframe: GoalTimeframe
  progress: number
  target_date?: string
  status: TaskStatus
  created_at: string
  area?: LifeArea
}

export interface FinancialEntry {
  id: string
  user_id: string
  type: FinanceType
  amount: number
  category: string
  description?: string
  date: string
  created_at: string
}

export interface Page {
  id: string
  area_id: string
  user_id: string
  title: string
  content?: string
  created_at: string
}

export interface DashboardData {
  todayTasks: Task[]
  upcomingTasks: Task[]
  activeGoals: Goal[]
  monthlyBalance: number
  totalIncome: number
  totalExpenses: number
  recentEntries: FinancialEntry[]
}
