const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. HELMET: Proteksi Header & Mengelabui Bot Scanner
app.use(helmet({
  contentSecurityPolicy: false // Dinonaktifkan sementara agar script frontend lokal lu tidak terblokir
}));
app.disable('x-powered-by'); // Menghilangkan jejak bahwa server memakai Express/Node.js

// 2. ANTI-CRAWLING / GLOBAL LIMITER
// Membatasi permintaan umum dari bot (maksimal 100 request per 15 menit per IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Terlalu banyak permintaan. Akses dibatasi!' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', globalLimiter);

// 3. ANTI-BRUTE FORCE KHUSUS LOGIN
// Maksimal hanya boleh mencoba password 5 kali dalam 15 menit per IP
const loginBruteForceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { 
    success: false, 
    message: 'Terlalu banyak percobaan login gagal! Akun dikunci sementara selama 15 menit.' 
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware standar
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Melayani file frontend
app.use(express.static(path.join(__dirname, 'public')));

// URL Google Apps Script
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwyi1diuFZ4lczKc0d83YObHkIQP__gRcUn1kDMjnNpoKoEBlan1s_2yFLNHf8NB2Q5wA/exec";

// 4. Endpoint Login (Diproteksi loginBruteForceLimiter)
app.post('/api/login', loginBruteForceLimiter, (req, res) => {
  const { password } = req.body;
  if (password === 'RENAI') {
    return res.json({ success: true, token: 'AUTH_SUCCESS_TOKEN_RENAI_2026' });
  }
  return res.status(401).json({ success: false, message: 'Password salah!' });
});

// 5. Endpoint Proxy Google Sheets
app.post('/api/save-data', async (req, res) => {
  try {
    const payload = req.body;
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Tolak Robot Web Mesin Pencari (Robots.txt)
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send("User-agent: *\nDisallow: /");
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server jalan di http://0.0.0.0:${PORT}`);
});
