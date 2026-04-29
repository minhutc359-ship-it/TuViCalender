import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface DailyPrediction {
  id: string;
  user_id: string;
  prediction_date: string;
  fortune_score: number;
  love_score: number;
  career_score: number;
  health_score: number;
  lucky_color: string;
  lucky_numbers: string[];
  lucky_direction: string;
  lucky_hours: string;
  summary: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface BirthProfile {
  id: string;
  user_id: string;
  birth_date: string;
  birth_time?: string;
  birth_place?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

// Helper functions
export async function getDailyPrediction(userId: string, date: string): Promise<DailyPrediction | null> {
  try {
    const { data, error } = await supabase
      .from('daily_predictions')
      .select('*')
      .eq('user_id', userId)
      .eq('prediction_date', date)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  } catch (err) {
    console.error('Error fetching daily prediction:', err);
    return null;
  }
}

export async function saveChatMessage(
  userId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<ChatMessage | null> {
  try {
    const { data, error } = await supabase
      .from('chat_histories')
      .insert({ user_id: userId, role, content })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error saving chat message:', err);
    return null;
  }
}

export async function getChatHistory(userId: string, limit = 50): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chat_histories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching chat history:', err);
    return [];
  }
}

export async function saveTarotSession(
  userId: string,
  cardsSelected: number[],
  interpretation: any
): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('tarot_sessions')
      .insert({ user_id: userId, cards_selected: cardsSelected, interpretation })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error saving tarot session:', err);
    return null;
  }
}

export async function getGoodDays(
  userId: string,
  month: string,
  eventType?: string
): Promise<any[]> {
  try {
    let query = supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .gte('event_date', `${month}-01`)
      .lt('event_date', `${month}-31`)
      .eq('is_good_day', true);

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching good days:', err);
    return [];
  }
}

export async function getBirthProfile(userId: string): Promise<BirthProfile | null> {
  try {
    const { data, error } = await supabase
      .from('birth_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  } catch (err) {
    console.error('Error fetching birth profile:', err);
    return null;
  }
}

export async function saveBirthProfile(profile: Partial<BirthProfile>): Promise<BirthProfile | null> {
  try {
    const { data, error } = await supabase
      .from('birth_profiles')
      .upsert(profile)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error saving birth profile:', err);
    return null;
  }
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key';
}
