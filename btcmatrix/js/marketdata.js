
import { COINGECKO_BASE, abbreviateNumber, formatCurrency } from './main.js';

// Elemen DOM
const btcPriceElement = document.getElementById('btc-price');
const priceChangeElement = document.getElementById('price-change');
const marketCapElement = document.getElementById('market-cap');
const volume24hElement = document.getElementById('volume-24h');
const dominanceElement = document.getElementById('dominance');

// Ambil harga Bitcoin dan perubahan
export async function fetchBitcoinPrice() {
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
export async function fetchMarketData() {
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