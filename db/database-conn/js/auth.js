import { supabase } from './supabase.js'

export async function signUp(email, password, nickname) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error

  await supabase.from('users').update({ nickname }).eq('id', data.user.id)
  
  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
  location.href = 'index.html'
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}