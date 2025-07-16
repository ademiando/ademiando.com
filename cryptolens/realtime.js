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

// Base URLs for APIs
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const FNG_API = 'https://api.alternative.me/fng/?limit=1';
const WHALE_API_KEY = 'YOUR_WHALE_ALERT_KEY'; // Replace with your actual key
const WHALE_ENDPOINT = 'https://api.whale-alert.io/v1/transactions';
const ALTSEASON_API = 'https://api.blockchaincenter.net/altcoin-season-index/';
const GLASSNODE_BASE = 'https://api.glassnode.com/v1';
const GLASSNODE_API_KEY = 'YOUR_GLASSNODE_KEY'; // Replace with your actual key
const COINGLASS_BASE = 'https://open-api.coinglass.com/api/pro/v1';
const COINGLASS_API_KEY = 'YOUR_COINGLASS_KEY'; // Replace with your actual key

// Ensure TradingView script is loaded
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
async function loadTradingView(coin = 'BTC', interval = '1D') {
  const chartContainer = document.getElementById('tv-chart');
  chartContainer.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Loading chart...</p></div>';
  
  try {
    await ensureTradingViewLoaded();
    
    // Clear previous chart
    while (chartContainer.firstChild) {
      chartContainer.removeChild(chartContainer.firstChild);
    }
    
    // Create new chart container
    const chartDiv = document.createElement('div');
    chartDiv.id = 'tradingview-widget';
    chartDiv.style.width = '100%';
    chartDiv.style.height = '400px';
    chartContainer.appendChild(chartDiv);
    
    // Initialize TradingView widget
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
      autosize: true,
      studies: ['RSI@tv-basicstudies', 'Volume@tv-basicstudies'],
    });
  } catch (error) {
    console.error('TradingView error:', error);
    chartContainer.innerHTML = '<div class="error">Failed to load chart. Please refresh.</div>';
  }
}

// Helper function to format large numbers
function abbreviateNumber(value) {
  const num = parseFloat(value);
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

// Format currency
function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 6 : 2
  }).format(value);
}

// Fetch Bitcoin price
async function fetchBitcoinPrice() {
  try {
    const resp = await fetch(`${COINGECKO_BASE}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`);
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

// Fetch market data
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
    
    // Get transactions from last hour
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
    
    // Display latest 5 transactions
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

// Fetch on-chain metrics
async function fetchOnChainMetrics() {
  try {
    // Fetch Glassnode data (requires API key)
    const today = Math.floor(Date.now() / 1000);
    const oneWeekAgo = today - 604800;
    
    // Fetch network growth
    const growthResp = await fetch(`${GLASSNODE_BASE}/metrics/network/growth_sum?a=BTC&s=${oneWeekAgo}&u=${today}&api_key=${GLASSNODE_API_KEY}`);
    const growthData = await growthResp.json();
    const networkGrowth = growthData && growthData.length ? growthData[growthData.length - 1].v : 0;
    
    // Fetch active addresses
    const activeResp = await fetch(`${GLASSNODE_BASE}/metrics/addresses/active_count?a=BTC&s=${oneWeekAgo}&u=${today}&api_key=${GLASSNODE_API_KEY}`);
    const activeData = await activeResp.json();
    const activeAddresses = activeData && activeData.length ? activeData[activeData.length - 1].v : 0;
    
    // Fetch miner flows
    const minerResp = await fetch(`${GLASSNODE_BASE}/metrics/mining/miner_outflow_multiple?a=BTC&s=${oneWeekAgo}&u=${today}&api_key=${GLASSNODE_API_KEY}`);
    const minerData = await minerResp.json();
    const minerOutflow = minerData && minerData.length ? minerData[minerData.length - 1].v : 0;
    
    // Update UI
    document.getElementById('network-growth').textContent = abbreviateNumber(networkGrowth);
    document.getElementById('active-addresses').textContent = abbreviateNumber(activeAddresses);
    document.getElementById('miner-outflow').textContent = minerOutflow.toFixed(2);
    
  } catch (error) {
    console.error('On-chain metrics error:', error);
    document.getElementById('network-growth').textContent = 'Error';
    document.getElementById('active-addresses').textContent = 'Error';
    document.getElementById('miner-outflow').textContent = 'Error';
  }
}

// Fetch futures and derivatives data
async function fetchFuturesData() {
  try {
    // Fetch funding rates
    const fundingResp = await fetch(`${COINGLASS_BASE}/futures/funding_rates?symbol=BTC`, {
      headers: { 'coinglassSecret': COINGLASS_API_KEY }
    });
    const fundingData = await fundingResp.json();
    const btcFunding = fundingData.data && fundingData.data.length ? 
      (fundingData.data[0].uMarginList[0].rate * 100).toFixed(4) + '%' : 'N/A';
    
    // Fetch open interest
    const oiResp = await fetch(`${COINGLASS_BASE}/futures/openInterest?symbol=BTC`, {
      headers: { 'coinglassSecret': COINGLASS_API_KEY }
    });
    const oiData = await oiResp.json();
    const openInterest = oiData.data ? `$${abbreviateNumber(oiData.data.total * 10000)}` : 'N/A';
    
    // Fetch liquidation data
    const liquidResp = await fetch(`${COINGLASS_BASE}/futures/liquidation?symbol=BTC`, {
      headers: { 'coinglassSecret': COINGLASS_API_KEY }
    });
    const liquidData = await liquidResp.json();
    const longLiquidations = liquidData.data ? `$${abbreviateNumber(liquidData.data.longVolUsd)}` : 'N/A';
    const shortLiquidations = liquidData.data ? `$${abbreviateNumber(liquidData.data.shortVolUsd)}` : 'N/A';
    
    // Update UI
    document.getElementById('funding-rate').textContent = btcFunding;
    document.getElementById('open-interest').textContent = openInterest;
    document.getElementById('long-liquidations').textContent = longLiquidations;
    document.getElementById('short-liquidations').textContent = shortLiquidations;
    
  } catch (error) {
    console.error('Futures data error:', error);
    document.getElementById('funding-rate').textContent = 'Error';
    document.getElementById('open-interest').textContent = 'Error';
    document.getElementById('long-liquidations').textContent = 'Error';
    document.getElementById('short-liquidations').textContent = 'Error';
  }
}

// Fetch altseason metrics
async function fetchAltseasonMetrics() {
  try {
    // Fetch BTC dominance
    const globalResp = await fetch(`${COINGECKO_BASE}/global`);
    const globalData = await globalResp.json();
    const btcDominance = globalData.data.market_cap_percentage.btc.toFixed(1);
    document.getElementById('btc-dominance').textContent = `${btcDominance}%`;

    // Fetch ETH/BTC ratio
    const pricesResp = await fetch(`${COINGECKO_BASE}/simple/price?ids=bitcoin,ethereum&vs_currencies=usd`);
    const prices = await pricesResp.json();
    const ratio = (prices.ethereum.usd / prices.bitcoin.usd).toFixed(4);
    document.getElementById('eth-btc').textContent = ratio;

    // Fetch altseason index
    const altResp = await fetch(ALTSEASON_API);
    const altData = await altResp.json();
    const index = altData.altcoinSeasonIndex || altData.value;
    
    document.getElementById('altcoin-index').textContent = index;
    
    // Determine altseason status
    const sentimentElement = document.getElementById('altseason-sentiment');
    if (index > 75) {
      sentimentElement.textContent = 'Altseason 🔥';
      sentimentElement.className = 'altseason-active';
    } else if (index > 50) {
      sentimentElement.textContent = 'Warming up';
      sentimentElement.className = 'altseason-warming';
    } else {
      sentimentElement.textContent = 'Not yet';
      sentimentElement.className = 'altseason-inactive';
    }
    
  } catch (error) {
    console.error('Altseason metrics error:', error);
    document.getElementById('altcoin-index').textContent = 'Error';
    document.getElementById('altseason-sentiment').textContent = 'Unavailable';
  }
}

// Initialize dashboard
async function initDashboard() {
  try {
    // Show loading states
    document.querySelectorAll('.card-content').forEach(el => {
      el.innerHTML = '<div class="loading-spinner"></div>';
    });
    
    // Load initial data
    await Promise.all([
      fetchBitcoinPrice(),
      fetchMarketData(),
      fetchFearGreedIndex(),
      fetchWhaleAlerts(),
      fetchOnChainMetrics(),
      fetchFuturesData(),
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
    document.getElementById('refresh-futures').addEventListener('click', fetchFuturesData);
    document.getElementById('refresh-onchain').addEventListener('click', fetchOnChainMetrics);
    
    // Setup intervals
    setInterval(fetchBitcoinPrice, 30000);
    setInterval(fetchMarketData, 120000);
    setInterval(fetchFearGreedIndex, 300000);
    setInterval(fetchWhaleAlerts, 300000);
    setInterval(fetchOnChainMetrics, 600000);
    setInterval(fetchFuturesData, 300000);
    setInterval(fetchAltseasonMetrics, 600000);
    
  } catch (error) {
    console.error('Initialization error:', error);
    
    // Show error in UI
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.textContent = `Failed to initialize: ${error.message}`;
      errorContainer.style.display = 'block';
    }
    
    // Show error in cards
    document.querySelectorAll('.card-content').forEach(el => {
      el.innerHTML = '<div class="error">Failed to load data</div>';
    });
  }
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', initDashboard);