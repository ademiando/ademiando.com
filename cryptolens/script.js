        const coinSelect = document.getElementById('coin-select');
        const btcPriceElement = document.getElementById('btc-price');
        const priceChangeElement = document.getElementById('price-change');
        const marketCapElement = document.getElementById('market-cap');
        const volume24hElement = document.getElementById('volume-24h');
        const dominanceElement = document.getElementById('dominance');
        const fearGreedValue = document.getElementById('fear-greed-value');
        const fearGreedLabel = document.getElementById('fear-greed-label');
        const sentimentDescription = document.getElementById('sentiment-description');
        const whaleActivity = document.getElementById('whale-activity');
        const chartActions = document.querySelectorAll('.chart-actions .btn');
        
        // Load TradingView widget
        function loadTradingView(coin, interval = 'D') {
            // Clear previous chart
            const chartContainer = document.getElementById('tv-chart');
            chartContainer.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Loading TradingView chart...</p></div>';
            
            // Create script element
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/tv.js';
            script.onload = () => {
                new TradingView.widget({
                    "width": "100%",
                    "height": "400",
                    "symbol": `BINANCE:${coin}USDT`,
                    "interval": interval,
                    "timezone": "Etc/UTC",
                    "theme": "dark",
                    "style": "1",
                    "locale": "en",
                    "toolbar_bg": "#1e222d",
                    "enable_publishing": false,
                    "hide_top_toolbar": false,
                    "hide_legend": false,
                    "container_id": "tv-chart"
                });
            };
            document.body.appendChild(script);
        }
        
        // Fetch Bitcoin price data from CoinGecko
        async function fetchBitcoinPrice() {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
                const data = await response.json();
                
                if (data.bitcoin) {
                    const price = data.bitcoin.usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
                    const change = data.bitcoin.usd_24h_change.toFixed(2);
                    
                    btcPriceElement.textContent = price;
                    
                    if (change >= 0) {
                        priceChangeElement.textContent = `+${change}%`;
                        priceChangeElement.className = 'price-change price-up';
                    } else {
                        priceChangeElement.textContent = `${change}%`;
                        priceChangeElement.className = 'price-change price-down';
                    }
                }
            } catch (error) {
                console.error('Error fetching Bitcoin price:', error);
                btcPriceElement.textContent = 'Error';
                priceChangeElement.textContent = 'Error';
            }
        }
        
        // Fetch market data from CoinGecko
        async function fetchMarketData() {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/global');
                const data = await response.json();
                const globalData = data.data;
                
                marketCapElement.textContent = `$${globalData.total_market_cap.usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
                volume24hElement.textContent = `$${globalData.total_volume.usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
                dominanceElement.textContent = `${globalData.market_cap_percentage.btc.toFixed(1)}%`;
            } catch (error) {
                console.error('Error fetching market data:', error);
                marketCapElement.textContent = 'Error';
                volume24hElement.textContent = 'Error';
                dominanceElement.textContent = 'Error';
            }
        }
        
        // Fetch Fear and Greed Index
        async function fetchFearGreedIndex() {
            try {
                const response = await fetch('https://api.alternative.me/fng/?limit=1');
                const data = await response.json();
                
                if (data.data && data.data.length > 0) {
                    const value = parseInt(data.data[0].value);
                    const classification = data.data[0].value_classification;
                    
                    fearGreedValue.textContent = value;
                    fearGreedLabel.textContent = classification;
                    
                    // Update gauge
                    const gaugeCircle = document.querySelector('.gauge-value');
                    const maxValue = 534; // Circumference value for 100%
                    const offset = maxValue - (maxValue * value / 100);
                    gaugeCircle.style.strokeDashoffset = offset;
                    
                    // Update colors and description
                    if (value < 25) {
                        fearGreedLabel.style.color = '#ff1744';
                        sentimentDescription.textContent = 'Extreme fear can indicate a buying opportunity as markets may be oversold.';
                    } else if (value < 45) {
                        fearGreedLabel.style.color = '#ff7043';
                        sentimentDescription.textContent = 'Fear suggests investors are worried, which could mean the market is bottoming.';
                    } else if (value < 55) {
                        fearGreedLabel.style.color = '#ffab00';
                        sentimentDescription.textContent = 'Neutral sentiment indicates a balanced market between fear and greed.';
                    } else if (value < 75) {
                        fearGreedLabel.style.color = '#00c853';
                        sentimentDescription.textContent = 'Greed shows investors are becoming optimistic, which may signal caution.';
                    } else {
                        fearGreedLabel.style.color = '#00c853';
                        sentimentDescription.textContent = 'Extreme greed often precedes market corrections due to over-optimism.';
                    }
                }
            } catch (error) {
                console.error('Error fetching Fear and Greed Index:', error);
                fearGreedValue.textContent = 'Error';
                fearGreedLabel.textContent = 'Error';
                sentimentDescription.textContent = 'Failed to fetch sentiment data.';
            }
        }
        
        // Fetch whale alerts (simulated as Whale Alert requires API key)
        async function fetchWhaleAlerts() {
            try {
                // Clear loading state
                whaleActivity.innerHTML = '';
                
                // Simulated whale alerts
                const alerts = [
                    { type: 'buy', amount: 1250, value: 79.8, exchange: 'Binance', time: '10 minutes ago' },
                    { type: 'transfer', amount: 845, value: 54, destination: 'Cold wallet', time: '42 minutes ago' },
                    { type: 'sell', amount: 720, value: 46, exchange: 'Coinbase', time: '2 hours ago' }
                ];
                
                alerts.forEach(alert => {
                    const activityItem = document.createElement('div');
                    activityItem.className = 'activity-item';
                    
                    let icon, text;
                    if (alert.type === 'buy') {
                        icon = '<i class="fas fa-arrow-up"></i>';
                        text = `${alert.amount} BTC ($${alert.value}M) bought`;
                    } else if (alert.type === 'sell') {
                        icon = '<i class="fas fa-arrow-down"></i>';
                        text = `${alert.amount} BTC ($${alert.value}M) sold`;
                    } else {
                        icon = '<i class="fas fa-exchange-alt"></i>';
                        text = `${alert.amount} BTC ($${alert.value}M) transferred`;
                    }
                    
                    activityItem.innerHTML = `
                        <div class="activity-icon">${icon}</div>
                        <div class="activity-details">
                            <div class="activity-amount">${text}</div>
                            <div class="activity-time">${alert.time} · ${alert.exchange || alert.destination}</div>
                        </div>
                    `;
                    
                    whaleActivity.appendChild(activityItem);
                });
                
            } catch (error) {
                console.error('Error fetching whale alerts:', error);
                whaleActivity.innerHTML = '<div class="activity-item"><div class="activity-details">Failed to load whale alerts</div></div>';
            }
        }
        
        // Fetch altseason metrics
        async function fetchAltseasonMetrics() {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/global');
                const data = await response.json();
                const globalData = data.data;
                
                // BTC Dominance
                const dominance = globalData.market_cap_percentage.btc.toFixed(1);
                document.getElementById('btc-dominance').textContent = `${dominance}%`;
                
                // ETH/BTC ratio
                const ethBtcResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin&vs_currencies=usd');
                const ethBtcData = await ethBtcResponse.json();
                const ethPrice = ethBtcData.ethereum.usd;
                const btcPrice = ethBtcData.bitcoin.usd;
                const ethBtcRatio = (ethPrice / btcPrice).toFixed(4);
                document.getElementById('eth-btc').textContent = ethBtcRatio;
                
                // Altcoin Index (simulated)
                document.getElementById('altcoin-index').textContent = '42.5';
                
                // Market Sentiment
                document.getElementById('altseason-sentiment').textContent = 'Bullish';
                
            } catch (error) {
                console.error('Error fetching altseason metrics:', error);
                // Handle errors
            }
        }
        
        // Initialize dashboard
        async function initDashboard() {
            // Load initial TradingView chart
            loadTradingView('BTC');
            
            // Fetch all data
            await fetchBitcoinPrice();
            await fetchMarketData();
            await fetchFearGreedIndex();
            await fetchWhaleAlerts();
            await fetchAltseasonMetrics();
            
            // Set up event listeners
            coinSelect.addEventListener('change', () => {
                loadTradingView(coinSelect.value);
            });
            
            // Chart interval buttons
            chartActions.forEach(button => {
                button.addEventListener('click', () => {
                    // Remove active class from all buttons
                    chartActions.forEach(btn => btn.classList.remove('active'));
                    
                    // Add active class to clicked button
                    button.classList.add('active');
                    
                    // Reload chart with new interval
                    const interval = button.getAttribute('data-interval');
                    loadTradingView(coinSelect.value, interval);
                });
            });
            
            // Refresh sentiment button
            document.getElementById('refresh-sentiment').addEventListener('click', fetchFearGreedIndex);
        }
        
        // Start the dashboard
        document.addEventListener('DOMContentLoaded', initDashboard);
        
        // Refresh data every 60 seconds
        setInterval(() => {
            fetchBitcoinPrice();
            fetchMarketData();
            fetchFearGreedIndex();
            // Note: Other data might not need to refresh as frequently
        }, 60000);