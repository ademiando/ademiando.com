import { showLoader, hideLoader, formatNumber } from './utils.js';

let chart = null;
const chartContainer = document.getElementById('tradingview-chart');
const loader = document.getElementById('chart-loader');

export const initChart = () => {
    // Create chart if it doesn't exist
    if (!chart) {
        chart = LightweightCharts.createChart(chartContainer, {
            width: chartContainer.clientWidth,
            height: chartContainer.clientHeight,
            layout: {
                backgroundColor: 'transparent',
                textColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#94a3b8' : '#64748b',
            },
            grid: {
                vertLines: {
                    color: 'rgba(100, 116, 139, 0.1)',
                },
                horzLines: {
                    color: 'rgba(100, 116, 139, 0.1)',
                },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
            },
        });
        
        // Add candlestick series
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#10b981',
            downColor: '#ef4444',
            borderDownColor: '#ef4444',
            borderUpColor: '#10b981',
            wickDownColor: '#ef4444',
            wickUpColor: '#10b981',
        });
        
        // Resize chart on window resize
        window.addEventListener('resize', () => {
            chart.applyOptions({
                width: chartContainer.clientWidth,
                height: chartContainer.clientHeight
            });
        });
    }
};

export const loadChartData = async (interval = '1h') => {
    showLoader('chart-loader');
    
    try {
        // Simulate API call
        const data = await generateMockChartData(interval);
        
        // Get the candlestick series
        const candlestickSeries = chart.addCandlestickSeries();
        
        // Set the data
        candlestickSeries.setData(data);
        
        // Add volume if needed
        // const volumeSeries = chart.addHistogramSeries({...});
        // volumeSeries.setData(volumeData);
        
    } catch (error) {
        console.error('Chart error:', error);
        showError('chart-panel', 'Failed to load chart data');
    } finally {
        hideLoader('chart-loader');
    }
};

// Generate mock chart data
const generateMockChartData = async (interval) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const data = [];
    let basePrice = 64000;
    const points = interval === '1h' ? 24 : interval === '4h' ? 42 : 30;
    const timeUnit = interval === '1h' ? 3600000 : interval === '4h' ? 14400000 : 86400000;
    
    for (let i = 0; i < points; i++) {
        const open = basePrice;
        const close = open + (Math.random() - 0.5) * 1000;
        const high = Math.max(open, close) + Math.random() * 500;
        const low = Math.min(open, close) - Math.random() * 500;
        const time = Date.now() - (points - i) * timeUnit;
        
        data.push({
            time: time / 1000, // TradingView uses seconds
            open,
            high,
            low,
            close
        });
        
        basePrice = close;
    }
    
    return data;
};