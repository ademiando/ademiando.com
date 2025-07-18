import { showLoader, hideLoader } from './utils.js';

export const loadSentimentData = () => {
    const loader = document.querySelector('#sentiment-panel .loader');
    if (loader) loader.style.display = 'flex';
    
    // Simulate API call to Fear & Greed Index
    setTimeout(() => {
        const value = Math.floor(Math.random() * 100);
        document.getElementById('gauge-value').textContent = value;
        document.getElementById('gauge-fill').style.width = `${value}%`;
        
        let sentimentText = '';
        let sentimentClass = '';
        if (value < 25) {
            sentimentText = 'Extreme Fear';
            sentimentClass = 'negative';
        } else if (value < 45) {
            sentimentText = 'Fear';
            sentimentClass = 'negative';
        } else if (value < 55) {
            sentimentText = 'Neutral';
            sentimentClass = '';
        } else if (value < 75) {
            sentimentText = 'Greed';
            sentimentClass = 'positive';
        } else {
            sentimentText = 'Extreme Greed';
            sentimentClass = 'positive';
        }
        
        document.getElementById('sentiment-text').textContent = sentimentText;
        document.getElementById('sentiment-text').className = `sentiment-status ${sentimentClass}`;
        
        if (loader) loader.style.display = 'none';
    }, 600);
};