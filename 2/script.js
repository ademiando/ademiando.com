// script.js
// Placeholder for API keys (to be replaced in production)
const COINGECKO_API_KEY = 'YOUR_COINGECKO_API_KEY';
const GLASSNODE_API_KEY = 'YOUR_GLASSNODE_API_KEY';
const ALTERNATIVE_API_KEY = 'YOUR_ALTERNATIVE_API_KEY';

// Global variables
let currentTheme = 'light';
let activePanel = 'overview';
let chartInstances = {};

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('.theme-icon');
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
const loadingOverlay = document.getElementById('loading-overlay');

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initTabs();
    initEventListeners();
    
    // Load initial panel data
    loadPanelData('overview');
});

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('btcDashTheme');
    currentTheme = savedTheme || 'light';
    applyTheme();
}

// Apply current theme
function applyTheme() {
    document.documentElement.className = currentTheme;
    localStorage.setItem('btcDashTheme', currentTheme);
    themeIcon.textContent = currentTheme === 'light' ? '🌙' : '☀️';
}

// Toggle theme
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme();
}

// Initialize tab navigation
function initTabs() {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const panelId = tab.dataset.panel;
            switchPanel(panelId);
        });
    });
}

// Switch between panels
function switchPanel(panelId) {
    // Update active tab
    tabs.forEach(tab => {
        const isActive = tab.dataset.panel === panelId;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive.toString());
    });
    
    // Update active panel
    panels.forEach(panel => {
        panel.classList.toggle('active', panel.id === `${panelId}-panel`);
    });
    
    // Load data for the new panel
    if (panelId !== activePanel) {
        activePanel = panelId;
        loadPanelData(panelId);
    }
}

// Initialize event listeners
function initEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    
    // Add event listeners for chart controls
    document.getElementById('toggle-indicators')?.addEventListener('click', toggleIndicators);
    document.getElementById('timeframe-select')?.addEventListener('change', updateChartTimeframe);
    document.getElementById('exchange-select')?.addEventListener('change', updateOrderbookExchange);
    document.getElementById('macro-asset-select')?.addEventListener('change', updateMacroChart);
    document.getElementById('correlation-period')?.addEventListener('change', updateMacroChart);
}

// Toggle chart indicators
function toggleIndicators() {
    const button = document.getElementById('toggle-indicators');
    const show = button.textContent.includes('Show');
    
    button.textContent = show ? 'Hide Indicators' : 'Show Indicators';
    
    if (chartInstances.priceChart) {
        chartInstances.priceChart.options.plugins.tooltip.mode = show ? 'index' : 'nearest';
        chartInstances.priceChart.options.interaction.mode = show ? 'index' : 'nearest';
        
        const smaDataset = chartInstances.priceChart.data.datasets.find(d => d.label === 'SMA 50');
        const emaDataset = chartInstances.priceChart.data.datasets.find(d => d.label === 'EMA 200');
        
        if (smaDataset) smaDataset.hidden = !show;
        if (emaDataset) emaDataset.hidden = !show;
        
        chartInstances.priceChart.update();
    }
}

// Update chart timeframe
function updateChartTimeframe() {
    const timeframe = document.getElementById('timeframe-select').value;
    loadChartData(timeframe);
}

// Update orderbook exchange
function updateOrderbookExchange() {
    const exchange = document.getElementById('exchange-select').value;
    initOrderbook(exchange);
}

// Update macro chart
function updateMacroChart() {
    const asset = document.getElementById('macro-asset-select').value;
    const period = parseInt(document.getElementById('correlation-period').value);
    loadMacroData(asset, period);
}

// Show loading state
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

// Hide loading state
function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Load data for a specific panel
async function loadPanelData(panelId) {
    showLoading();
    
    try {
        switch(panelId) {
            case 'overview':
                await loadOverviewData();
                break;
            case 'chart':
                await loadChartData('1d');
                break;
            case 'orderbook':
                initOrderbook('binance');
                break;
            case 'onchain':
                await loadOnchainData();
                break;
            case 'sentiment':
                await loadSentimentData();
                break;
            case 'derivatives':
                await loadDerivativesData();
                break;
            case 'macro':
                await loadMacroData('dxy', 90);
                break;
            case 'blockchain':
                await loadBlockchainData();
                break;
        }
    } catch (error) {
        console.error(`Error loading ${panelId} data:`, error);
        // Show error message in panel
        const panel = document.getElementById(`${panelId}-panel`);
        if (panel) {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = 'Failed to load data. Please try again later.';
            panel.appendChild(errorElement);
        }
    } finally {
        hideLoading();
    }
}

// Load overview data
async function loadOverviewData() {
    try {
        // Fetch data from CoinGecko API
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
        const data = await response.json();
        
        // Update DOM with data
        const marketData = data.market_data;
        document.getElementById('btc-price').textContent = `$${formatNumber(marketData.current_price.usd, 2)}`;
        document.getElementById('btc-change').textContent = `${marketData.price_change_percentage_24h.toFixed(2)}%`;
        document.getElementById('btc-change').className = `metric-change ${marketData.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`;
        
        document.getElementById('market-cap').textContent = `$${formatNumber(marketData.market_cap.usd, 0)}`;
        document.getElementById('market-cap-change').textContent = `${marketData.market_cap_change_percentage_24h.toFixed(2)}%`;
        
        document.getElementById('volume').textContent = `$${formatNumber(marketData.total_volume.usd, 0)}`;
        
        const high = formatNumber(marketData.high_24h.usd, 2);
        const low = formatNumber(marketData.low_24h.usd, 2);
        const rangePct = ((marketData.high_24h.usd - marketData.low_24h.usd) / marketData.low_24h.usd * 100).toFixed(2);
        document.getElementById('high-low').textContent = `$${high} / $${low}`;
        document.getElementById('high-low').nextElementSibling.textContent = `Range: ${rangePct}%`;
        
        const circulating = formatNumber(marketData.circulating_supply, 0);
        const total = formatNumber(marketData.total_supply, 0);
        document.getElementById('supply').textContent = `${circulating} BTC / ${total} BTC`;
        
        document.getElementById('dominance').textContent = `${marketData.market_cap_percentage.btc.toFixed(1)}%`;
        
        // Update last updated timestamp
        const now = new Date();
        document.getElementById('overview-updated').textContent = now.toLocaleTimeString();
    } catch (error) {
        console.error('Error loading overview data:', error);
        throw error;
    }
}

// Load chart data
async function loadChartData(timeframe) {
    try {
        // Simulate fetching data from Binance API
        // In a real application, this would fetch actual candlestick data
        const {candles, sma50, ema200} = generateSampleChartData(timeframe);
        
        // Create or update chart
        const ctx = document.getElementById('price-chart').getContext('2d');
        
        if (chartInstances.priceChart) {
            chartInstances.priceChart.destroy();
        }
        
        chartInstances.priceChart = new Chart(ctx, {
            type: 'candlestick',
            data: {
                datasets: [{
                    label: 'BTC/USD',
                    data: candles,
                    color: {
                        up: 'rgba(58, 134, 255, 1)',
                        down: 'rgba(239, 71, 111, 1)',
                        unchanged: 'rgba(156, 163, 175, 1)'
                    }
                }, {
                    label: 'SMA 50',
                    data: sma50,
                    borderColor: '#06d6a0',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    tension: 0.1,
                    hidden: true
                }, {
                    label: 'EMA 200',
                    data: ema200,
                    borderColor: '#ffd166',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    tension: 0.1,
                    hidden: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: timeframe === '1h' ? 'hour' : 
                                  timeframe === '4h' ? 'hour' : 
                                  timeframe === '1d' ? 'day' : 
                                  timeframe === '1w' ? 'week' : 'month'
                        }
                    },
                    y: {
                        beginAtZero: false
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'nearest',
                        intersect: false
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading chart data:', error);
        throw error;
    }
}

// Initialize orderbook
function initOrderbook(exchange) {
    try {
        const container = document.getElementById('orderbook-chart');
        container.innerHTML = `<div class="orderbook-placeholder">
            <p>Connecting to ${exchange} orderbook...</p>
            <div class="orderbook-simulation"></div>
        </div>`;
        
        // Simulate WebSocket connection and data flow
        simulateOrderbookData(exchange);
    } catch (error) {
        console.error('Error initializing orderbook:', error);
        throw error;
    }
}

// Load on-chain data
async function loadOnchainData() {
    try {
        // Simulate fetching data from Glassnode API
        // In a real application, this would make actual API calls
        
        // Active addresses
        const activeAddresses = Math.floor(Math.random() * 1000000) + 500000;
        document.getElementById('active-addresses').textContent = formatNumber(activeAddresses, 0);
        
        // MVRV ratio
        const mvrv = (Math.random() * 3 + 0.5).toFixed(2);
        document.getElementById('mvrv').textContent = mvrv;
        
        // Exchange flow
        const inflow = Math.floor(Math.random() * 5000) + 1000;
        const outflow = Math.floor(Math.random() * 5000) + 1000;
        const netFlow = inflow - outflow;
        document.getElementById('exchange-flow').textContent = `${formatNumber(inflow)} BTC in / ${formatNumber(outflow)} BTC out`;
        document.getElementById('exchange-flow').nextElementSibling.textContent = `Net: ${netFlow >= 0 ? '+' : ''}${formatNumber(netFlow)} BTC`;
        
        // Network metrics
        document.getElementById('hash-rate').textContent = `${(Math.random() * 200 + 300).toFixed(0)} EH/s`;
        document.getElementById('difficulty').textContent = `${(Math.random() * 30 + 40).toFixed(0)} T`;
    } catch (error) {
        console.error('Error loading on-chain data:', error);
        throw error;
    }
}

// Load sentiment data
async function loadSentimentData() {
    try {
        // Fetch Fear & Greed Index from Alternative.me API
        const fgiResponse = await fetch(`https://api.alternative.me/fng/?limit=1`);
        const fgiData = await fgiResponse.json();
        const fgiValue = fgiData.data[0].value;
        
        // Update FGI display
        document.getElementById('fgi-score').textContent = fgiValue;
        
        // Determine sentiment label
        let fgiLabel = '';
        if (fgiValue >= 75) fgiLabel = 'Extreme Greed';
        else if (fgiValue >= 55) fgiLabel = 'Greed';
        else if (fgiValue >= 45) fgiLabel = 'Neutral';
        else if (fgiValue >= 25) fgiLabel = 'Fear';
        else fgiLabel = 'Extreme Fear';
        
        document.getElementById('fgi-label').textContent = fgiLabel;
        
        // Update gauge
        document.getElementById('fgi-gauge').style.width = `${fgiValue}%`;
        
        // Create sentiment chart
        const ctx = document.getElementById('sentiment-chart').getContext('2d');
        
        if (chartInstances.sentimentChart) {
            chartInstances.sentimentChart.destroy();
        }
        
        chartInstances.sentimentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Positive', 'Neutral', 'Negative'],
                datasets: [{
                    label: 'Sentiment Distribution',
                    data: [
                        Math.floor(Math.random() * 60) + 30, // Positive
                        Math.floor(Math.random() * 30) + 10, // Neutral
                        Math.floor(Math.random() * 50) + 20  // Negative
                    ],
                    backgroundColor: [
                        '#06d6a0',
                        '#ffd166',
                        '#ef476f'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading sentiment data:', error);
        throw error;
    }
}

// Load derivatives data
async function loadDerivativesData() {
    try {
        // Simulate fetching data from Coinglass API
        const ctx = document.getElementById('derivatives-chart').getContext('2d');
        
        if (chartInstances.derivativesChart) {
            chartInstances.derivativesChart.destroy();
        }
        
        // Generate sample data
        const exchanges = ['Binance', 'Bybit', 'OKX', 'Bitget', 'Deribit', 'BitMEX'];
        const data = exchanges.map(() => ({
            openInterest: Math.random() * 1000000 + 500000,
            fundingRate: (Math.random() * 0.05 - 0.025).toFixed(4)
        }));
        
        // Update metrics
        const totalOpenInterest = data.reduce((sum, d) => sum + d.openInterest, 0);
        const avgFundingRate = (data.reduce((sum, d) => sum + parseFloat(d.fundingRate), 0) / data.length).toFixed(4);
        document.getElementById('open-interest').textContent = `$${formatNumber(totalOpenInterest, 0)}`;
        document.getElementById('funding-rate').textContent = `${(avgFundingRate * 100).toFixed(3)}%`;
        
        chartInstances.derivativesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: exchanges,
                datasets: [{
                    label: 'Open Interest (USD)',
                    data: data.map(d => d.openInterest),
                    backgroundColor: '#3a86ff'
                }, {
                    label: 'Funding Rate (%)',
                    data: data.map(d => d.fundingRate * 100),
                    backgroundColor: '#8338ec',
                    type: 'line',
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Open Interest (USD)'
                        }
                    },
                    y1: {
                        position: 'right',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Funding Rate (%)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading derivatives data:', error);
        throw error;
    }
}

// Load macro data
async function loadMacroData(asset, period) {
    try {
        const ctx = document.getElementById('correlation-chart').getContext('2d');
        
        if (chartInstances.macroChart) {
            chartInstances.macroChart.destroy();
        }
        
        // Generate sample data
        const btcPrices = [];
        const assetPrices = [];
        
        for (let i = period; i >= 0; i--) {
            btcPrices.push({
                x: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
                y: 60000 + Math.random() * 10000 - 5000
            });
            
            if (asset === 'dxy') {
                assetPrices.push({
                    x: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
                    y: 100 + Math.random() * 10 - 5
                });
            } else if (asset === 'gold') {
                assetPrices.push({
                    x: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
                    y: 1800 + Math.random() * 200 - 100
                });
            } else {
                assetPrices.push({
                    x: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
                    y: 4500 + Math.random() * 1000 - 500
                });
            }
        }
        
        chartInstances.macroChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'BTC/USD',
                    data: btcPrices,
                    borderColor: '#3a86ff',
                    borderWidth: 2,
                    yAxisID: 'y'
                }, {
                    label: asset === 'dxy' ? 'DXY' : asset === 'gold' ? 'Gold (USD/oz)' : 'S&P 500',
                    data: assetPrices,
                    borderColor: '#ffd166',
                    borderWidth: 2,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: period <= 30 ? 'day' : 'week'
                        }
                    },
                    y: {
                        position: 'left',
                        title: {
                            display: true,
                            text: 'BTC Price (USD)'
                        }
                    },
                    y1: {
                        position: 'right',
                        title: {
                            display: true,
                            text: asset === 'dxy' ? 'DXY Index' : asset === 'gold' ? 'Gold Price (USD)' : 'S&P 500'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading macro data:', error);
        throw error;
    }
}

// Load blockchain data
async function loadBlockchainData() {
    try {
        // Simulate fetching data from Mempool.space API
        document.getElementById('block-height').textContent = formatNumber(Math.floor(Math.random() * 800000) + 800000, 0);
        document.getElementById('avg-fee').textContent = `${(Math.random() * 50 + 10).toFixed(0)} sat/vB`;
        
        // Create charts
        createMiniChart('hashrate-chart', 'Hash Rate', '#06d6a0');
        createMiniChart('tx-volume-chart', 'Transaction Volume', '#3a86ff');
        createMiniChart('mempool-chart', 'Mempool Size', '#8338ec');
    } catch (error) {
        console.error('Error loading blockchain data:', error);
        throw error;
    }
}

// Create mini chart for blockchain panel
function createMiniChart(canvasId, label, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }
    
    // Generate sample data
    const data = [];
    for (let i = 0; i < 30; i++) {
        data.push(Math.random() * 100 + 50);
    }
    
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(30).fill(''),
            datasets: [{
                label: label,
                data: data,
                borderColor: color,
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { display: false },
                y: { display: false }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Helper function to format large numbers
function formatNumber(num, decimals = 0) {
    if (num >= 1e12) {
        return (num / 1e12).toFixed(decimals) + 'T';
    } else if (num >= 1e9) {
        return (num / 1e9).toFixed(decimals) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(decimals) + 'M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(decimals) + 'K';
    }
    return num.toFixed(decimals);
}

// Generate sample chart data
function generateSampleChartData(timeframe) {
    const candles = [];
    const sma50 = [];
    const ema200 = [];
    
    let price = 60000;
    let smaSum = 0;
    let ema = price;
    const alpha = 2 / (200 + 1);
    
    // Determine number of data points based on timeframe
    let points;
    switch(timeframe) {
        case '1h': points = 24; break;
        case '4h': points = 42; break;
        case '1d': points = 30; break;
        case '1w': points = 26; break;
        case '1m': points = 30; break;
        default: points = 30;
    }
    
    const now = Date.now();
    const interval = timeframe === '1h' ? 3600000 : 
                     timeframe === '4h' ? 14400000 : 
                     timeframe === '1d' ? 86400000 : 
                     timeframe === '1w' ? 604800000 : 2592000000;
    
    for (let i = points; i >= 0; i--) {
        const open = price;
        const close = open * (1 + (Math.random() - 0.5) * 0.05);
        const high = Math.max(open, close) * (1 + Math.random() * 0.02);
        const low = Math.min(open, close) * (1 - Math.random() * 0.02);
        
        candles.push({
            x: new Date(now - i * interval),
            o: open,
            h: high,
            l: low,
            c: close
        });
        
        // Update SMA
        smaSum += close;
        if (i <= points - 50) {
            smaSum -= candles[candles.length - 51].c;
            sma50.push({
                x: new Date(now - i * interval),
                y: smaSum / 50
            });
        }
        
        // Update EMA
        ema = alpha * close + (1 - alpha) * ema;
        if (i <= points - 200) {
            ema200.push({
                x: new Date(now - i * interval),
                y: ema
            });
        }
        
        price = close;
    }
    
    return { candles, sma50, ema200 };
}

// Simulate orderbook data
function simulateOrderbookData(exchange) {
    const container = document.getElementById('orderbook-chart');
    
    // Clear previous simulation
    container.innerHTML = '';
    
    // Create orderbook elements
    const orderbook = document.createElement('div');
    orderbook.className = 'orderbook';
    
    // Create bids and asks sections
    const bids = document.createElement('div');
    bids.className = 'bids';
    const asks = document.createElement('div');
    asks.className = 'asks';
    
    // Generate sample bids and asks
    for (let i = 0; i < 10; i++) {
        const bidPrice = 60000 - i * 100;
        const bidAmount = Math.random() * 10 + 1;
        
        const bidRow = document.createElement('div');
        bidRow.className = 'orderbook-row';
        bidRow.innerHTML = `
            <div class="price">${bidPrice.toFixed(2)}</div>
            <div class="amount">${bidAmount.toFixed(4)}</div>
            <div class="bar" style="width: ${bidAmount * 5}%"></div>
        `;
        bids.appendChild(bidRow);
        
        const askPrice = 60000 + (i + 1) * 100;
        const askAmount = Math.random() * 10 + 1;
        
        const askRow = document.createElement('div');
        askRow.className = 'orderbook-row';
        askRow.innerHTML = `
            <div class="price">${askPrice.toFixed(2)}</div>
            <div class="amount">${askAmount.toFixed(4)}</div>
            <div class="bar" style="width: ${askAmount * 5}%"></div>
        `;
        asks.appendChild(askRow);
    }
    
    // Add spread
    const spread = document.createElement('div');
    spread.className = 'spread';
    spread.textContent = `Spread: 200.00 (${((200 / 60000) * 100).toFixed(2)}%)`;
    
    // Add current price
    const price = document.createElement('div');
    price.className = 'current-price';
    price.textContent = '60,000.00 USD';
    
    // Assemble orderbook
    orderbook.appendChild(asks);
    orderbook.appendChild(spread);
    orderbook.appendChild(price);
    orderbook.appendChild(bids);
    container.appendChild(orderbook);
    
    // Simulate live updates
    setInterval(() => {
        // Randomly update an order
        const rows = orderbook.querySelectorAll('.orderbook-row');
        if (rows.length > 0) {
            const randomRow = rows[Math.floor(Math.random() * rows.length)];
            const amountElement = randomRow.querySelector('.amount');
            const barElement = randomRow.querySelector('.bar');
            
            const currentAmount = parseFloat(amountElement.textContent);
            const newAmount = Math.max(0, currentAmount + (Math.random() - 0.5) * 0.5);
            
            amountElement.textContent = newAmount.toFixed(4);
            barElement.style.width = `${newAmount * 5}%`;
        }
    }, 1000);
}

// Add styles for orderbook simulation dynamically
const orderbookStyles = document.createElement('style');
orderbookStyles.textContent = `
.orderbook {
    display: flex;
    flex-direction: column;
    width: 100%;
    font-family: monospace;
    font-size: 14px;
}

.orderbook-header {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    background-color: var(--card-bg);
    font-weight: bold;
    border-bottom: 1px solid var(--border-color);
}

.asks, .bids {
    display: flex;
    flex-direction: column;
}

.orderbook-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 12px;
    position: relative;
    z-index: 1;
}

.orderbook-row .price {
    width: 100px;
    text-align: right;
}

.orderbook-row .amount {
    width: 100px;
    text-align: right;
}

.orderbook-row .bar {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    z-index: -1;
    opacity: 0.3;
}

.asks .orderbook-row .bar {
    background-color: #ef476f;
}

.bids .orderbook-row .bar {
    background-color: #06d6a0;
}

.spread {
    text-align: center;
    padding: 8px;
    background-color: var(--card-bg);
    font-weight: bold;
    border-top: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
}

.current-price {
    text-align: center;
    padding: 12px;
    font-size: 1.5rem;
    font-weight: bold;
    background-color: var(--card-bg);
}
`;

document.head.appendChild(orderbookStyles);