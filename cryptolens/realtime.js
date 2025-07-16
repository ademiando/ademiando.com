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
const WHALE_API_KEY = 'YOUR_WHALE_ALERT_KEY';
const WHALE_ENDPOINT = 'https://api.whale-alert.io/v1/transactions';
const ALTSEASON_API = 'https://www.blockchaincenter.net/api/altcoin-season-index/';

function loadTradingView(coin, interval = 'D') {
  const chartContainer = document.getElementById('tv-chart');
  chartContainer.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Loading TradingView chart...</p></div>';
  const script = document.createElement('script');
  script.src = 'https://s3.tradingview.com/tv.js';
  script.onload = () => {
    new TradingView.widget({
      width: '100%',
      height: '400',
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
      container_id: 'tv-chart'
    });
  };
  document.body.appendChild(script);
}

async function fetchBitcoinPrice() {
  try {
    const resp = await fetch(`${COINGECKO_BASE}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`);
    const data = await resp.json();
    if (data.bitcoin) {
      const price = data.bitcoin.usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      const change = data.bitcoin.usd_24h_change.toFixed(2);
      btcPriceElement.textContent = price;
      priceChangeElement.textContent = `${change >= 0 ? '+' : ''}${change}%`;
      priceChangeElement.className = `price-change ${change >= 0 ? 'price-up' : 'price-down'}`;
    }
  } catch {
    btcPriceElement.textContent = 'Error';
    priceChangeElement.textContent = 'Error';
  }
}

async function fetchMarketData() {
  try {
    const resp = await fetch(`${COINGECKO_BASE}/global`);
    const g = (await resp.json()).data;
    marketCapElement.textContent = `$${g.total_market_cap.usd.toLocaleString('en-US')}`;
    volume24hElement.textContent = `$${g.total_volume.usd.toLocaleString('en-US')}`;
    dominanceElement.textContent = `${g.market_cap_percentage.btc.toFixed(1)}%`;
  } catch {
    marketCapElement.textContent = 'Error';
    volume24hElement.textContent = 'Error';
    dominanceElement.textContent = 'Error';
  }
}

async function fetchFearGreedIndex() {
  try {
    const { data } = await (await fetch(FNG_API)).json();
    if (data && data.length) {
      const { value, value_classification } = data[0];
      const v = parseInt(value, 10);
      fearGreedValue.textContent = v;
      fearGreedLabel.textContent = value_classification;
      document.querySelector('.gauge-value').style.strokeDashoffset = 534 - (534 * v / 100);
      sentimentDescription.textContent = v < 25
        ? 'Extreme fear can indicate a buying opportunity.'
        : v < 45
        ? 'Fear suggests market may be bottoming.'
        : v < 55
        ? 'Neutral sentiment.'
        : 'Greed is high—exercise caution.';
    }
  } catch {
    fearGreedValue.textContent = 'Error';
    fearGreedLabel.textContent = 'Error';
    sentimentDescription.textContent = 'Failed to fetch.';
  }
}

async function fetchWhaleAlerts() {
  try {
    whaleActivity.innerHTML = '';
    const url = `${WHALE_ENDPOINT}?api_key=${WHALE_API_KEY}&min_value=100000&start=${Math.floor(Date.now() / 1000) - 3600}`;
    const { transactions } = await (await fetch(url)).json();
    transactions.slice(0, 5).forEach(tx => {
      const item = document.createElement('div');
      item.className = 'activity-item';
      const icon = tx.direction === 'in' ? '<i class="fas fa-arrow-up"></i>' : '<i class="fas fa-arrow-down"></i>';
      const text = `${tx.amount.toFixed(2)} ${tx.symbol} (${(tx.amount_usd / 1e6).toFixed(1)}M USD) ${tx.direction === 'in' ? 'bought' : 'sold'}`;
      item.innerHTML = `<div class="activity-icon">${icon}</div><div class="activity-details"><div class="activity-amount">${text}</div><div class="activity-time">${new Date(tx.timestamp * 1000).toLocaleTimeString()} · ${tx.from_exchange || tx.to_exchange}</div></div>`;
      whaleActivity.appendChild(item);
    });
  } catch {
    whaleActivity.innerHTML = '<div class="activity-item"><div class="activity-details">Failed to load whale alerts</div></div>';
  }
}

async function fetchAltseasonMetrics() {
  try {
    const global = (await (await fetch(`${COINGECKO_BASE}/global`)).json()).data;
    document.getElementById('btc-dominance').textContent = `${global.market_cap_percentage.btc.toFixed(1)}%`;

    const prices = await (await fetch(`${COINGECKO_BASE}/simple/price?ids=bitcoin,ethereum&vs_currencies=usd`)).json();
    const ratio = (prices.ethereum.usd / prices.bitcoin.usd).toFixed(4);
    document.getElementById('eth-btc').textContent = ratio;

    const altResp = await fetch(ALTSEASON_API);
    const altData = await altResp.json();
    const index = altData.altcoinSeasonIndex;
    document.getElementById('altcoin-index').textContent = index;
    document.getElementById('altseason-sentiment').textContent =
      index > 75 ? 'Altseason 🔥' :
      index > 50 ? 'Warming up' :
      'Not yet';
  } catch {
    document.getElementById('altcoin-index').textContent = 'Error';
    document.getElementById('altseason-sentiment').textContent = 'Unavailable';
  }
}

async function initDashboard() {
  loadTradingView('BTC');
  await Promise.all([
    fetchBitcoinPrice(),
    fetchMarketData(),
    fetchFearGreedIndex(),
    fetchWhaleAlerts(),
    fetchAltseasonMetrics()
  ]);
  coinSelect.addEventListener('change', () => loadTradingView(coinSelect.value));
  chartActions.forEach(btn => btn.addEventListener('click', () => {
    chartActions.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadTradingView(coinSelect.value, btn.getAttribute('data-interval'));
  }));
  document.getElementById('refresh-sentiment').addEventListener('click', fetchFearGreedIndex);
  setInterval(() => {
    fetchBitcoinPrice();
    fetchMarketData();
    fetchFearGreedIndex();
  }, 60000);
}

document.addEventListener('DOMContentLoaded', initDashboard);