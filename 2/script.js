// script.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeToggle = document.getElementById('theme-switch');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.panel');
    const timeButtons = document.querySelectorAll('.time-btn');
    
    // State
    let currentTheme = localStorage.getItem('theme') || 'dark';
    let activeTab = 'chart';
    let chartInstance = null;
    
    // Initialize Theme
    const initTheme = () => {
        document.documentElement.setAttribute('data-theme', currentTheme);
        themeToggle.innerHTML = currentTheme === 'dark' ? 
            '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    };
    
    // Toggle Theme
    const toggleTheme = () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', currentTheme);
        initTheme();
    };
    
    // Tab Switching
    const switchTab = (tabName) => {
        // Update UI
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
            btn.setAttribute('aria-selected', btn.dataset.tab === tabName);
        });
        
        // Show/hide panels
        panels.forEach(panel => {
            const isActive = panel.id === `${tabName}-panel`;
            panel.toggleAttribute('hidden', !isActive);
            if (isActive) panel.classList.add('active');
            else panel.classList.remove('active');
        });
        
        // Load data for new tab
        loadTabData(tabName);
    };
    
    // Load data for specific tab
    const loadTabData = (tab) => {
        switch(tab) {
            case 'chart':
                loadChartData('1h');
                break;
            case 'orderbook':
                initOrderbook();
                break;
            case 'sentiment':
                loadSentimentData();
                break;
            case 'blockchain':
                // Data is static in this example
                break;
            // Additional cases for other tabs...
        }
    };
    
    // Load Chart Data
    const loadChartData = (interval) => {
        const loader = document.querySelector('#chart-loader');
        loader.style.display = 'flex';
        
        // Simulate API call
        setTimeout(() => {
            // Generate mock data
            const data = generateMockChartData(interval);
            
            if (chartInstance) {
                chartInstance.destroy();
            }
            
            renderCandlestickChart(data);
            loader.style.display = 'none';
        }, 800);
    };
    
    // Generate mock chart data
    const generateMockChartData = (interval) => {
        const data = [];
        let basePrice = 64000;
        const points = interval === '1h' ? 24 : interval === '4h' ? 42 : 30;
        
        for (let i = 0; i < points; i++) {
            const open = basePrice;
            const close = open + (Math.random() - 0.5) * 1000;
            const high = Math.max(open, close) + Math.random() * 500;
            const low = Math.min(open, close) - Math.random() * 500;
            const time = Date.now() - (points - i) * (interval === '1h' ? 3600000 : 
                interval === '4h' ? 14400000 : 86400000);
            
            data.push({
                time,
                open,
                high,
                low,
                close
            });
            
            basePrice = close;
        }
        
        return data;
    };
    
    // Render Candlestick Chart
    const renderCandlestickChart = (data) => {
        const ctx = document.getElementById('ohlc-chart').getContext('2d');
        const dates = data.map(d => new Date(d.time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}));
        
        chartInstance = new Chart(ctx, {
            type: 'candlestick',
            data: {
                labels: dates,
                datasets: [{
                    label: 'BTC/USDT',
                    data: data.map(d => ({
                        x: d.time,
                        o: d.open,
                        h: d.high,
                        l: d.low,
                        c: d.close
                    })),
                    color: {
                        up: 'rgba(16, 185, 129, 1)',
                        down: 'rgba(239, 68, 68, 1)',
                        unchanged: 'rgba(156, 163, 175, 1)',
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(100, 116, 139, 0.1)'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(100, 116, 139, 0.1)'
                        }
                    }
                }
            }
        });
    };
    
    // Initialize Orderbook
    const initOrderbook = () => {
        const loader = document.querySelector('#orderbook-loader');
        loader.style.display = 'flex';
        
        // Simulate WebSocket connection
        setTimeout(() => {
            generateOrderbookData();
            renderDepthChart();
            loader.style.display = 'none';
        }, 1000);
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
            <div class="text-center" style="padding: 2rem;">
                <h3>Market Depth Visualization</h3>
                <p><em>D3.js depth chart would render here</em></p>
                <p class="text-secondary" style="margin-top: 1rem;">
                    This area would show the order book depth chart with bids and asks.
                </p>
            </div>
        `;
    };
    
    // Load Sentiment Data
    const loadSentimentData = () => {
        // Simulate API call to Fear & Greed Index
        setTimeout(() => {
            const value = Math.floor(Math.random() * 100);
            document.getElementById('gauge-value').textContent = value;
            document.getElementById('gauge-fill').style.width = `${value}%`;
            
            let sentimentText = '';
            if (value < 25) sentimentText = 'Extreme Fear';
            else if (value < 45) sentimentText = 'Fear';
            else if (value < 55) sentimentText = 'Neutral';
            else if (value < 75) sentimentText = 'Greed';
            else sentimentText = 'Extreme Greed';
            
            document.getElementById('sentiment-text').textContent = sentimentText;
        }, 600);
    };
    
    // Event Listeners
    themeToggle.addEventListener('click', toggleTheme);
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            activeTab = button.dataset.tab;
            switchTab(activeTab);
        });
    });
    
    timeButtons.forEach(button => {
        button.addEventListener('click', () => {
            timeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            loadChartData(button.textContent.toLowerCase());
        });
    });
    
    // Initialize
    initTheme();
    switchTab('chart');
    
    // Simulate live price updates
    setInterval(() => {
        const btcElement = document.getElementById('btc-price');
        const ethElement = document.getElementById('eth-price');
        
        const btcPrice = parseFloat(btcElement.textContent.replace('$', '').replace(',', ''));
        const ethPrice = parseFloat(ethElement.textContent.replace('$', '').replace(',', ''));
        
        const btcChange = (Math.random() - 0.5) * 100;
        const ethChange = (Math.random() - 0.5) * 80;
        
        const newBtcPrice = btcPrice + btcChange;
        const newEthPrice = ethPrice + ethChange;
        
        btcElement.textContent = `$${newBtcPrice.toFixed(2)}`;
        ethElement.textContent = `$${newEthPrice.toFixed(2)}`;
        
        // Update percentage indicators
        const btcPercent = (btcChange / btcPrice * 100).toFixed(1);
        const ethPercent = (ethChange / ethPrice * 100).toFixed(1);
        
        const btcPctElement = btcElement.parentElement.querySelector('.positive, .negative');
        const ethPctElement = ethElement.parentElement.querySelector('.positive, .negative');
        
        btcPctElement.textContent = `${btcChange >= 0 ? '+' : ''}${btcPercent}%`;
        ethPctElement.textContent = `${ethChange >= 0 ? '+' : ''}${ethPercent}%`;
        
        btcPctElement.className = btcChange >= 0 ? 'positive' : 'negative';
        ethPctElement.className = ethChange >= 0 ? 'positive' : 'negative';
    }, 5000);
});