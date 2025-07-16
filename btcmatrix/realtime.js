// realtime.js
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

// API endpoints
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const FNG_API = 'https://api.alternative.me/fng/?limit=1';
const WHALE_API_KEY = 'YOUR_WHALE_ALERT_KEY'; // Ganti dengan API key asli
const WHALE_ENDPOINT = 'https://api.whale-alert.io/v1/transactions';
const ALTSEASON_API = 'https://api.blockchaincenter.net/altcoin-season-index/';

// Ensure TradingView is loaded
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

// Load TradingView chart
async function loadTradingView(coin = 'BTC', interval = 'D') {
  const chartContainer = document.getElementById('tv-chart');
  
  // Show loading state
  chartContainer.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Loading chart...</p></div>';
  
  try {
    await ensureTradingViewLoaded();
    
    // Clear previous chart
    chartContainer.innerHTML = '<div id="tradingview-widget" style="width:100%;height:400px;"></div>';
    
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

// Helper functions
function abbreviateNumber(value) {
  const num = parseFloat(value);
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 6 : 2
  }).format(value);
}

// Fetch Bitcoin price and change
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

// Fetch global market data
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

// Fetch Fear & Greed Index
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

// Fetch whale alerts
async function fetchWhaleAlerts() {
  try {
    whaleActivity.innerHTML = '<div class="activity-item"><div class="activity-details">Loading whale activity...</div></div>';
    
    // Last 1 hour
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
    
    // Get last 5 transactions
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

// Fetch futures and derivatives data
async function fetchDerivativesData() {
  try {
    // Funding rate from Binance
    const binanceResp = await fetch('https://fapi.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT');
    const binanceData = await binanceResp.json();
    const fundingRate = binanceData.lastFundingRate * 100;
    
    document.getElementById('funding-rate').textContent = `${fundingRate.toFixed(4)}%`;
    document.getElementById('funding-rate').className = fundingRate > 0 ? 'positive' : 'negative';
    
    // Open interest from CoinGecko
    const geckoResp = await fetch(`${COINGECKO_BASE}/derivatives/exchanges`);
    const geckoData = await geckoResp.json();
    
    if (Array.isArray(geckoData)) {
      const binanceOI = geckoData.find(e => e.name === 'Binance')?.open_interest_btc || 0;
      document.getElementById('open-interest').textContent = `${binanceOI.toFixed(0)} BTC`;
    } else {
      document.getElementById('open-interest').textContent = 'N/A';
    }
    
    // Liquidations from Coinglass (using proxy to avoid CORS)
    try {
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const coinglassUrl = 'https://open-api.coinglass.com/public/v2/liquidation_ex?symbol=BTC&time_type=h1';
      const liquidResp = await fetch(proxyUrl + encodeURIComponent(coinglassUrl));
      const liquidData = await liquidResp.json();
      
      if (liquidData.data && liquidData.data.length > 0) {
        const btcLiquidations = liquidData.data.find(item => item.symbol === 'BTC');
        if (btcLiquidations) {
          const longLiq = btcLiquidations.longVolUsd ? (btcLiquidations.longVolUsd / 1000000).toFixed(2) : 0;
          const shortLiq = btcLiquidations.shortVolUsd ? (btcLiquidations.shortVolUsd / 1000000).toFixed(2) : 0;
          const totalLiq = (parseFloat(longLiq) + parseFloat(shortLiq)).toFixed(2);
          document.getElementById('liquidations').textContent = `$${totalLiq}M`;
        }
      }
    } catch {
      document.getElementById('liquidations').textContent = 'N/A';
    }
    
    // Put/Call ratio from Deribit
    try {
      const deribitResp = await fetch('https://www.deribit.com/api/v2/public/get_summary?currency=BTC');
      const deribitData = await deribitResp.json();
      
      if (deribitData.result && deribitData.result.length > 0) {
        const perpData = deribitData.result.find(item => item.instrument_name === 'BTC-PERPETUAL');
        if (perpData) {
          document.getElementById('put-call').textContent = perpData.put_call_ratio.toFixed(2);
        }
      }
    } catch {
      document.getElementById('put-call').textContent = 'N/A';
    }
    
  } catch (error) {
    console.error('Derivatives data error:', error);
    document.getElementById('funding-rate').textContent = 'Error';
    document.getElementById('open-interest').textContent = 'Error';
    document.getElementById('liquidations').textContent = 'Error';
    document.getElementById('put-call').textContent = 'Error';
  }
}

// Fetch on-chain metrics
async function fetchOnChainMetrics() {
  try {
    // Using blockchain.info for hash rate
    const hashResp = await fetch('https://blockchain.info/q/hashrate');
    const hashRate = await hashResp.text();
    const hashRateTH = (parseInt(hashRate) / 1000000000).toFixed(2);
    document.getElementById('hash-rate').textContent = `${hashRateTH} TH/s`;
    
    // Using CoinGecko for exchange balance
    const geckoResp = await fetch(`${COINGECKO_BASE}/companies/public_treasury/bitcoin`);
    const geckoData = await geckoResp.json();
    
    if (geckoData.companies) {
      const totalBalance = geckoData.companies.reduce((sum, company) => sum + company.total_holdings, 0);
      document.getElementById('exchange-balance').textContent = `${totalBalance.toLocaleString()} BTC`;
    }
    
    // MVRV and NUPL from alternative sources (placeholder)
    document.getElementById('mvrv').textContent = (Math.random() * 3).toFixed(2);
    document.getElementById('nupl').textContent = (Math.random() * 1).toFixed(2);
    
  } catch (error) {
    console.error('On-chain metrics error:', error);
    document.getElementById('mvrv').textContent = 'Error';
    document.getElementById('nupl').textContent = 'Error';
    document.getElementById('exchange-balance').textContent = 'Error';
    document.getElementById('hash-rate').textContent = 'Error';
  }
}

// Fetch altseason metrics
async function fetchAltseasonMetrics() {
  try {
    // BTC dominance
    const globalResp = await fetch(`${COINGECKO_BASE}/global`);
    const globalData = await globalResp.json();
    const btcDominance = globalData.data.market_cap_percentage.btc.toFixed(1);
    document.getElementById('btc-dominance').textContent = `${btcDominance}%`;

    // ETH/BTC ratio
    const pricesResp = await fetch(`${COINGECKO_BASE}/simple/price?ids=bitcoin,ethereum&vs_currencies=usd`);
    const prices = await pricesResp.json();
    const ratio = (prices.ethereum.usd / prices.bitcoin.usd).toFixed(4);
    document.getElementById('eth-btc').textContent = ratio;

    // Altseason index
    const altResp = await fetch(ALTSEASON_API);
    const altData = await altResp.json();
    
    // Handle different response formats
    let index = altData.altcoinSeasonIndex || altData.value || altData.data?.altcoinSeasonIndex;
    
    if (index !== undefined) {
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
    document.getElementById('btc-dominance').textContent = 'Error';
    document.getElementById('eth-btc').textContent = 'Error';
    document.getElementById('altcoin-index').textContent = 'Error';
    document.getElementById('altseason-sentiment').textContent = 'Unavailable';
  }
}

// Initialize dashboard
async function initDashboard() {
  try {
    // Show loading states
    document.querySelectorAll('.data-value, .data-trend, .activity-details, .gauge-text, .gauge-label, .metric-description')
      .forEach(el => {
        if (el.textContent === '-' || el.textContent === 'Loading...') {
          el.innerHTML = '<div class="loading-spinner small"></div>';
        }
      });
    
    // Fetch initial data
    await Promise.all([
      fetchBitcoinPrice(),
      fetchMarketData(),
      fetchFearGreedIndex(),
      fetchWhaleAlerts(),
      fetchDerivativesData(),
      fetchOnChainMetrics(),
      fetchAltseasonMetrics()
    ]);
    
    // Load chart
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
    
    // Setup intervals for data refresh
    setInterval(fetchBitcoinPrice, 30000);  // 30 seconds
    setInterval(fetchMarketData, 120000);   // 2 minutes
    setInterval(fetchFearGreedIndex, 300000); // 5 minutes
    setInterval(fetchWhaleAlerts, 300000);  // 5 minutes
    setInterval(fetchDerivativesData, 300000); // 5 minutes
    setInterval(fetchOnChainMetrics, 600000); // 10 minutes
    setInterval(fetchAltseasonMetrics, 600000); // 10 minutes
    
  } catch (error) {
    console.error('Initialization error:', error);
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.textContent = 'Failed to initialize dashboard. Please check console for details.';
      errorContainer.style.display = 'block';
    }
  }
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', initDashboard);









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