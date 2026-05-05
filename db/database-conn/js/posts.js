import { supabase } from './supabase.js'

export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, created_at, users(nickname)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getPost(id) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, users(nickname)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createPost(title, content) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')

  const { data, error } = await supabase
    .from('posts')
    .insert({ title, content, user_id: user.id })
    .select().single()
  if (error) throw error
  return data
}

export async function updatePost(id, title, content) {
  const { data, error } = await supabase
    .from('posts')
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select().single()
  if (error) throw error
  return data
}

export async function deletePost(id) {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}