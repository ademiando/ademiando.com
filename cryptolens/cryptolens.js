const coinSelect = document.getElementById('coin-select');
const btcPriceElement = document.getElementById('btc-price');
const priceChangeElement = document.getElementById('price-change');
const marketCapElement = document.getElementById('market-cap');
const volume24hElement = document.getElementById('volume-24h');
const dominanceElement = document.getElementById('dominance');
const fearGreedValue = document.getElementById('fear-greed-value');
const fearGreedLabel = document.getElementById('fear-greed-label');
const sentimentDescription = document.getElementById('sentiment-description');
const whaleActivity = document.getElementById('whale-activity');
const chartActions = document.querySelectorAll('.chart-actions .btn');

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const FNG_API = 'https://api.alternative.me/fng/?limit=1';
const WHALE_API_KEY = 'YOUR_WHALE_ALERT_KEY'; // Ganti dengan API key asli
const WHALE_ENDPOINT = 'https://api.whale-alert.io/v1/transactions';

// 1. Perbaikan load TradingView
function loadTradingView(coin, interval = '1D') {
  const chartContainer = document.getElementById('tv-chart');
  
  // Hapus widget lama jika ada
  while (chartContainer.firstChild) {
    chartContainer.removeChild(chartContainer.firstChild);
  }
  
  // Validasi simbol kripto
  const symbol = coin ? `${coin}USDT` : 'BTCUSDT';
  
  new TradingView.widget({
    width: '100%',
    height: '400',
    symbol: `BINANCE:${symbol}`,
    interval: interval,
    timezone: 'Etc/UTC',
    theme: 'dark',
    style: '1',
    locale: 'en',
    toolbar_bg: '#1e222d',
    enable_publishing: false,
    hide_top_toolbar: false,
    hide_legend: false,
    container_id: 'tv-chart',
    autosize: true
  });
}

// 2. Perbaikan data real-time dengan cache busting
async function fetchBitcoinPrice() {
  try {
    const timestamp = Date.now();
    const resp = await fetch(`${COINGECKO_BASE}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&t=${timestamp}`);
    const data = await resp.json();
    
    if (data.bitcoin) {
      const price = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(data.bitcoin.usd);
      
      const change = data.bitcoin.usd_24h_change.toFixed(2);
      btcPriceElement.textContent = price;
      priceChangeElement.textContent = `${change >= 0 ? '+' : ''}${change}%`;
      priceChangeElement.className = `price-change ${change >= 0 ? 'price-up' : 'price-down'}`;
    }
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    btcPriceElement.textContent = 'Error';
    priceChangeElement.textContent = 'Error';
  }
}

// 3. Perbaikan struktur data global
async function fetchMarketData() {
  try {
    const resp = await fetch(`${COINGECKO_BASE}/global`);
    const globalData = await resp.json();
    
    if (!globalData.data) throw new Error('Invalid response structure');
    
    const { total_market_cap, total_volume, market_cap_percentage } = globalData.data;
    
    marketCapElement.textContent = `$${abbreviateNumber(total_market_cap.usd)}`;
    volume24hElement.textContent = `$${abbreviateNumber(total_volume.usd)}`;
    dominanceElement.textContent = `${market_cap_percentage.btc.toFixed(1)}%`;
  } catch (error) {
    console.error('Error fetching market data:', error);
    marketCapElement.textContent = 'Error';
    volume24hElement.textContent = 'Error';
    dominanceElement.textContent = 'Error';
  }
}

// 4. Perbaikan Fear & Greed Index
async function fetchFearGreedIndex() {
  try {
    const resp = await fetch(FNG_API);
    const result = await resp.json();
    
    if (result.data && result.data.length) {
      const { value, value_classification } = result.data[0];
      const v = parseInt(value, 10);
      
      fearGreedValue.textContent = v;
      fearGreedLabel.textContent = value_classification;
      
      // Update gauge visualization
      const gaugeValue = document.querySelector('.gauge-value');
      if (gaugeValue) {
        gaugeValue.style.strokeDashoffset = 534 - (534 * v / 100);
      }
      
      // Update sentiment description
      sentimentDescription.textContent = 
        v < 25 ? 'Extreme fear can indicate a buying opportunity.' :
        v < 45 ? 'Fear suggests market may be bottoming.' :
        v < 55 ? 'Neutral sentiment.' :
        'Greed is high—exercise caution.';
    }
  } catch (error) {
    console.error('Error fetching Fear & Greed Index:', error);
    fearGreedValue.textContent = 'Error';
    fearGreedLabel.textContent = 'Error';
    sentimentDescription.textContent = 'Failed to fetch sentiment data';
  }
}

// 5. Perbaikan Whale Alerts dengan error handling
async function fetchWhaleAlerts() {
  try {
    whaleActivity.innerHTML = '<div class="activity-item"><div class="activity-details">Loading whale activity...</div></div>';
    
    // Batasi 1 jam terakhir
    const startTime = Math.floor(Date.now() / 1000) - 3600;
    const url = `${WHALE_ENDPOINT}?api_key=${WHALE_API_KEY}&min_value=1000000&start=${startTime}`;
    
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    
    const data = await resp.json();
    if (!data.transactions || data.transactions.length === 0) {
      whaleActivity.innerHTML = '<div class="activity-item"><div class="activity-details">No recent whale activity</div></div>';
      return;
    }
    
    whaleActivity.innerHTML = '';
    data.transactions.slice(0, 5).forEach(tx => {
      const item = document.createElement('div');
      item.className = 'activity-item';
      
      const icon = tx.from.owner_type === 'exchange' ? 
        '<i class="fas fa-arrow-up sell"></i>' : 
        '<i class="fas fa-arrow-down buy"></i>';
      
      const amount = tx.amount || 0;
      const symbol = tx.symbol || 'N/A';
      const usdValue = tx.amount_usd ? `(${(tx.amount_usd / 1000000).toFixed(2)}M USD)` : '';
      
      const text = `${amount.toFixed(2)} ${symbol} ${usdValue}`;
      const action = tx.from.owner_type === 'exchange' ? 'sold' : 'bought';
      
      const time = new Date(tx.timestamp * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      item.innerHTML = `
        <div class="activity-icon">${icon}</div>
        <div class="activity-details">
          <div class="activity-amount">${text} ${action}</div>
          <div class="activity-time">${time} · ${tx.blockchain}</div>
        </div>
      `;
      
      whaleActivity.appendChild(item);
    });
    
  } catch (error) {
    console.error('Error fetching whale alerts:', error);
    whaleActivity.innerHTML = '<div class="activity-item"><div class="activity-details">Failed to load whale alerts</div></div>';
  }
}

// 6. Fungsi utilitas untuk format angka
function abbreviateNumber(value) {
  const num = parseFloat(value);
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

// 7. Inisialisasi dashboard dengan error handling
async function initDashboard() {
  try {
    // Load data awal
    await Promise.allSettled([
      fetchBitcoinPrice(),
      fetchMarketData(),
      fetchFearGreedIndex(),
      fetchWhaleAlerts()
    ]);
    
    // Setup event listeners
    coinSelect.addEventListener('change', () => {
      loadTradingView(coinSelect.value);
    });
    
    chartActions.forEach(btn => {
      btn.addEventListener('click', () => {
        chartActions.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadTradingView(coinSelect.value, btn.dataset.interval);
      });
    });
    
    document.getElementById('refresh-sentiment').addEventListener('click', fetchFearGreedIndex);
    
    // Setup interval untuk update data
    setInterval(fetchBitcoinPrice, 30000);  // 30 detik
    setInterval(fetchMarketData, 120000);   // 2 menit
    setInterval(fetchFearGreedIndex, 300000); // 5 menit
    setInterval(fetchWhaleAlerts, 300000);  // 5 menit
    
    // Load chart setelah semua data inisialisasi
    setTimeout(() => loadTradingView('BTC'), 1000);
    
  } catch (error) {
    console.error('Initialization error:', error);
    alert('Failed to initialize dashboard. Please check console for details.');
  }
}

// 8. Pastikan TradingView script dimuat
if (!window.TradingView) {
  const script = document.createElement('script');
  script.src = 'https://s3.tradingview.com/tv.js';
  script.async = true;
  document.head.appendChild(script);
}

document.addEventListener('DOMContentLoaded', initDashboard);