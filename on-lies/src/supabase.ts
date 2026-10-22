import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string;
  role_title: string;
  level: number;
  total_xp: number;
  streak_days: number;
  rank: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  avatar_url: string;
  role_title: string;
  level: number;
  total_xp: number;
  streak_days: number;
  is_authenticated: boolean;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Detect if real Supabase keys are provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-id')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial starter roster for the leaderboard when database is empty or running local mock
const INITIAL_MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { user_id: 'agent-1', username: 'Hoàng Long', avatar_url: 'HL', role_title: 'Thanh tra cấp 5', level: 5, total_xp: 4890, streak_days: 14, rank: 1 },
  { user_id: 'agent-2', username: 'Mai Anh', avatar_url: 'MA', role_title: 'Cảnh sát mạng', level: 4, total_xp: 4120, streak_days: 12, rank: 2 },
  { user_id: 'agent-3', username: 'Tuấn Kiệt', avatar_url: 'TK', role_title: 'Chuyên gia Mail', level: 4, total_xp: 3750, streak_days: 8, rank: 3 },
  { user_id: 'agent-4', username: 'Bảo Trâm', avatar_url: 'BT', role_title: 'Đặc vụ Thực tập', level: 2, total_xp: 2100, streak_days: 3, rank: 4 },
  { user_id: 'agent-5', username: 'Minh Đức', avatar_url: 'MĐ', role_title: 'Tân binh', level: 1, total_xp: 1820, streak_days: 2, rank: 5 },
];

const LOCAL_STORAGE_PROFILE_KEY = 'on-lies-user-profile';
const LOCAL_STORAGE_LEADERBOARD_KEY = 'on-lies-local-leaderboard';

function getLocalLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LEADERBOARD_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [...INITIAL_MOCK_LEADERBOARD];
}

function saveLocalLeaderboard(data: LeaderboardEntry[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_LEADERBOARD_KEY, JSON.stringify(data));
  } catch {
    // fallback
  }
}

export function getLocalProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {
    id: 'local-guest-id',
    username: 'Bạn (Đặc vụ Tân binh)',
    email: null,
    avatar_url: '👤',
    role_title: 'Tân binh',
    level: 1,
    total_xp: 0,
    streak_days: 1,
    is_authenticated: false,
  };
}

export function saveLocalProfile(profile: UserProfile) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // fallback
  }
}

/**
 * Fetch leaderboard rankings.
 * If Supabase is connected, queries `leaderboard_view` or `profiles`.
 * Otherwise, uses localized mock store.
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('leaderboard_view')
        .select('*')
        .order('total_xp', { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        return data as LeaderboardEntry[];
      }

      // If view doesn't exist yet, query profiles directly
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .order('total_xp', { ascending: false })
        .limit(20);

      if (!pError && profiles && profiles.length > 0) {
        return profiles.map((p, idx) => ({
          user_id: p.id,
          username: p.username,
          avatar_url: p.avatar_url || p.username.slice(0, 2).toUpperCase(),
          role_title: p.role_title || 'Đặc vụ',
          level: p.level || 1,
          total_xp: p.total_xp || 0,
          streak_days: p.streak_days || 1,
          rank: idx + 1,
        }));
      }
    } catch (e) {
      console.warn('Supabase query failed, falling back to local leaderboard:', e);
    }
  }

  // Local/Offline Fallback with current user integrated
  const localList = getLocalLeaderboard();
  const currentProfile = getLocalProfile();

  // If user has earned XP, blend them into local leaderboard ranking
  const existingIdx = localList.findIndex(e => e.user_id === currentProfile.id);
  const userEntry: LeaderboardEntry = {
    user_id: currentProfile.id,
    username: currentProfile.username,
    avatar_url: currentProfile.avatar_url,
    role_title: currentProfile.role_title,
    level: currentProfile.level,
    total_xp: currentProfile.total_xp,
    streak_days: currentProfile.streak_days,
    rank: 1,
  };

  if (existingIdx >= 0) {
    localList[existingIdx] = userEntry;
  } else if (currentProfile.total_xp > 0) {
    localList.push(userEntry);
  }

  // Sort by XP
  localList.sort((a, b) => b.total_xp - a.total_xp);
  return localList.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

/**
 * Get current authenticated user or local guest profile.
 */
export async function getCurrentProfile(): Promise<UserProfile> {
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          return {
            id: user.id,
            username: profile.username,
            email: user.email || null,
            avatar_url: profile.avatar_url || '👤',
            role_title: profile.role_title || 'Tân binh',
            level: profile.level || 1,
            total_xp: profile.total_xp || 0,
            streak_days: profile.streak_days || 1,
            is_authenticated: true,
          };
        }
      }
    } catch (e) {
      console.warn('Error fetching Supabase user, using local profile:', e);
    }
  }

  return getLocalProfile();
}

/**
 * Record completed training session score.
 * Updates local XP and optionally persists to Supabase if signed in.
 */
export async function recordGameScore(
  gameMode: 'mail' | 'phone' | 'sms' | 'inspector',
  score: number,
  maxScore: number,
  livesLeft: number
): Promise<{ xpEarned: number; newTotalXp: number; newLevel: number; requiresLogin: boolean }> {
  const xpEarned = score * 100 + livesLeft * 50;
  const profile = getLocalProfile();

  profile.total_xp += xpEarned;
  if (profile.total_xp >= 4000) {
    profile.level = 5;
    profile.role_title = 'Thanh tra cấp 5';
  } else if (profile.total_xp >= 3000) {
    profile.level = 4;
    profile.role_title = 'Cảnh sát mạng';
  } else if (profile.total_xp >= 2000) {
    profile.level = 3;
    profile.role_title = 'Chuyên gia an ninh';
  } else if (profile.total_xp >= 1000) {
    profile.level = 2;
    profile.role_title = 'Đặc vụ Thực tập';
  }
  saveLocalProfile(profile);

  // Update local leaderboard
  const list = getLocalLeaderboard();
  const foundIdx = list.findIndex(e => e.user_id === profile.id);
  const entry: LeaderboardEntry = {
    user_id: profile.id,
    username: profile.username,
    avatar_url: profile.avatar_url,
    role_title: profile.role_title,
    level: profile.level,
    total_xp: profile.total_xp,
    streak_days: profile.streak_days,
    rank: 1,
  };
  if (foundIdx >= 0) list[foundIdx] = entry; else list.push(entry);
  list.sort((a, b) => b.total_xp - a.total_xp);
  saveLocalLeaderboard(list);

  let requiresLogin = !profile.is_authenticated;

  // If user is authenticated in Supabase, push the game record
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        requiresLogin = false;
        const accuracy = Math.round((score / Math.max(1, maxScore)) * 100);
        await supabase.from('game_records').insert({
          user_id: user.id,
          game_mode: gameMode,
          score,
          max_score: maxScore,
          lives_left: livesLeft,
          accuracy,
          xp_earned: xpEarned,
        });
      }
    } catch (e) {
      console.warn('Could not save to Supabase:', e);
    }
  }

  return {
    xpEarned,
    newTotalXp: profile.total_xp,
    newLevel: profile.level,
    requiresLogin,
  };
}

/**
 * Sign in using Supabase Auth or mock local account
 */
export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };

      if (data.user) {
        const profile = await getCurrentProfile();
        saveLocalProfile(profile);
        return { success: true };
      }
    } catch (e: any) {
      return { success: false, error: e?.message || 'Lỗi đăng nhập' };
    }
  }

  // Offline / Mock fallback
  const profile = getLocalProfile();
  profile.email = email;
  profile.username = email.split('@')[0];
  profile.is_authenticated = true;
  saveLocalProfile(profile);
  return { success: true };
}

/**
 * Sign up using Supabase Auth or mock local account
 */
export async function signUp(email: string, password: string, username: string): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
            avatar_url: '👤',
          },
        },
      });

      if (error) return { success: false, error: error.message };
      if (data.user) {
        const profile = await getCurrentProfile();
        saveLocalProfile(profile);
        return { success: true };
      }
    } catch (e: any) {
      return { success: false, error: e?.message || 'Lỗi đăng ký' };
    }
  }

  // Offline / Mock fallback
  const profile = getLocalProfile();
  profile.email = email;
  profile.username = username || email.split('@')[0];
  profile.is_authenticated = true;
  saveLocalProfile(profile);
  return { success: true };
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }

  const profile = getLocalProfile();
  profile.is_authenticated = false;
  profile.email = null;
  saveLocalProfile(profile);
}

/**
 * Subscribe to realtime updates on profiles / game records
 */
export function subscribeToLeaderboard(onUpdate: () => void): () => void {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('public:leaderboard')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
      onUpdate();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'game_records' }, () => {
      onUpdate();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
