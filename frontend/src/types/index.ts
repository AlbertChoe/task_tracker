export type Status = 'BELUM_DIMULAI' | 'SEDANG_DIKERJAKAN' | 'SELESAI'

export interface Task {
  id: string
  title: string
  description?: string
  assignee?: string
  status: Status
  created_at: string
  created_by: string
  start_date?: string
  due_date?: string
  completed_at?: string
}

export interface TaskLog {
  id: string
  task_id: string
  event: string
  detail?: string
  created_at: string
}
