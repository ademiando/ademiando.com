import { showLoader, hideLoader, formatNumber } from './utils.js';

export const loadBlockchainData = async () => {
    const loader = document.querySelector('#blockchain-panel .loader');
    if (loader) loader.style.display = 'flex';
    
    try {
        // Simulate API calls
        setTimeout(() => {
            // This would be replaced with actual API calls
            // For now we'll just update the UI with mock data
            if (loader) loader.style.display = 'none';
        }, 800);
    } catch (error) {
        console.error('Blockchain error:', error);
        showError('blockchain-panel', 'Failed to load blockchain data');
        if (loader) loader.style.display = 'none';
    }
};