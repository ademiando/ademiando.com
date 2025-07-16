
const WHALE_API_KEY = 'YOUR_WHALE_ALERT_KEY'; // Ganti dengan API key asli
const WHALE_ENDPOINT = 'https://api.whale-alert.io/v1/transactions';
const whaleActivity = document.getElementById('whale-activity');

// Ambil aktivitas whale
export async function fetchWhaleAlerts() {
  try {
    whaleActivity.innerHTML = '<div class="activity-item"><div class="activity-details">Loading whale activity...</div></div>';
    
    // Batasi 1 jam terakhir
    const startTime = Math.floor(Date.now() / 1000) - 3600;
    const url = `${WHALE_ENDPOINT}?api_key=${WHALE_API_KEY}&min_value=1000000&start=${startTime}`;
    
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    
    const data = await resp.json();
    
    if (!data.count || data.count === 0) {
      whaleActivity.innerHTML = '<div class="activity-item"><div class="activity-details">No recent whale activity</div></div>';
      return;
    }
    
    whaleActivity.innerHTML = '';
    
    // Ambil 5 transaksi terbaru
    data.transactions.slice(0, 5).forEach(tx => {
      const item = document.createElement('div');
      item.className = 'activity-item';
      
      const direction = tx.to.owner_type === 'exchange' ? 'buy' : 'sell';
      const icon = direction === 'buy' ? 
        '<i class="fas fa-arrow-down buy"></i>' : 
        '<i class="fas fa-arrow-up sell"></i>';
      
      const amount = tx.amount || 0;
      const symbol = tx.symbol || 'N/A';
      const usdValue = tx.amount_usd ? `(${(tx.amount_usd / 1000000).toFixed(2)}M USD)` : '';
      
      const time = new Date(tx.timestamp * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      item.innerHTML = `
        <div class="activity-icon">${icon}</div>
        <div class="activity-details">
          <div class="activity-amount">${amount.toFixed(2)} ${symbol} ${usdValue} ${direction}</div>
          <div class="activity-time">${time} · ${tx.blockchain}</div>
        </div>
      `;
      
      whaleActivity.appendChild(item);
    });
    
  } catch (error) {
    console.error('Whale alert error:', error);
    whaleActivity.innerHTML = '<div class="activity-item"><div class="activity-details">Failed to load whale alerts</div></div>';
  }
}