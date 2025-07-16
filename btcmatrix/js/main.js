// Fungsi utilitas umum
export const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

export function abbreviateNumber(value) {
  const num = parseFloat(value);
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

export function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 6 : 2
  }).format(value);
}

// Inisialisasi dashboard
import { loadTradingView } from './chart.js';
import { fetchBitcoinPrice, fetchMarketData } from './marketdata.js';
import { fetchFearGreedIndex } from './sentiment.js';
import { fetchWhaleAlerts } from './whale.js';
import { fetchDerivativesData } from './derivatives.js';
import { fetchOnChainMetrics } from './onchain.js';
import { fetchAltseasonMetrics } from './altseason.js';
import { fetchOrderBook } from './orderbook.js';
import { fetchLiquidityPools } from './liquiditypool.js';

const coinSelect = document.getElementById('coin-select');
const chartActions = document.querySelectorAll('.chart-actions .btn');

async function initDashboard() {
  try {
    // Tampilkan loading state
    document.querySelectorAll('.data-value, .data-trend, .activity-details, .gauge-text, .gauge-label, .metric-description')
      .forEach(el => {
        if (el.textContent === '-' || el.textContent === 'Loading...') {
          el.innerHTML = '<div class="loading-spinner small"></div>';
        }
      });
    
    // Ambil data awal
    await Promise.all([
      fetchBitcoinPrice(),
      fetchMarketData(),
      fetchFearGreedIndex(),
      fetchWhaleAlerts(),
      fetchDerivativesData(),
      fetchOnChainMetrics(),
      fetchAltseasonMetrics(),
      fetchOrderBook(),
      fetchLiquidityPools()
    ]);
    
    // Muat chart
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
    
    // Setup interval untuk pembaruan data
    setInterval(fetchBitcoinPrice, 30000);  // 30 detik
    setInterval(fetchMarketData, 120000);   // 2 menit
    setInterval(fetchFearGreedIndex, 300000); // 5 menit
    setInterval(fetchWhaleAlerts, 300000);  // 5 menit
    setInterval(fetchDerivativesData, 300000); // 5 menit
    setInterval(fetchOnChainMetrics, 600000); // 10 menit
    setInterval(fetchAltseasonMetrics, 600000); // 10 menit
    setInterval(fetchOrderBook, 10000);     // 10 detik
    setInterval(fetchLiquidityPools, 60000); // 1 menit
    
  } catch (error) {
    console.error('Initialization error:', error);
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.textContent = 'Failed to initialize dashboard. Please check console for details.';
      errorContainer.style.display = 'block';
    }
  }
}

// Mulai dashboard saat DOM siap
document.addEventListener('DOMContentLoaded', initDashboard);