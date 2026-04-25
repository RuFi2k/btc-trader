const crypto = require('crypto');
const axios = require('axios');

const BASE_URL = 'https://demo-api.binance.com/api';

let serverTimeOffset = 0;

async function syncTime() {
  const { data } = await axios.get(`${BASE_URL}/v3/time`);
  serverTimeOffset = data.serverTime - Date.now();
}

function now() {
  return Date.now() + serverTimeOffset;
}

function sign(queryString) {
  return crypto
    .createHmac('sha256', getSecret())
    .update(queryString)
    .digest('hex');
}

function buildSignedParams(params) {
  const timestamp = now();
  const queryString = new URLSearchParams({ ...params, timestamp }).toString();
  const signature = sign(queryString);
  return `${queryString}&signature=${signature}`;
}

function authHeaders() {
  return { 'X-MBX-APIKEY': (process.env.BINANCE_API_KEY || '').trim() };
}

function getSecret() {
  return (process.env.BINANCE_API_SECRET || '').trim();
}

async function placeOrder({ side, type, quantity, price }) {
  const params = {
    symbol: 'BTCUSDT',
    side,       // BUY | SELL
    type,       // MARKET | LIMIT
    quantity,
  };

  if (type === 'LIMIT') {
    params.price = price;
    params.timeInForce = 'GTC';
  }

  const query = buildSignedParams(params);
  const { data } = await axios.post(
    `${BASE_URL}/v3/order`,
    query,
    { headers: { ...authHeaders(), 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return data;
}

async function getOrderHistory() {
  const query = buildSignedParams({ symbol: 'BTCUSDT' });
  const { data } = await axios.get(
    `${BASE_URL}/v3/allOrders?${query}`,
    { headers: authHeaders() }
  );
  return data;
}

async function getAccountInfo() {
  const query = buildSignedParams({});
  const { data } = await axios.get(
    `${BASE_URL}/v3/account?${query}`,
    { headers: authHeaders() }
  );
  return data;
}

async function getOpenOrders() {
  const query = buildSignedParams({ symbol: 'BTCUSDT' });
  const { data } = await axios.get(
    `${BASE_URL}/v3/openOrders?${query}`,
    { headers: authHeaders() }
  );
  return data;
}

async function cancelOrder(orderId) {
  const query = buildSignedParams({ symbol: 'BTCUSDT', orderId });
  const { data } = await axios.delete(
    `${BASE_URL}/v3/order?${query}`,
    { headers: authHeaders() }
  );
  return data;
}

module.exports = { syncTime, placeOrder, getOrderHistory, getAccountInfo, getOpenOrders, cancelOrder };
