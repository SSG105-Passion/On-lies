import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getLevelProgress } from './playerProgress';
import { SessionResults } from './session';

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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tpluixrztjahwiuesgdd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_QJ7tOyZTCZs7CdXSZjzDvw_SyjG7jyz';

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

let leaderboardSource: 'local' | 'cloud' = 'local';
export const getLeaderboardSource = () => leaderboardSource;

const LOCAL_STORAGE_PROFILE_KEY = 'on-lies-user-profile';
const LOCAL_STORAGE_LEADERBOARD_KEY = 'on-lies-local-leaderboard';

const MOCK_NAMES_SET = new Set(['Hoàng Long', 'Mai Anh', 'Tuấn Kiệt', 'Bảo Trâm', 'Minh Đức']);

function getLocalLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LEADERBOARD_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(
          (e: LeaderboardEntry) =>
            e &&
            typeof e.total_xp === 'number' &&
            e.total_xp > 0 &&
            !String(e.user_id || '').startsWith('agent-') &&
            !MOCK_NAMES_SET.has(e.username)
        );
        localStorage.setItem(LOCAL_STORAGE_LEADERBOARD_KEY, JSON.stringify(cleaned));
        return cleaned;
      }
    }
  } catch {
    // fallback
  }
  return [];
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
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && typeof saved.id === 'string' && typeof saved.username === 'string' && Number.isFinite(saved.total_xp)) {
        return { ...getGuestProfile(), ...saved, total_xp: Math.max(0, saved.total_xp),
          is_authenticated: !!supabase && saved.is_authenticated === true };
      }
    }
  } catch {
    // fallback
  }
  return getGuestProfile();
}

function getGuestProfile(): UserProfile {
  return {
    id: 'local-guest-id',
    username: 'Bạn (Thanh tra viên)',
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
  leaderboardSource = 'local';
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('leaderboard_view')
        .select('*')
        .gt('total_xp', 0)
        .order('total_xp', { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        const real = (data as LeaderboardEntry[]).filter(
          entry =>
            entry &&
            entry.total_xp > 0 &&
            !String(entry.user_id || '').startsWith('agent-') &&
            !MOCK_NAMES_SET.has(entry.username)
        );
        if (real.length > 0) {
          leaderboardSource = 'cloud';
          return real.map((entry, index) => ({
            ...entry,
            rank: index + 1,
          }));
        }
      }

      // If view doesn't exist yet, query profiles directly
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .gt('total_xp', 0)
        .order('total_xp', { ascending: false })
        .limit(20);

      if (!pError && profiles && profiles.length > 0) {
        const real = profiles.filter(
          (p: any) =>
            p &&
            (p.total_xp || 0) > 0 &&
            !String(p.id || '').startsWith('agent-') &&
            !MOCK_NAMES_SET.has(p.username)
        );
        if (real.length > 0) {
          leaderboardSource = 'cloud';
          return real.map((p, idx) => ({
            user_id: p.id,
            username: p.username || 'Thanh tra viên',
            avatar_url: p.avatar_url || (p.username ? p.username.slice(0, 2).toUpperCase() : '👤'),
            role_title: p.role_title || 'Đặc vụ',
            level: p.level || 1,
            total_xp: p.total_xp || 0,
            streak_days: p.streak_days || 1,
            rank: idx + 1,
          }));
        }
      }
    } catch (e) {
      console.warn('Supabase query failed, falling back to local leaderboard:', e);
    }
  }

  // Local/Offline Fallback with current user integrated ONLY if total_xp > 0
  const localList = getLocalLeaderboard();
  const currentProfile = getLocalProfile();

  if (currentProfile.total_xp > 0) {
    const existingIdx = localList.findIndex(e => e.user_id === currentProfile.id || e.username === currentProfile.username);
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
    } else {
      localList.push(userEntry);
    }
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
        const cached = getLocalProfile();
        if (cached.id === user.id) return { ...cached, is_authenticated: true };
        return {
          ...getGuestProfile(), id: user.id, email: user.email || null,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'Thanh tra viên',
          is_authenticated: true,
        };
      }
    } catch (e) {
      console.warn('Could not fetch Supabase user, using local:', e);
    }
  }

  return { ...getLocalProfile(), is_authenticated: false };
}

/**
 * Record a completed game session into Supabase and update total user XP.
 */
export interface ScoreSaveResult {
  xpEarned: number;
  newTotalXp: number;
  newLevel: number;
  requiresLogin: boolean;
  syncStatus: 'local' | 'synced' | 'failed';
}

export function scoreSaveMessage(result: ScoreSaveResult): string {
  if (result.syncStatus === 'synced') return 'Đã đồng bộ điểm lên tài khoản.';
  if (result.syncStatus === 'failed') return 'Điểm đã lưu trên máy; chưa đồng bộ được lên tài khoản.';
  return 'Điểm đã lưu trên máy này.';
}

const sessionScores = new SessionResults<ScoreSaveResult>();

export function recordGameScore(
  gameMode: string,
  score: number,
  maxScore: number,
  livesLeft: number,
  sessionId: string,
): Promise<ScoreSaveResult> {
  const ownerId = getLocalProfile().id;
  return sessionScores.run(`${ownerId}:${gameMode}:${sessionId}`, async () => {
    if (!sessionId || ![score, maxScore, livesLeft].every(Number.isInteger) ||
      maxScore <= 0 || score < 0 || score > maxScore || livesLeft < 0 || livesLeft > 3) {
      throw new Error('Kết quả phiên chơi không hợp lệ.');
    }
    const profile = { ...getLocalProfile() };
    if (profile.id !== ownerId) throw new Error('Tài khoản đã thay đổi trước khi lưu điểm.');
    return saveGameScore(gameMode, score, maxScore, livesLeft, profile);
  });
}

async function saveGameScore(gameMode: string, score: number, maxScore: number, livesLeft: number, profile: UserProfile): Promise<ScoreSaveResult> {
  const xpEarned = score * 100 + livesLeft * 50;

  profile.total_xp += xpEarned;
  const level = getLevelProgress(profile.total_xp);
  profile.level = level.level;
  profile.role_title = level.role_title;
  saveLocalProfile(profile);

  // Update local leaderboard
  const list = getLocalLeaderboard();
  const foundIdx = list.findIndex(e => e.user_id === profile.id || e.username === profile.username);
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
  let syncStatus: ScoreSaveResult['syncStatus'] = 'local';

  // If user is authenticated in Supabase, push the game record
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        requiresLogin = false;
        if (user.id !== profile.id) throw new Error('Tài khoản đã thay đổi; chỉ giữ điểm trên máy.');
        const { data: remote, error: readError } = await supabase.from('profiles')
          .select('total_xp').eq('id', user.id).single();
        if (readError || !remote) throw readError || new Error('Không tải được điểm tài khoản.');
        const totalXp = remote.total_xp + xpEarned;
        const remoteLevel = getLevelProgress(totalXp);
        const accuracy = Math.round((score / Math.max(1, maxScore)) * 100);
        const { error: insertError } = await supabase.from('game_records').insert({
          user_id: user.id,
          game_mode: gameMode,
          score,
          max_score: maxScore,
          lives_left: livesLeft,
          accuracy,
          xp_earned: xpEarned,
        });
        if (insertError) throw insertError;

        // Update profile in Supabase table
        const { data: updated, error: updateError } = await supabase
          .from('profiles')
          .update({
            total_xp: totalXp,
            level: remoteLevel.level,
            role_title: remoteLevel.role_title,
          })
          .eq('id', user.id).select('id').single();
        if (updateError || !updated) throw updateError || new Error('Chưa cập nhật được điểm tài khoản.');
        syncStatus = 'synced';
        if (getLocalProfile().id === profile.id) {
          profile.total_xp = totalXp;
          profile.level = remoteLevel.level;
          profile.role_title = remoteLevel.role_title;
          saveLocalProfile(profile);
        }
      } else if (profile.is_authenticated) {
        syncStatus = 'failed';
      }
    } catch (e) {
      syncStatus = 'failed';
      console.warn('Could not save to Supabase:', e);
    }
  }

  return {
    xpEarned,
    newTotalXp: profile.total_xp,
    newLevel: profile.level,
    requiresLogin,
    syncStatus,
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
      return { success: false, error: 'Không đăng nhập được. Vui lòng thử lại.' };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Lỗi đăng nhập' };
    }
  }

  return { success: false, error: 'Chưa cấu hình đăng nhập trực tuyến. Bạn vẫn có thể chơi và lưu điểm trên máy.' };
}

/**
 * Sign up using Supabase Auth or mock local account
 */
export async function signUp(email: string, password: string, username: string): Promise<{ success: boolean; error?: string; message?: string }> {
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
      if (data.user && !data.session) return { success: true, message: 'Hãy kiểm tra email để xác nhận tài khoản, sau đó đăng nhập.' };
      if (data.user) {
        const profile = await getCurrentProfile();
        saveLocalProfile(profile);
        return { success: true };
      }
      return { success: false, error: 'Chưa tạo được tài khoản. Vui lòng thử lại.' };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Lỗi đăng ký' };
    }
  }

  return { success: false, error: 'Chưa cấu hình đăng ký trực tuyến. Bạn vẫn có thể chơi và lưu điểm trên máy.' };
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

/**
 * Listen for auth state changes
 */
export function onAuthStateChange(callback: (profile: UserProfile) => void): () => void {
  if (!supabase) return () => {};

  const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
    // Fetch outside the auth callback so another auth request cannot hold its lock.
    window.setTimeout(() => { void getCurrentProfile().then(profile => {
      saveLocalProfile(profile);
      callback(profile);
    }); }, 0);
  });

  return () => {
    subscription.unsubscribe();
  };
}
