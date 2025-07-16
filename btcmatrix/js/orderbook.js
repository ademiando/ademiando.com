
import { abbreviateNumber } from './main.js';

// Ambil dan perbarui order book
export async function fetchOrderBook() {
  try {
    const response = await fetch('https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=10');
    const data = await response.json();
    updateOrderBook(data);
  } catch (error) {
    console.error('Error fetching order book:', error);
  }
}

// Perbarui UI order book
function updateOrderBook(data) {
  const bidsContainer = document.getElementById('bids-container');
  const asksContainer = document.getElementById('asks-container');
  
  if (!bidsContainer || !asksContainer) return;
  
  // Perbarui bids
  bidsContainer.innerHTML = '';
  data.bids.slice(0, 5).forEach(bid => {
    const [price, amount] = bid;
    const total = parseFloat(price) * parseFloat(amount);
    const row = document.createElement('div');
    row.className = 'order-book-row';
    row.innerHTML = `
      <span>${parseFloat(price).toFixed(2)}</span>
      <span>${parseFloat(amount).toFixed(4)}</span>
      <span>${abbreviateNumber(total)}</span>
    `;
    bidsContainer.appendChild(row);
  });
  
  // Perbarui asks
  asksContainer.innerHTML = '';
  data.asks.slice(0, 5).forEach(ask => {
    const [price, amount] = ask;
    const total = parseFloat(price) * parseFloat(amount);
    const row = document.createElement('div');
    row.className = 'order-book-row';
    row.innerHTML = `
      <span>${parseFloat(price).toFixed(2)}</span>
      <span>${parseFloat(amount).toFixed(4)}</span>
      <span>${abbreviateNumber(total)}</span>
    `;
    asksContainer.appendChild(row);
  });
}