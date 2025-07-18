import { showLoader, hideLoader, formatNumber } from './utils.js';

export const initOrderbook = () => {
    showLoader('orderbook-loader');
    
    try {
        // Simulate WebSocket connection
        setTimeout(() => {
            generateOrderbookData();
            renderDepthChart();
            hideLoader('orderbook-loader');
        }, 1000);
    } catch (error) {
        console.error('Orderbook error:', error);
        showError('orderbook-panel', 'Failed to load order book');
        hideLoader('orderbook-loader');
    }
};

// Generate mock orderbook data
const generateOrderbookData = () => {
    const bidsList = document.getElementById('bids-list');
    const asksList = document.getElementById('asks-list');
    bidsList.innerHTML = '';
    asksList.innerHTML = '';
    
    // Generate bids
    let bidPrice = 64200;
    for (let i = 0; i < 15; i++) {
        const price = bidPrice - i * 10;
        const amount = (Math.random() * 5 + 1).toFixed(3);
        const total = (price * amount).toFixed(2);
        
        const row = document.createElement('div');
        row.className = 'order-row bid';
        row.innerHTML = `
            <span>${price.toFixed(2)}</span>
            <span>${amount}</span>
            <span>${total}</span>
        `;
        bidsList.appendChild(row);
    }
    
    // Generate asks
    let askPrice = 64220;
    for (let i = 0; i < 15; i++) {
        const price = askPrice + i * 10;
        const amount = (Math.random() * 5 + 1).toFixed(3);
        const total = (price * amount).toFixed(2);
        
        const row = document.createElement('div');
        row.className = 'order-row ask';
        row.innerHTML = `
            <span>${price.toFixed(2)}</span>
            <span>${amount}</span>
            <span>${total}</span>
        `;
        asksList.appendChild(row);
    }
    
    // Update spread
    document.getElementById('spread-value').textContent = (askPrice - bidPrice).toFixed(2);
};

// Render Depth Chart
const renderDepthChart = () => {
    const depthChart = document.getElementById('depth-chart');
    
    // In a real implementation, this would use D3.js
    depthChart.innerHTML = `
        <div class="depth-chart-info">
            <h3>Market Depth Visualization</h3>
            <p>Bid-ask spread: <strong>${document.getElementById('spread-value').textContent} USDT</strong></p>
            <div class="depth-chart-visual">
                <div class="bids-depth" style="width: 48%; height: 300px; background: linear-gradient(to top, rgba(16, 185, 129, 0.2), transparent);"></div>
                <div class="asks-depth" style="width: 48%; height: 300px; background: linear-gradient(to top, rgba(239, 68, 68, 0.2), transparent);"></div>
            </div>
            <p class="text-secondary">Visualization shows the cumulative order book depth</p>
        </div>
    `;
};