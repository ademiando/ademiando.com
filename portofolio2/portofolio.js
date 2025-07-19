// Portfolio Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi Chart.js
    const allocationCtx = document.getElementById('allocation-chart').getContext('2d');
    const profitCtx = document.getElementById('profit-chart').getContext('2d');
    
    let allocationChart, profitChart;
    
    // Konfigurasi API
    const sheetBestUrl = 'https://sheet.best/api/sheets/YOUR_SHEET_ID'; // Ganti dengan SheetBest URL Anda
    const coinGeckoApi = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd';
    
    // Data contoh
    const transactions = [
        { date: '2023-07-01', asset: 'BTC', type: 'buy', quantity: 0.5, price: 30000 },
        { date: '2023-07-05', asset: 'ETH', type: 'buy', quantity: 5, price: 1800 },
        { date: '2023-07-10', asset: 'GOTO', type: 'buy', quantity: 1000, price: 0.5 },
        { date: '2023-07-15', asset: 'NVDA', type: 'buy', quantity: 10, price: 450 }
    ];
    
    const assetPrices = {
        BTC: 31000,
        ETH: 1900,
        GOTO: 0.6,
        NVDA: 480
    };
    
    // Fungsi untuk mengambil data dari spreadsheet
    async function fetchDataFromSpreadsheet() {
        try {
            const response = await fetch(sheetBestUrl);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return transactions; // Fallback ke data contoh
        }
    }
    
    // Fungsi untuk menghitung nilai portofolio
    function calculatePortfolio(transactions) {
        // Kelompokkan aset
        const assets = {};
        transactions.forEach(transaction => {
            const { asset, type, quantity, price } = transaction;
            if (!assets[asset]) {
                assets[asset] = {
                    quantity: 0,
                    totalInvested: 0,
                    averagePrice: 0
                };
            }
            
            if (type === 'buy') {
                assets[asset].quantity += parseFloat(quantity);
                assets[asset].totalInvested += parseFloat(quantity) * parseFloat(price);
            } else if (type === 'sell') {
                assets[asset].quantity -= parseFloat(quantity);
                assets[asset].totalInvested -= parseFloat(quantity) * parseFloat(price);
            }
            
            assets[asset].averagePrice = assets[asset].totalInvested / assets[asset].quantity;
        });
        
        // Hitung total
        let totalInvested = 0;
        let currentValue = 0;
        
        Object.keys(assets).forEach(asset => {
            totalInvested += assets[asset].totalInvested;
            currentValue += assets[asset].quantity * (assetPrices[asset] || 0);
        });
        
        const profitLoss = currentValue - totalInvested;
        
        // Update ringkasan
        document.getElementById('total-invested').textContent = `$${totalInvested.toFixed(2)}`;
        document.getElementById('current-value').textContent = `$${currentValue.toFixed(2)}`;
        document.getElementById('profit-loss').textContent = `$${profitLoss.toFixed(2)}`;
        document.getElementById('profit-loss').style.color = profitLoss >= 0 ? '#10b981' : '#ef4444';
        
        // Update allocation chart
        updateAllocationChart(assets, currentValue);
        
        // Update profit chart
        updateProfitChart(profitLoss);
        
        return assets;
    }
    
    // Fungsi untuk update allocation chart
    function updateAllocationChart(assets, totalValue) {
        const labels = Object.keys(assets);
        const data = labels.map(asset => {
            const value = (assets[asset].quantity * (assetPrices[asset] || 0) / totalValue * 100;
            return value.toFixed(2);
        });
        
        if (allocationChart) allocationChart.destroy();
        
        allocationChart = new Chart(allocationCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e5e5e5'
                        }
                    }
                }
            }
        });
    }
    
    // Fungsi untuk update profit chart
    function updateProfitChart(profitLoss) {
        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'Profit/Loss',
                data: [-500, 800, 1200, 900, 1500, 1800, profitLoss],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.3,
                fill: true
            }]
        };
        
        if (profitChart) profitChart.destroy();
        
        profitChart = new Chart(profitCtx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#e5e5e5'
                        }
                    }
                }
            }
        });
    }
    
    // Fungsi untuk render tabel transaksi
    function renderTransactions(transactions) {
        const tbody = document.getElementById('transaction-table');
        tbody.innerHTML = '';
        
        transactions.slice(0, 10).forEach(transaction => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-dark-700';
            tr.innerHTML = `
                <td class="py-3 px-4">${transaction.date}</td>
                <td class="py-3 px-4">${transaction.asset}</td>
                <td class="py-3 px-4"><span class="${transaction.type === 'buy' ? 'text-green-500' : 'text-red-500'}">${transaction.type}</span></td>
                <td class="py-3 px-4">${transaction.quantity}</td>
                <td class="py-3 px-4">$${parseFloat(transaction.price).toFixed(2)}</td>
                <td class="py-3 px-4">$${(parseFloat(transaction.quantity) * parseFloat(transaction.price)).toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    // Event listener untuk filter
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            // Implement filter logic here
            // For now, we'll just refetch data
            initDashboard();
        });
    });
    
    // Inisialisasi dashboard
    async function initDashboard() {
        const transactions = await fetchDataFromSpreadsheet();
        renderTransactions(transactions);
        calculatePortfolio(transactions);
    }
    
    // Mulai dashboard
    initDashboard();
});