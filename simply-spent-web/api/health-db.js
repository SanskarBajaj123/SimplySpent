import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  )
  await supabase.from('transactions').select('id').limit(1)
  res.status(200).json({ status: 'ok', db: 'connected' })
}
