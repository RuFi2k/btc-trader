const WebSocket = require('ws');

const BINANCE_WS_BASE = 'wss://demo-ws-api.binance.com/ws-api/v3';

/**
 * Attach k-line WebSocket proxy to an existing http.Server.
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
    const url = new URL(req.url, `http://${req.headers.host}`);
    const symbol = (url.searchParams.get('symbol') || 'BTCUSDT').toLowerCase();
    const interval = url.searchParams.get('interval') || '1m';

    const binanceUrl = `${BINANCE_WS_BASE}/${symbol}@kline_${interval}`;
    const binanceWs = new WebSocket(binanceUrl);

    binanceWs.on('open', () => {
      console.log(`[WS] Proxying ${binanceUrl}`);
    });

    binanceWs.on('message', (data) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(data.toString());
      }
    });

    binanceWs.on('error', (err) => {
      console.error('[WS] Binance error:', err.message);
      clientWs.close(1011, 'Upstream error');
    });

    binanceWs.on('close', () => {
      clientWs.close(1000, 'Upstream closed');
    });

    clientWs.on('close', () => {
      binanceWs.close();
    });

    clientWs.on('error', () => {
      binanceWs.close();
    });
  });

  return wss;
}

module.exports = { attachKlineProxy };
