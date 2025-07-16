
import { COINGECKO_BASE } from './main.js';

// Ambil data futures & derivatives
export async function fetchDerivativesData() {
  try {
    // Funding rate dari Binance
    const binanceResp = await fetch('https://fapi.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT');
    const binanceData = await binanceResp.json();
    const fundingRate = binanceData.lastFundingRate * 100;
    
    document.getElementById('funding-rate').textContent = `${fundingRate.toFixed(4)}%`;
    document.getElementById('funding-rate').className = fundingRate > 0 ? 'positive' : 'negative';
    
    // Open interest dari CoinGecko
    const geckoResp = await fetch(`${COINGECKO_BASE}/derivatives/exchanges`);
    const geckoData = await geckoResp.json();
    
    if (Array.isArray(geckoData)) {
      const binanceOI = geckoData.find(e => e.name === 'Binance')?.open_interest_btc || 0;
      document.getElementById('open-interest').textContent = `${binanceOI.toFixed(0)} BTC`;
    } else {
      document.getElementById('open-interest').textContent = 'N/A';
    }
    
    // Liquidations dari Coinglass (menggunakan proxy untuk menghindari CORS)
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
    
    // Put/Call ratio dari Deribit
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