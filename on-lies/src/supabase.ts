// On-Lies Backend API & Database Service (MongoDB & Local Storage)

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

export const isSupabaseConfigured = true;
export const supabase = null;

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
 * Fetch leaderboard from MongoDB backend API with graceful local fallback.
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch('/api/leaderboard', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        saveLocalLeaderboard(data);
        return data;
      }
    }
  } catch {
    // Backend unreachable, fallback smoothly
  }

  // Local fallback
  const localList = getLocalLeaderboard();
  const currentProfile = getLocalProfile();

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
  } else if (currentProfile.total_xp > 0) {
    localList.push(userEntry);
  }

  localList.sort((a, b) => b.total_xp - a.total_xp);
  return localList.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

/**
 * Get current profile.
 */
export async function getCurrentProfile(): Promise<UserProfile> {
  return getLocalProfile();
}

/**
 * Record completed game score to backend and update player XP.
 */
export async function recordGameScore(
  gameMode: string,
  score: number,
  maxScore: number,
  livesLeft: number
): Promise<{
  xpEarned: number;
  newTotalXp: number;
  newLevel: number;
  requiresLogin: boolean;
}> {
  const baseXP = score * 50;
  const accuracyBonus = score === maxScore ? 100 : score >= Math.ceil(maxScore * 0.7) ? 40 : 0;
  const livesBonus = livesLeft * 30;
  const xpEarned = baseXP + accuracyBonus + livesBonus;
  const accuracy = Math.round((score / Math.max(1, maxScore)) * 100);

  const profile = getLocalProfile();
  profile.total_xp += xpEarned;
  profile.level = Math.floor(profile.total_xp / 1000) + 1;

  if (profile.level >= 5) {
    profile.role_title = 'Thanh tra cấp 5';
  } else if (profile.level >= 4) {
    profile.role_title = 'Cảnh sát mạng';
  } else if (profile.level >= 3) {
    profile.role_title = 'Chuyên viên An toàn';
  } else if (profile.level >= 2) {
    profile.role_title = 'Đặc vụ';
  }

  saveLocalProfile(profile);

  // Sync to backend API (MongoDB)
  try {
    await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: profile.username,
        mode: gameMode,
        score,
        maxScore,
        accuracy,
        xp: xpEarned,
        lives: livesLeft,
      }),
    });
  } catch {
    // local fallback already handled
  }

  // Update local leaderboard
  const list = getLocalLeaderboard();
  const foundIdx = list.findIndex(e => e.username === profile.username);
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

  return {
    xpEarned,
    newTotalXp: profile.total_xp,
    newLevel: profile.level,
    requiresLogin: !profile.is_authenticated,
  };
}

/**
 * Sign in using backend API or local profile.
 */
export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        saveLocalProfile(data.user);
        return { success: true };
      }
    } else {
      const err = await res.json().catch(() => ({ error: 'Lỗi đăng nhập' }));
      return { success: false, error: err.error || 'Lỗi đăng nhập' };
    }
  } catch {
    // Offline / Mock fallback
  }

  const profile = getLocalProfile();
  profile.email = email;
  profile.username = email.split('@')[0];
  profile.is_authenticated = true;
  saveLocalProfile(profile);
  return { success: true };
}

/**
 * Sign up using backend API or local profile.
 */
export async function signUp(
  email: string,
  password: string,
  username: string
): Promise<{ success: boolean; error?: string }> {
  const cleanUsername = username || email.split('@')[0];
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username: cleanUsername }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        saveLocalProfile(data.user);
        return { success: true };
      }
    } else {
      const err = await res.json().catch(() => ({ error: 'Lỗi đăng ký' }));
      return { success: false, error: err.error || 'Lỗi đăng ký' };
    }
  } catch {
    // Offline / Mock fallback
  }

  const profile = getLocalProfile();
  profile.email = email;
  profile.username = cleanUsername;
  profile.is_authenticated = true;
  saveLocalProfile(profile);
  return { success: true };
}

/**
 * Sign out current profile.
 */
export async function signOut(): Promise<void> {
  const profile = getLocalProfile();
  profile.is_authenticated = false;
  saveLocalProfile(profile);
}

/**
 * Leaderboard polling / subscription helper
 */
export function subscribeToLeaderboard(callback: () => void): () => void {
  const interval = window.setInterval(callback, 30000);
  return () => window.clearInterval(interval);
}

/**
 * Auth state listener
 */
export function onAuthStateChange(callback: (profile: UserProfile | null) => void): () => void {
  const handler = () => callback(getLocalProfile());
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
