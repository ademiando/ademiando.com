
// IIFE to encapsulate functionality
(() => {
    // DOM Elements
    const themeToggle = document.getElementById('theme-switch');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.panel');
    const loader = document.querySelector('.loader');
    
    // State
    let currentTheme = localStorage.getItem('theme') || 'light';
    let activeTab = 'chart';
    
    // Initialize Theme
    const initTheme = () => {
        document.documentElement.setAttribute('data-theme', currentTheme);
        themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
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
    
    // Data Loading Functions
    const loadTabData = (tab) => {
        switch(tab) {
            case 'chart':
                loadChartData();
                break;
            case 'orderbook':
                initOrderbook();
                break;
            case 'onchain':
                fetchOnChainData();
                break;
            // Additional cases for other tabs...
        }
    };
    
    // Chart Panel Implementation
    const loadChartData = async () => {
        const loader = document.querySelector('#chart-panel .loader');
        loader.style.display = 'block';
        
        try {
            const response = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=30');
            const data = await response.json();
            
            const ohlc = data.map(d => ({
                time: d[0],
                open: parseFloat(d[1]),
                high: parseFloat(d[2]),
                low: parseFloat(d[3]),
                close: parseFloat(d[4])
            }));
            
            renderCandlestickChart(ohlc);
        } catch (error) {
            console.error('Failed to fetch OHLC data:', error);
            showError('#chart-panel', 'Failed to load chart data');
        } finally {
            loader.style.display = 'none';
        }
    };
    
    const renderCandlestickChart = (data) => {
        const ctx = document.getElementById('ohlc-chart').getContext('2d');
        const dates = data.map(d => new Date(d.time).toLocaleDateString());
        
        new Chart(ctx, {
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
                        up: 'rgba(40, 167, 69, 1)',
                        down: 'rgba(220, 53, 69, 1)',
                        unchanged: 'rgba(108, 117, 125, 1)',
                    }
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    };
    
    // Orderbook Implementation
    const initOrderbook = () => {
        const depthChart = document.getElementById('depth-chart');
        const loader = document.querySelector('#orderbook-panel .loader');
        loader.style.display = 'block';
        
        // Mock WebSocket connection
        const socket = io.connect('wss://stream.binance.com:9443/ws');
        
        socket.on('connect', () => {
            socket.emit('subscribe', 'btcusdt@depth');
        });
        
        socket.on('depthUpdate', (data) => {
            renderDepthChart(data.bids, data.asks);
            loader.style.display = 'none';
        });
        
        socket.on('error', (err) => {
            console.error('WebSocket error:', err);
            showError('#orderbook-panel', 'Orderbook connection failed');
            loader.style.display = 'none';
        });
    };
    
    const renderDepthChart = (bids, asks) => {
        // D3.js implementation would go here
        document.getElementById('depth-chart').innerHTML = `
            <div class="text-center p-2">
                <h3>Order Book Depth</h3>
                <p>Bids: ${bids.length} | Asks: ${asks.length}</p>
                <p><em>D3.js visualization would render here</em></p>
            </div>
        `;
    };
    
    // Blockchain Panel Implementation
    const loadBlockchainData = async () => {
        try {
            const provider = new ethers.providers.JsonRpcProvider();
            const network = await provider.getNetwork();
            document.getElementById('node-stats').innerHTML = `
                <div class="card">
                    <h3>${network.name} Network</h3>
                    <p>Chain ID: ${network.chainId}</p>
                </div>
            `;
        } catch (error) {
            console.error('Blockchain error:', error);
            showError('#blockchain-panel', 'Failed to connect to blockchain');
        }
    };
    
    // Error Handling
    const showError = (containerSelector, message) => {
        const container = document.querySelector(containerSelector);
        const errorEl = document.createElement('div');
        errorEl.className = 'error';
        errorEl.innerHTML = `<p class="error-text">⚠️ ${message}</p>`;
        container.appendChild(errorEl);
    };
    
    // Event Listeners
    themeToggle.addEventListener('click', toggleTheme);
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            activeTab = button.dataset.tab;
            switchTab(activeTab);
        });
    });
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        switchTab('chart');
        loadBlockchainData();
    });
})();