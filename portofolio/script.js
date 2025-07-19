// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Mobile menu functionality
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const closeMenu = document.getElementById('closeMenu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            mobileOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeMenu) {
        closeMenu.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            if (mobileMenu) mobileMenu.classList.remove('active');
            if (mobileOverlay) mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Portfolio data from spreadsheet (mock implementation)
    const portfolioData = {
        totalBalance: "$243,819.47",
        allocation: {
            crypto: "58%",
            equity: "32%",
            stable: "10%"
        },
        roi: {
            volatility: "+14.2%",
            trend: "+11.5%",
            mean: "+7.8%"
        },
        assets: [
            { name: "Bitcoin", percentage: "28.7%", value: "$69,981.23", change: "+19.3%", icon: "bitcoin", color: "bg-yellow-500" },
            { name: "Ethereum", percentage: "16.3%", value: "$39,742.59", change: "+12.7%", icon: "diamond", color: "bg-purple-500" },
            { name: "Tech ETF", percentage: "18.5%", value: "$45,126.78", change: "+9.1%", icon: "line-chart", color: "bg-blue-500" },
            { name: "Stable Assets", percentage: "10.2%", value: "$24,881.45", change: "+0.4%", icon: "dollar-sign", color: "bg-green-500" },
            { name: "Real Estate", percentage: "14.2%", value: "$34,638.12", change: "+5.3%", icon: "building-2", color: "bg-red-500" },
            { name: "Altcoins", percentage: "12.1%", value: "$29,449.30", change: "+27.6%", icon: "coins", color: "bg-orange-500" }
        ]
    };
    
    // Function to update portfolio data
    function updatePortfolioData() {
        // Update total balance
        const totalBalanceEl = document.querySelector('#portfolio .text-2xl');
        if (totalBalanceEl) totalBalanceEl.textContent = portfolioData.totalBalance;
        
        // Update allocation
        const allocationEls = document.querySelectorAll('#portfolio .flex.justify-between');
        if (allocationEls.length >= 3) {
            allocationEls[0].querySelector('span:last-child').textContent = portfolioData.allocation.crypto;
            allocationEls[1].querySelector('span:last-child').textContent = portfolioData.allocation.equity;
            allocationEls[2].querySelector('span:last-child').textContent = portfolioData.allocation.stable;
        }
        
        // Update ROI
        const roiEls = document.querySelectorAll('#portfolio .flex.justify-between.mb-1');
        if (roiEls.length >= 3) {
            roiEls[0].querySelector('span:last-child').textContent = portfolioData.roi.volatility;
            roiEls[1].querySelector('span:last-child').textContent = portfolioData.roi.trend;
            roiEls[2].querySelector('span:last-child').textContent = portfolioData.roi.mean;
        }
        
        // Update assets
        const assetCards = document.querySelectorAll('.portfolio-grid .card');
        portfolioData.assets.forEach((asset, index) => {
            if (assetCards[index]) {
                const iconEl = assetCards[index].querySelector('.w-10.h-10');
                const nameEl = assetCards[index].querySelector('.flex.items-center > span');
                const changeEl = assetCards[index].querySelector('.flex.justify-between > span:last-child');
                const percentageEl = assetCards[index].querySelector('.text-sm > span:first-child');
                const valueEl = assetCards[index].querySelector('.text-sm > span:last-child');
                
                if (iconEl) {
                    iconEl.className = `${asset.color} w-10 h-10 rounded-lg flex items-center justify-center mr-3`;
                    const icon = document.createElement('i');
                    icon.setAttribute('data-lucide', asset.icon);
                    icon.className = "text-white";
                    iconEl.innerHTML = '';
                    iconEl.appendChild(icon);
                }
                
                if (nameEl) nameEl.textContent = asset.name;
                if (changeEl) {
                    changeEl.textContent = asset.change;
                    changeEl.className = asset.change.startsWith('+') ? 'text-green-500' : 'text-red-500';
                }
                if (percentageEl) percentageEl.textContent = asset.percentage + " Portfolio";
                if (valueEl) valueEl.textContent = asset.value;
            }
        });
        
        // Reinitialize icons after updating
        lucide.createIcons();
    }
    
    // Initialize portfolio data
    updatePortfolioData();
    
    // Function to simulate data sync from spreadsheet
    document.querySelector('.portfolio-grid').addEventListener('click', function(e) {
        if (e.target.closest('.portfolio-grid .card')) {
            const card = e.target.closest('.card');
            card.classList.add('animate-pulse');
            setTimeout(() => {
                card.classList.remove('animate-pulse');
            }, 1000);
        }
    });
});