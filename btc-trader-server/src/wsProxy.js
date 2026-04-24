const WebSocket = require('ws');
const axios = require('axios');
const https = require('https');

const REST_BASE = 'https://demo-api.binance.com/api/v3/klines';
const POLL_INTERVAL_MS = 1000;

const httpClient = axios.create({
  httpsAgent: new https.Agent({ keepAlive: true }),
});

function attachKlineProxy(server) {
  const wss = new WebSocket.Server({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname !== '/klines') {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  });

  wss.on('connection', (clientWs, req) => {
    console.log('[WS] Client connected');
    const url = new URL(req.url, `http://${req.headers.host}`);
    const symbol = (url.searchParams.get('symbol') || 'BTCUSDT').toUpperCase();

    let timer = null;
    let lastOpenTime = null;
    let currentInterval = null;

    async function startInterval(interval) {
      if (timer) clearInterval(timer);
      lastOpenTime = null;
      currentInterval = interval;

      console.log(`[WS] Starting interval: ${interval}`);

      try {
        const { data: history } = await httpClient.get(REST_BASE, {
          params: { symbol, interval, limit: 15 },
        });
        if (clientWs.readyState === WebSocket.OPEN) {
          for (let i = 0; i < history.length; i++) {
            const raw = history[i];
            const isLast = i === history.length - 1;
            clientWs.send(JSON.stringify({
              k: { t: raw[0], o: raw[1], h: raw[2], l: raw[3], c: raw[4], v: raw[5], T: raw[6], x: !isLast },
            }));
          }
        }
      } catch (err) {
        console.error('[WS] History fetch error:', err.message);
      }

      timer = setInterval(async () => {
        if (clientWs.readyState !== WebSocket.OPEN) return;
        try {
          const { data } = await httpClient.get(REST_BASE, {
            params: { symbol, interval: currentInterval, limit: 2 },
          });

          const raw = data[data.length - 1];

          if (lastOpenTime !== null && raw[0] !== lastOpenTime) {
            const prev = data[data.length - 2];
            if (prev) {
              clientWs.send(JSON.stringify({
                k: { t: prev[0], o: prev[1], h: prev[2], l: prev[3], c: prev[4], v: prev[5], T: prev[6], x: true },
              }));
            }
          }

          lastOpenTime = raw[0];
          clientWs.send(JSON.stringify({
            k: { t: raw[0], o: raw[1], h: raw[2], l: raw[3], c: raw[4], v: raw[5], T: raw[6], x: false },
          }));
        } catch (err) {
          console.error('[WS] Poll error:', err.message);
        }
      }, POLL_INTERVAL_MS);
    }

    clientWs.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'SET_INTERVAL' && msg.interval) {
          startInterval(msg.interval);
        }
      } catch {
        // ignore malformed messages
      }
    });

    clientWs.on('close', () => {
      console.log('[WS] Client disconnected');
      clearInterval(timer);
    });

    clientWs.on('error', () => {
      clearInterval(timer);
    });
  });

  return wss;
}

module.exports = { attachKlineProxy };
