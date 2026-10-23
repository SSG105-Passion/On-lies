import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'supabase',
    timestamp: new Date().toISOString()
  });
});

// Serve compiled static Vite frontend
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.send('Project build not found. Please run npm run build first.');
  });
}

app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`On-Lies Server running on http://localhost:${PORT}`);
  console.log(`Connected to Supabase: ${process.env.VITE_SUPABASE_URL || 'configured'}`);
  console.log(`===========================================`);
});
