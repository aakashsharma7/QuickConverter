import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface FileRecord {
  id: string
  name: string
  size: number
  type: string
  url: string
  user_id?: string
  created_at: string
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  conversion_type?: string
  original_format?: string
  target_format?: string
}

export interface ConversionJob {
  id: string
  file_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  conversion_type: string
  original_format: string
  target_format: string
  created_at: string
  completed_at?: string
  error_message?: string
  output_url?: string
} 