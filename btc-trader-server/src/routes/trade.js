const express = require('express');
const { placeOrder, getOrderHistory, getAccountInfo, getOpenOrders, cancelOrder } = require('../binance');

const router = express.Router();

// POST /api/trade/buy
// Body: { type: "MARKET"|"LIMIT", quantity: number, price?: number }
router.post('/buy', async (req, res) => {
  const { type = 'MARKET', quantity, price } = req.body;

  if (!quantity) return res.status(400).json({ error: 'quantity is required' });
  if (type === 'LIMIT' && !price) return res.status(400).json({ error: 'price is required for LIMIT orders' });

  try {
    const result = await placeOrder({ side: 'BUY', type, quantity, price });
    res.json(result);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// POST /api/trade/sell
// Body: { type: "MARKET"|"LIMIT", quantity: number, price?: number }
router.post('/sell', async (req, res) => {
  const { type = 'MARKET', quantity, price } = req.body;

  if (!quantity) return res.status(400).json({ error: 'quantity is required' });
  if (type === 'LIMIT' && !price) return res.status(400).json({ error: 'price is required for LIMIT orders' });

  try {
    const result = await placeOrder({ side: 'SELL', type, quantity, price });
    res.json(result);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// GET /api/trade/history
router.get('/history', async (req, res) => {
  try {
    const orders = await getOrderHistory();
    res.json(orders);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// GET /api/trade/account
router.get('/account', async (req, res) => {
  try {
    const account = await getAccountInfo();
    // Return only BTC and USDT balances for brevity
    const balances = account.balances.filter(b => ['BTC', 'USDT'].includes(b.asset));
    res.json({ balances, makerCommission: account.makerCommission, takerCommission: account.takerCommission });
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// GET /api/trade/open-orders
router.get('/open-orders', async (req, res) => {
  try {
    const orders = await getOpenOrders();
    res.json(orders);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// DELETE /api/trade/order/:orderId
router.delete('/order/:orderId', async (req, res) => {
  try {
    const result = await cancelOrder(req.params.orderId);
    res.json(result);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

module.exports = router;
