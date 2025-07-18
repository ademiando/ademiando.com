import { initTheme, toggleTheme } from './utils.js';
import { initChart, loadChartData } from './chart.js';
import { initOrderbook } from './orderbook.js';
import { loadSentimentData } from './sentiment.js';
import { loadBlockchainData } from './blockchain.js';
import { loadDerivativesData } from './derivatives.js';

// DOM Elements
const themeToggle = document.getElementById('theme-switch');
const tabButtons = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.panel');
const timeButtons = document.querySelectorAll('.time-btn');

// State
let activeTab = 'chart';

// Initialize application
const initApp = () => {
    // Set up theme
    initTheme();
    
    // Set up event listeners
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
            
            if (activeTab === 'chart') {
                loadChartData(button.textContent.toLowerCase());
            }
        });
    });
    
    // Initialize modules
    initChart();
    initOrderbook();
    
    // Load initial data
    switchTab('chart');
    loadSentimentData();
    loadBlockchainData();
    loadDerivativesData();
    
    // Simulate live price updates
    setInterval(updateLivePrices, 5000);
};

// Tab Switching
const switchTab = (tabName) => {
    // Update UI
    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Show/hide panels
    panels.forEach(panel => {
        const isActive = panel.id === `${tabName}-panel`;
        panel.toggleAttribute('hidden', !isActive);
        if (isActive) panel.classList.add('active');
        else panel.classList.remove('active');
    });
    
    // Load data for new tab
    switch(tabName) {
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
            loadBlockchainData();
            break;
        case 'derivatives':
            loadDerivativesData();
            break;
    }
};

// Simulate live price updates
const updateLivePrices = () => {
    const btcElement = document.getElementById('btc-price');
    const ethElement = document.getElementById('eth-price');
    const dxyElement = document.getElementById('dxy-price');
    
    const btcPrice = parseFloat(btcElement.textContent.replace('$', '').replace(',', ''));
    const ethPrice = parseFloat(ethElement.textContent.replace('$', '').replace(',', ''));
    const dxyPrice = parseFloat(dxyElement.textContent);
    
    const btcChange = (Math.random() - 0.5) * 100;
    const ethChange = (Math.random() - 0.5) * 80;
    const dxyChange = (Math.random() - 0.5) * 0.5;
    
    const newBtcPrice = btcPrice + btcChange;
    const newEthPrice = ethPrice + ethChange;
    const newDxyPrice = dxyPrice + dxyChange;
    
    btcElement.textContent = `$${newBtcPrice.toFixed(2)}`;
    ethElement.textContent = `$${newEthPrice.toFixed(2)}`;
    dxyElement.textContent = newDxyPrice.toFixed(2);
    
    // Update percentage indicators
    const btcPercent = (btcChange / btcPrice * 100).toFixed(1);
    const ethPercent = (ethChange / ethPrice * 100).toFixed(1);
    const dxyPercent = (dxyChange / dxyPrice * 100).toFixed(1);
    
    const btcPctElement = btcElement.parentElement.querySelector('.positive, .negative');
    const ethPctElement = ethElement.parentElement.querySelector('.positive, .negative');
    const dxyPctElement = dxyElement.parentElement.querySelector('.positive, .negative');
    
    btcPctElement.textContent = `${btcChange >= 0 ? '+' : ''}${btcPercent}%`;
    ethPctElement.textContent = `${ethChange >= 0 ? '+' : ''}${ethPercent}%`;
    dxyPctElement.textContent = `${dxyChange >= 0 ? '+' : ''}${dxyPercent}%`;
    
    btcPctElement.className = btcChange >= 0 ? 'positive' : 'negative';
    ethPctElement.className = ethChange >= 0 ? 'positive' : 'negative';
    dxyPctElement.className = dxyChange >= 0 ? 'positive' : 'negative';
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);