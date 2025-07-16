import { COINGECKO_BASE } from './main.js';

const ALTSEASON_API = 'https://api.blockchaincenter.net/altcoin-season-index/';

// Ambil metrik altseason
export async function fetchAltseasonMetrics() {
  try {
    // Dominasi BTC
    const globalResp = await fetch(`${COINGECKO_BASE}/global`);
    const globalData = await globalResp.json();
    const btcDominance = globalData.data.market_cap_percentage.btc.toFixed(1);
    document.getElementById('btc-dominance').textContent = `${btcDominance}%`;

    // Rasio ETH/BTC
    const pricesResp = await fetch(`${COINGECKO_BASE}/simple/price?ids=bitcoin,ethereum&vs_currencies=usd`);
    const prices = await pricesResp.json();
    const ratio = (prices.ethereum.usd / prices.bitcoin.usd).toFixed(4);
    document.getElementById('eth-btc').textContent = ratio;

    // Indeks altseason
    const altResp = await fetch(ALTSEASON_API);
    const altData = await altResp.json();
    
    // Tangani format respons yang berbeda
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