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
const ALTSEASON_API = 'https://api.blockchaincenter.net/altcoin-season-index/';
const DERIVATIVES_API = 'https://fapi.coinglass.com/api/futures/home';

// Fungsi untuk memastikan TradingView dimuat
function ensureTradingViewLoaded() {
  return new Promise((resolve) => {
    if (window.TradingView) {
      resolve();
    } else {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = resolve;
      document.head.appendChild(script);
    }
  });
}

// Fungsi untuk memuat chart TradingView
async function loadTradingView(coin = 'BTC', interval = '1D') {
  const chartContainer = document.getElementById('tv-chart');
  
  // Hapus konten lama
  chartContainer.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Loading chart...</p></div>';
  
  try {
    // Pastikan library TradingView sudah dimuat
    await ensureTradingViewLoaded();
    
    // Buat container baru
    const chartDiv = document.createElement('div');
    chartDiv.id = 'tradingview-widget';
    chartDiv.style.width = '100%';
    chartDiv.style.height = '400px';
    chartContainer.innerHTML = '';
    chartContainer.appendChild(chartDiv);
    
    // Buat widget TradingView
    new TradingView.widget({
      width: '100%',
      height: 400,
      symbol: `BINANCE:${coin}USDT`,
      interval,
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      toolbar_bg: '#1e222d',
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      container_id: 'tradingview-widget',
      autosize: true
    });
  } catch (error) {
    console.error('TradingView error:', error);
    chartContainer.innerHTML = '<div class="error">Failed to load chart. Please refresh.</div>';
  }
}

// Format angka besar menjadi singkat (1.2B, 3.4M)
function abbreviateNumber(value) {
  const num = parseFloat(value);
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

// Format mata uang
function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 6 : 2
  }).format(value);
}

// Ambil harga Bitcoin dan perubahan
async function fetchBitcoinPrice() {
  try {
    const timestamp = Date.now();
    const resp = await fetch(`${COINGECKO_BASE}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&t=${timestamp}`);
    const data = await resp.json();
    
    if (data.bitcoin) {
      const price = formatCurrency(data.bitcoin.usd);
      const change = data.bitcoin.usd_24h_change.toFixed(2);
      
      btcPriceElement.textContent = price;
      priceChangeElement.textContent = `${change >= 0 ? '+' : ''}${change}%`;
      priceChangeElement.className = `price-change ${change >= 0 ? 'price-up' : 'price-down'}`;
    }
  } catch (error) {
    console.error('Bitcoin price error:', error);
    btcPriceElement.textContent = 'Error';
    priceChangeElement.textContent = 'Error';
  }
}

// Ambil data pasar global
async function fetchMarketData() {
  try {
    const resp = await fetch(`${COINGECKO_BASE}/global`);
    const globalData = await resp.json();
    
    if (globalData.data) {
      const { total_market_cap, total_volume, market_cap_percentage } = globalData.data;
      
      marketCapElement.textContent = `$${abbreviateNumber(total_market_cap.usd)}`;
      volume24hElement.textContent = `$${abbreviateNumber(total_volume.usd)}`;
      dominanceElement.textContent = `${market_cap_percentage.btc.toFixed(1)}%`;
    }
  } catch (error) {
    console.error('Market data error:', error);
    marketCapElement.textContent = 'Error';
    volume24hElement.textContent = 'Error';
    dominanceElement.textContent = 'Error';
  }
}

// Ambil Fear & Greed Index
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
    console.error('Fear & Greed error:', error);
    fearGreedValue.textContent = 'Error';
    fearGreedLabel.textContent = 'Error';
    sentimentDescription.textContent = 'Failed to fetch sentiment data';
  }
}

// Ambil aktivitas whale (ONCHAIN METRICS)
async function fetchWhaleAlerts() {
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

// Ambil data futures & derivatives
async function fetchDerivativesData() {
  try {
    // Menggunakan API CoinGecko untuk futures
    const resp = await fetch(`${COINGECKO_BASE}/derivatives/exchanges`);
    const data = await resp.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid derivatives data');
    }
    
    // Hitung total volume 24h
    const totalVolume = data.reduce((sum, exchange) => sum + (exchange.trade_volume_24h_btc || 0), 0);
    
    // Temukan BTC open interest
    const btcOI = data.find(e => e.name === 'Binance')?.open_interest_btc || 0;
    
    // Update UI
    document.getElementById('futures-volume').textContent = `${totalVolume.toFixed(0)} BTC`;
    document.getElementById('open-interest').textContent = `${btcOI.toFixed(0)} BTC`;
    
    // Ambil funding rates
    const binanceResp = await fetch('https://fapi.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT');
    const binanceData = await binanceResp.json();
    const fundingRate = binanceData.lastFundingRate * 100;
    
    document.getElementById('funding-rate').textContent = `${fundingRate.toFixed(4)}%`;
    document.getElementById('funding-rate').className = fundingRate > 0 ? 'positive' : 'negative';
    
  } catch (error) {
    console.error('Derivatives data error:', error);
    document.getElementById('futures-volume').textContent = 'Error';
    document.getElementById('open-interest').textContent = 'Error';
    document.getElementById('funding-rate').textContent = 'Error';
  }
}

// Ambil metrik altseason
async function fetchAltseasonMetrics() {
  try {
    // Dominance BTC
    const globalResp = await fetch(`${COINGECKO_BASE}/global`);
    const globalData = await globalResp.json();
    const btcDominance = globalData.data.market_cap_percentage.btc.toFixed(1);
    document.getElementById('btc-dominance').textContent = `${btcDominance}%`;

    // Rasio ETH/BTC
    const pricesResp = await fetch(`${COINGECKO_BASE}/simple/price?ids=bitcoin,ethereum&vs_currencies=usd`);
    const prices = await pricesResp.json();
    const ratio = (prices.ethereum.usd / prices.bitcoin.usd).toFixed(4);
    document.getElementById('eth-btc').textContent = ratio;

    // Altseason index
    const altResp = await fetch(ALTSEASON_API);
    const altData = await altResp.json();
    
    // Tangani format respons yang berbeda
    let index = altData.altcoinSeasonIndex;
    if (!index && altData.data) {
      index = altData.data.altcoinSeasonIndex;
    }
    
    if (index) {
      document.getElementById('altcoin-index').textContent = index;
      document.getElementById('altseason-sentiment').textContent =
        index > 75 ? 'Altseason 🔥' :
        index > 50 ? 'Warming up' :
        'Not yet';
    } else {
      throw new Error('Invalid altseason data');
    }
    
  } catch (error) {
    console.error('Altseason metrics error:', error);
    document.getElementById('altcoin-index').textContent = 'Error';
    document.getElementById('altseason-sentiment').textContent = 'Unavailable';
  }
}

// Inisialisasi dashboard
async function initDashboard() {
  try {
    // Muat data awal
    await Promise.all([
      fetchBitcoinPrice(),
      fetchMarketData(),
      fetchFearGreedIndex(),
      fetchWhaleAlerts(),
      fetchDerivativesData(),
      fetchAltseasonMetrics()
    ]);
    
    // Muat chart setelah data awal
    await loadTradingView('BTC');
    
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
    setInterval(fetchDerivativesData, 300000); // 5 menit
    setInterval(fetchAltseasonMetrics, 600000); // 10 menit
    
  } catch (error) {
    console.error('Initialization error:', error);
    // Tampilkan pesan error di UI
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.textContent = 'Failed to initialize dashboard. Please try again later.';
      errorContainer.style.display = 'block';
    }
    
    // Tampilkan pesan error di setiap card
    document.querySelectorAll('.metric-card').forEach(card => {
      const content = card.querySelector('.card-content');
      if (content) {
        content.innerHTML = '<div class="error">Failed to load data</div>';
      }
    });
  }
}

// Mulai dashboard saat DOM siap
document.addEventListener('DOMContentLoaded', initDashboard);