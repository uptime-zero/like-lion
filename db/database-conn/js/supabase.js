import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://hvwisjknznujivrapxtd.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2d2lzamtuem51aml2cmFweHRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzI5NTgsImV4cCI6MjA5Mjk0ODk1OH0.bqU27FyM1B_ZyKtZaIRiVhwb4VUAuEg5uUhm9KB1HAA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)