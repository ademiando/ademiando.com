
import { COINGECKO_BASE } from './main.js';

// Ambil metrik on-chain
export async function fetchOnChainMetrics() {
  try {
    // Hash rate dari blockchain.info
    const hashResp = await fetch('https://blockchain.info/q/hashrate');
    const hashRate = await hashResp.text();
    const hashRateTH = (parseInt(hashRate) / 1000000000).toFixed(2);
    document.getElementById('hash-rate').textContent = `${hashRateTH} TH/s`;
    
    // Exchange balance dari CoinGecko
    const geckoResp = await fetch(`${COINGECKO_BASE}/companies/public_treasury/bitcoin`);
    const geckoData = await geckoResp.json();
    
    if (geckoData.companies) {
      const totalBalance = geckoData.companies.reduce((sum, company) => sum + company.total_holdings, 0);
      document.getElementById('exchange-balance').textContent = `${totalBalance.toLocaleString()} BTC`;
    }
    
    // MVRV dan NUPL dari sumber alternatif (placeholder)
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