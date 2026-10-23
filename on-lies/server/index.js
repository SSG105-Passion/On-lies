import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = process.env.DB_NAME || 'onlies_db';

app.use(cors());
app.use(express.json());

// In-memory / JSON fallback store for local development without MongoDB
const INITIAL_LEADERBOARD = [
  { user_id: 'agent-1', username: 'Hoàng Long', avatar_url: 'HL', role_title: 'Thanh tra cấp 5', level: 5, total_xp: 4890, streak_days: 14, rank: 1 },
  { user_id: 'agent-2', username: 'Mai Anh', avatar_url: 'MA', role_title: 'Cảnh sát mạng', level: 4, total_xp: 4120, streak_days: 12, rank: 2 },
  { user_id: 'agent-3', username: 'Tuấn Kiệt', avatar_url: 'TK', role_title: 'Chuyên gia Mail', level: 4, total_xp: 3750, streak_days: 8, rank: 3 },
  { user_id: 'agent-4', username: 'Bảo Trâm', avatar_url: 'BT', role_title: 'Đặc vụ Thực tập', level: 2, total_xp: 2100, streak_days: 3, rank: 4 },
  { user_id: 'agent-5', username: 'Minh Đức', avatar_url: 'MĐ', role_title: 'Tân binh', level: 1, total_xp: 1820, streak_days: 2, rank: 5 },
];

let fallbackUsers = [...INITIAL_LEADERBOARD];
let fallbackRecords = [];

// MongoDB client instance
let db = null;
let isMongoConnected = false;

async function connectToMongo() {
  if (!MONGODB_URI || !MONGODB_URI.startsWith('mongodb')) {
    console.log('[DB] Chế độ lưu trữ: Local Fallback (chưa cấu hình MONGODB_URI)');
    return;
  }

  try {
    const client = new MongoClient(MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
      }
    });
    await client.connect();
    db = client.db(DB_NAME);
    isMongoConnected = true;
    console.log(`[DB] Đã kết nối thành công tới MongoDB: ${DB_NAME}`);

    // Seed starter leaderboard if collection is empty
    const count = await db.collection('leaderboard').countDocuments();
    if (count === 0) {
      await db.collection('leaderboard').insertMany(INITIAL_LEADERBOARD.map(item => ({
        ...item,
        created_at: new Date()
      })));
      console.log('[DB] Đã khởi tạo dữ liệu mẫu cho Bảng xếp hạng trên MongoDB');
    }
  } catch (error) {
    console.error('[DB] Không thể kết nối tới MongoDB, chuyển sang Fallback:', error.message);
    isMongoConnected = false;
  }
}

// ================= API ROUTES =================

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isMongoConnected ? 'mongodb' : 'local_fallback',
    timestamp: new Date().toISOString()
  });
});

// 2. Get Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    if (isMongoConnected && db) {
      const topList = await db.collection('leaderboard')
        .find({})
        .sort({ total_xp: -1 })
        .limit(20)
        .toArray();

      const ranked = topList.map((entry, index) => ({
        user_id: entry.user_id || String(entry._id),
        username: entry.username,
        avatar_url: entry.avatar_url || '👤',
        role_title: entry.role_title || 'Tân binh',
        level: entry.level || 1,
        total_xp: entry.total_xp || 0,
        streak_days: entry.streak_days || 1,
        rank: index + 1
      }));
      return res.json(ranked);
    }

    // Local Fallback
    fallbackUsers.sort((a, b) => b.total_xp - a.total_xp);
    const ranked = fallbackUsers.map((e, idx) => ({ ...e, rank: idx + 1 }));
    res.json(ranked);
  } catch (err) {
    console.error('Lỗi lấy leaderboard:', err);
    res.status(500).json({ error: 'Không thể lấy dữ liệu bảng xếp hạng' });
  }
});

// 3. Submit Game Score & Update Profile XP
app.post('/api/scores', async (req, res) => {
  try {
    const { username, mode, score, maxScore, accuracy, xp, lives } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Thiếu username' });
    }

    const xpEarned = Number(xp) || 0;
    const now = new Date();

    if (isMongoConnected && db) {
      // Record game details
      await db.collection('game_records').insertOne({
        username,
        mode: mode || 'mail',
        score: Number(score) || 0,
        max_score: Number(maxScore) || 9,
        accuracy: Number(accuracy) || 0,
        lives_left: Number(lives) || 0,
        xp_earned: xpEarned,
        created_at: now
      });

      // Update or create user in leaderboard
      const existing = await db.collection('leaderboard').findOne({ username });
      let newTotalXp = xpEarned;
      let newLevel = 1;
      let roleTitle = 'Tân binh';
      let streak = 1;

      if (existing) {
        newTotalXp = (existing.total_xp || 0) + xpEarned;
        newLevel = Math.floor(newTotalXp / 1000) + 1;
        roleTitle = newLevel >= 5 ? 'Thanh tra cấp 5' : newLevel >= 3 ? 'Cảnh sát mạng' : 'Đặc vụ';
        streak = (existing.streak_days || 1);

        await db.collection('leaderboard').updateOne(
          { username },
          {
            $set: {
              total_xp: newTotalXp,
              level: newLevel,
              role_title: roleTitle,
              updated_at: now
            }
          }
        );
      } else {
        newLevel = Math.floor(newTotalXp / 1000) + 1;
        await db.collection('leaderboard').insertOne({
          user_id: `user-${Date.now()}`,
          username,
          avatar_url: username.slice(0, 2).toUpperCase(),
          role_title: roleTitle,
          level: newLevel,
          total_xp: newTotalXp,
          streak_days: streak,
          created_at: now,
          updated_at: now
        });
      }

      return res.json({
        success: true,
        xpEarned,
        newTotalXp,
        newLevel,
        roleTitle
      });
    }

    // Local Fallback
    fallbackRecords.push({ username, mode, score, maxScore, accuracy, xpEarned, created_at: now });
    let user = fallbackUsers.find(u => u.username === username);
    if (!user) {
      user = {
        user_id: `local-${Date.now()}`,
        username,
        avatar_url: username.slice(0, 2).toUpperCase(),
        role_title: 'Tân binh',
        level: 1,
        total_xp: 0,
        streak_days: 1,
        rank: fallbackUsers.length + 1
      };
      fallbackUsers.push(user);
    }
    user.total_xp += xpEarned;
    user.level = Math.floor(user.total_xp / 1000) + 1;
    if (user.level >= 5) user.role_title = 'Thanh tra cấp 5';
    else if (user.level >= 3) user.role_title = 'Cảnh sát mạng';

    res.json({
      success: true,
      xpEarned,
      newTotalXp: user.total_xp,
      newLevel: user.level,
      roleTitle: user.role_title
    });
  } catch (err) {
    console.error('Lỗi lưu điểm:', err);
    res.status(500).json({ error: 'Không thể lưu điểm' });
  }
});

// 4. Auth Sign Up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
    }

    const cleanUsername = username || email.split('@')[0];
    const now = new Date();

    if (isMongoConnected && db) {
      const existing = await db.collection('users').findOne({ $or: [{ email }, { username: cleanUsername }] });
      if (existing) {
        return res.status(400).json({ error: 'Email hoặc tên người dùng đã tồn tại' });
      }

      const newUser = {
        username: cleanUsername,
        email,
        password, // For lightweight game store
        avatar_url: cleanUsername.slice(0, 2).toUpperCase(),
        role_title: 'Tân binh',
        level: 1,
        total_xp: 0,
        streak_days: 1,
        created_at: now
      };

      const result = await db.collection('users').insertOne(newUser);
      // Also register on leaderboard
      await db.collection('leaderboard').updateOne(
        { username: cleanUsername },
        { $setOnInsert: { user_id: String(result.insertedId), ...newUser } },
        { upsert: true }
      );

      return res.json({
        success: true,
        user: {
          id: String(result.insertedId),
          username: cleanUsername,
          email,
          avatar_url: newUser.avatar_url,
          role_title: newUser.role_title,
          level: newUser.level,
          total_xp: newUser.total_xp,
          streak_days: newUser.streak_days,
          is_authenticated: true
        }
      });
    }

    // Local Fallback
    const profile = {
      id: `local-user-${Date.now()}`,
      username: cleanUsername,
      email,
      avatar_url: cleanUsername.slice(0, 2).toUpperCase(),
      role_title: 'Tân binh',
      level: 1,
      total_xp: 0,
      streak_days: 1,
      is_authenticated: true
    };
    fallbackUsers.push(profile);
    res.json({ success: true, user: profile });
  } catch (err) {
    console.error('Lỗi đăng ký:', err);
    res.status(500).json({ error: 'Không thể tạo tài khoản' });
  }
});

// 5. Auth Sign In
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
    }

    if (isMongoConnected && db) {
      const user = await db.collection('users').findOne({ email });
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' });
      }

      return res.json({
        success: true,
        user: {
          id: String(user._id),
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url || '👤',
          role_title: user.role_title || 'Tân binh',
          level: user.level || 1,
          total_xp: user.total_xp || 0,
          streak_days: user.streak_days || 1,
          is_authenticated: true
        }
      });
    }

    // Local Fallback
    const username = email.split('@')[0];
    res.json({
      success: true,
      user: {
        id: 'local-guest-id',
        username,
        email,
        avatar_url: username.slice(0, 2).toUpperCase(),
        role_title: 'Tân binh',
        level: 1,
        total_xp: 0,
        streak_days: 1,
        is_authenticated: true
      }
    });
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    res.status(500).json({ error: 'Không thể đăng nhập' });
  }
});

// ================= SERVE STATIC CLIENT IN PRODUCTION =================
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, async () => {
  console.log(`===========================================`);
  console.log(`On-Lies Server running on http://localhost:${PORT}`);
  console.log(`===========================================`);
  await connectToMongo();
});
