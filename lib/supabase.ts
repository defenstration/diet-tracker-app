import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();

export type Database = {
  public: {
    Tables: {
      foods: {
        Row: {
          id: string
          created_at: string
          name: string
          calories: number
          protein: number
          carbs: number
          fat: number
          barcode?: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          calories: number
          protein: number
          carbs: number
          fat: number
          barcode?: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          barcode?: string
          user_id?: string
        }
      }
      food_logs: {
        Row: {
          id: string
          created_at: string
          food_id: string
          user_id: string
          date: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          quantity: number
        }
        Insert: {
          id?: string
          created_at?: string
          food_id: string
          user_id: string
          date: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          quantity: number
        }
        Update: {
          id?: string
          created_at?: string
          food_id?: string
          user_id?: string
          date?: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          quantity?: number
        }
      }
      weight_records: {
        Row: {
          id: string
          created_at: string
          user_id: string
          date: string
          weight: number
          notes?: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          date: string
          weight: number
          notes?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          date?: string
          weight?: number
          notes?: string
        }
      }
      exercise_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string
          date: string
          exercise_type: string
          duration: number
          calories_burned: number
          notes?: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          date: string
          exercise_type: string
          duration: number
          calories_burned: number
          notes?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          date?: string
          exercise_type?: string
          duration?: number
          calories_burned?: number
          notes?: string
        }
      }
      milestones: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          description: string
          target_date: string
          completed: boolean
          completed_at?: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          description: string
          target_date: string
          completed: boolean
          completed_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          description?: string
          target_date?: string
          completed?: boolean
          completed_at?: string
        }
      }
    }
  }
} 