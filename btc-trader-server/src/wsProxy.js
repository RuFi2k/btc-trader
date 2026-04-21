const WebSocket = require('ws');
const axios = require('axios');

const REST_BASE = 'https://demo-api.binance.com/api/v3/klines';
const POLL_INTERVAL_MS = 1000;

/**
 * Attach k-line WebSocket proxy to an existing http.Server.
 * Polls the Binance REST klines endpoint and pushes updates to connected clients.
 *
 * Clients connect to: ws://localhost:<PORT>/klines?symbol=BTCUSDT&interval=1m
 * Supported intervals: 1s, 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
 */
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
    const interval = url.searchParams.get('interval') || '1m';

    let lastOpenTime = null;

    const timer = setInterval(async () => {
      if (clientWs.readyState !== WebSocket.OPEN) return;

      try {
        const { data } = await axios.get(REST_BASE, {
          params: { symbol, interval, limit: 2 },
        });

        // data is [[openTime, open, high, low, close, volume, closeTime, ...], ...]
        // last entry is the current (potentially unclosed) candle
        const raw = data[data.length - 1];
        const candle = {
          k: {
            t: raw[0],  // open time
            o: raw[1],  // open
            h: raw[2],  // high
            l: raw[3],  // low
            c: raw[4],  // close
            v: raw[5],  // volume
            T: raw[6],  // close time
            x: false,   // REST always returns the current open candle last
          },
        };

        // Also emit the previous closed candle once when a new one starts
        if (lastOpenTime !== null && raw[0] !== lastOpenTime) {
          const prev = data[data.length - 2];
          if (prev) {
            clientWs.send(JSON.stringify({
              k: {
                t: prev[0], o: prev[1], h: prev[2], l: prev[3],
                c: prev[4], v: prev[5], T: prev[6], x: true,
              },
            }));
          }
        }

        lastOpenTime = raw[0];
        clientWs.send(JSON.stringify(candle));
      } catch (err) {
        console.error('[WS] Poll error:', err.message);
      }
    }, POLL_INTERVAL_MS);

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
