// ============================================================
// CORE DOMAIN TYPES
// ============================================================

export type UserRole = 'admin' | 'operator'

export interface User {
  id: string
  matricula: string
  nome: string
  tipo: UserRole
  cargo?: string
  created_at: string
}

export interface Employee {
  id: string
  nome: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export type CarVersion = 'L3 Exclusive' | 'L2 Advanced'

export interface Production {
  id: string
  vin: string
  employee_id: string
  versao: CarVersion
  timestamp: string
  // joined
  employee?: Employee
}

export interface Settings {
  id: string
  meta: number
  turno_inicio: string // HH:MM
  turno_fim: string    // HH:MM
  hora_extra: string   // HH:MM
  updated_at: string
}

// ============================================================
// DASHBOARD TYPES
// ============================================================

export interface DashboardStats {
  totalBipados: number
  meta: number
  progressPercent: number
  mediaHora: number
  tempoDecorrido: string
}

export interface HourlyProduction {
  hora: string       // "06h", "07h", ...
  horaNum: number    // 6, 7, ...
  quantidade: number
  objetivo: number   // Meta daquela hora
  isCurrent: boolean
}

export interface RankingEntry {
  employee: Employee
  quantidade: number
  percentual: number
  posicao: number
}

export interface LastProduction {
  vin: string
  employeeName: string
  versao: CarVersion
  timestamp: string
}

// ============================================================
// FORM TYPES
// ============================================================

export interface LoginForm {
  matricula: string
  senha: string
}

export interface RegisterAssemblyForm {
  employee_id: string
  versao: CarVersion | null
  vin: string
}

export interface EmployeeForm {
  nome: string
  ativo: boolean
}

export interface SettingsForm {
  meta: number
  turno_inicio: string
  turno_fim: string
  hora_extra: string
}

// ============================================================
// FILTER TYPES
// ============================================================

export interface HistoricoFilters {
  vin: string
  employee_id: string
  data_inicio: string
  data_fim: string
}

// ============================================================
// REALTIME TYPES
// ============================================================

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE'

export interface RealtimePayload<T> {
  eventType: RealtimeEvent
  new: T
  old: Partial<T>
  schema: string
  table: string
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}

// ============================================================
// SUPABASE DATABASE TYPES
// ============================================================

export interface UserRow {
  id: string
  matricula: string
  nome: string
  tipo: UserRole
  cargo: string | null
  created_at: string
}

export interface EmployeeRow {
  id: string
  nome: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface ProductionRow {
  id: string
  vin: string
  employee_id: string
  versao: CarVersion
  timestamp: string
}

export interface SettingsRow {
  id: string
  meta: number
  turno_inicio: string
  turno_fim: string
  hora_extra: string
  updated_at: string
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserRow
        Insert: {
          id?: string
          matricula: string
          nome: string
          tipo: UserRole
          cargo?: string
        }
        Update: {
          matricula?: string
          nome?: string
          tipo?: UserRole
          cargo?: string
        }
        Relationships: []
      }
      employees: {
        Row: EmployeeRow
        Insert: {
          nome: string
          ativo?: boolean
        }
        Update: {
          nome?: string
          ativo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      productions: {
        Row: ProductionRow
        Insert: {
          vin: string
          employee_id: string
          versao: CarVersion
        }
        Update: {
          vin?: string
          employee_id?: string
          versao?: CarVersion
        }
        Relationships: [
          {
            foreignKeyName: "productions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          }
        ]
      }
      settings: {
        Row: SettingsRow
        Insert: {
          meta: number
          turno_inicio: string
          turno_fim: string
          hora_extra: string
        }
        Update: {
          meta?: number
          turno_inicio?: string
          turno_fim?: string
          hora_extra?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      today_ranking: {
        Row: {
          employee_id: string
          employee_nome: string
          ativo: boolean
          quantidade: number
          percentual: number
        }
      }
      hourly_production_today: {
        Row: {
          hora: number
          quantidade: number
        }
      }
    }
    Functions: {
      get_monthly_report: {
        Args: {
          p_year: number
          p_month: number
        }
        Returns: {
          employee_nome: string
          total_producao: number
          l3_exclusive: number
          l2_advanced: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
