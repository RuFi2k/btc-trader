require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const axios = require('axios');
const { attachKlineProxy } = require('./wsProxy');
const tradeRoutes = require('./routes/trade');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/trade', tradeRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/health/binance', async (_req, res) => {
  try {
    const { data } = await axios.get('https://demo-api.binance.com/api/v3/time');
    res.json({ reachable: true, serverTime: data.serverTime });
  } catch (err) {
    res.status(502).json({ reachable: false, error: err.message, details: err.response?.data });
  }
});

const server = http.createServer(app);
attachKlineProxy(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`BTC Trader server running on http://localhost:${PORT}`);
  console.log(`K-line WebSocket: ws://localhost:${PORT}/klines?symbol=BTCUSDT&interval=1m`);
  const key = process.env.BINANCE_API_KEY;
  const secret = process.env.BINANCE_API_SECRET;
  if (!key || !secret) {
    console.warn('[WARN] BINANCE_API_KEY or BINANCE_API_SECRET is missing from .env');
  } else {
    console.log(`[INFO] API key loaded: ${key.slice(0, 6)}...${key.slice(-4)} (length: ${key.length})`);
  }
});
