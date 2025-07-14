const coinSelect = document.getElementById('coin-select');
const fgValue = document.getElementById('fear-greed-value');

async function fetchFearGreed() {
  const res = await fetch('https://api.alternative.me/fng/');
  const data = await res.json();
  fgValue.textContent = data.data[0].value + ' (' + data.data[0].value_classification + ')';
}

function loadTradingView(coin) {
  document.getElementById('tv-chart').innerHTML = '';
  const script = document.createElement('script');
  script.src = 'https://s3.tradingview.com/tv.js';
  script.onload = () => {
    new TradingView.widget({
      width: "100%",
      height: "400",
      symbol: "BINANCE:" + coin + "USDT",
      interval: "D",
      timezone: "Etc/UTC",
      theme: "light",
      style: "1",
      locale: "en",
      toolbar_bg: "#f1f3f6",
      enable_publishing: false,
      container_id: "tv-chart"
    });
  };
  document.body.appendChild(script);
}

async function fetchOnChain(coin) {
  const apiKey = 'YOUR_GLASSNODE_API_KEY';
  const mvrvRes = await fetch(`https://api.glassnode.com/v1/metrics/market/mvrv_z_score?api_key=${apiKey}&a=${coin}`);
  const mvrv = await mvrvRes.json();
  document.getElementById('mvrv').textContent = mvrv.pop()[1].toFixed(2);
}

async function fetchFutures(coin) {
  const cgKey = 'YOUR_COINGLASS_API_KEY';
  const frRes = await fetch(`https://api.coinglass.com/api/pro/v1/futures/fundingrate?api_key=${cgKey}&symbol=${coin}`);
  const frData = await frRes.json();
  document.getElementById('funding-rate').textContent = frData.data[0].avgFundingRate;
}

async function fetchSocial() {
  document.getElementById('whale-alerts').textContent = 'Fitur menyusul...';
}

async function fetchAltseason() {
  const domRes = await fetch('https://api.coingecko.com/api/v3/global');
  const domData = await domRes.json();
  document.getElementById('btc-dominance').textContent = domData.data.market_cap_percentage.btc.toFixed(2);
  document.getElementById('eth-btc').textContent = (
    domData.data.market_cap_percentage.eth /
    domData.data.market_cap_percentage.btc
  ).toFixed(3);
}

async function refreshAll() {
  const coin = coinSelect.value;
  await fetchFearGreed();
  loadTradingView(coin);
  await fetchOnChain(coin);
  await fetchFutures(coin);
  await fetchSocial();
  await fetchAltseason();
}

coinSelect.addEventListener('change', refreshAll);
window.addEventListener('load', refreshAll);