// Theme management
export const initTheme = () => {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    const themeIcon = document.querySelector('#theme-switch i');
    themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
};

export const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeIcon = document.querySelector('#theme-switch i');
    themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
};

// API helpers
export const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
};

// Format numbers
export const formatNumber = (num, decimals = 2) => {
    return num.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
};

// Show loading state
export const showLoader = (panelId) => {
    const loader = document.querySelector(`#${panelId} .loader`);
    if (loader) loader.style.display = 'flex';
};

// Hide loading state
export const hideLoader = (panelId) => {
    const loader = document.querySelector(`#${panelId} .loader`);
    if (loader) loader.style.display = 'none';
};

// Show error message
export const showError = (panelId, message) => {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `;
    
    panel.appendChild(errorEl);
};