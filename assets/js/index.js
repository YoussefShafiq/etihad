// Gold Chart
function initializeGoldChart() {
    console.log('Initializing gold chart...');
    const ctx = document.getElementById('goldChart');

    // Check if canvas element exists
    if (!ctx) {
        console.error('❌ Canvas element with id "goldChart" not found');
        return null;
    }

    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js is not loaded. Please include Chart.js library.');
        return null;
    }

    console.log('✅ Chart.js is available, creating chart...');

    try {
        const goldChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['', '', '', '', '', '', '', '', ''],
                datasets: [{
                    data: [70, 50, 60, 40, 45, 30, 35, 25, 30],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.3)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointBackgroundColor: '#f59e0b',
                    pointBorderColor: '#1a1424',
                    pointBorderWidth: 4,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });

        console.log('✅ Gold chart initialized successfully');
        return goldChart;
    } catch (error) {
        console.error('❌ Error creating chart:', error);
        return null;
    }
}

// Gold Calculator
function initializeGoldCalculator() {
    console.log('Initializing gold calculator...');

    let selectedPrice = 3500;

    const caratChips = document.querySelectorAll('.carat-chip');
    const weightInput = document.getElementById('weightInput');

    if (caratChips.length === 0) {
        console.error('❌ No carat chips found');
        return;
    }

    if (!weightInput) {
        console.error('❌ Weight input not found');
        return;
    }

    caratChips.forEach(chip => {
        chip.addEventListener('click', function () {
            document.querySelectorAll('.carat-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            selectedPrice = parseFloat(this.dataset.price);
            console.log(`Selected carat price: ${selectedPrice}`);
            calculatePrice(selectedPrice);
        });
    });

    weightInput.addEventListener('input', () => {
        calculatePrice(selectedPrice);
    });

    function calculatePrice(price) {
        const weight = parseFloat(weightInput.value) || 0;
        const total = (weight * price).toFixed(2);
        const totalPriceElement = document.getElementById('totalPrice');

        if (totalPriceElement) {
            totalPriceElement.textContent = `${total} ج.م`;
        }
    }

    // Initialize with default price
    calculatePrice(selectedPrice);
    console.log('✅ Gold calculator initialized successfully');
}

// Tab Switching
function initializeTabs() {
    console.log('Initializing tabs...');

    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabs.length === 0) {
        console.error('❌ No tabs found');
        return;
    }

    if (tabContents.length === 0) {
        console.error('❌ No tab contents found');
        return;
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            const tabContent = document.getElementById(`${tabId}-tab`);

            if (tabContent) {
                tabContent.classList.add('active');
                console.log(`✅ Switched to ${tabId} tab`);
            } else {
                console.error(`❌ Tab content with id ${tabId}-tab not found`);
            }
        });
    });

    console.log('✅ Tabs initialized successfully');
}

// Fetch Gold Prices (with multiple API fallbacks)
async function fetchGoldPrices() {
    console.log('Fetching gold prices...');

    let goldPrice = null;

    // Try first API
    try {
        console.log('Trying metals.dev API...');
        const response = await fetch('https://api.metals.dev/v1/latest', {
            headers: {
                'Accept': 'application/json',
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.metals && data.metals.gold) {
                goldPrice = data.metals.gold * 31.10; // Convert from troy ounce to grams
                console.log(`✅ Gold price from metals.dev: $${data.metals.gold}/oz -> ${goldPrice.toFixed(2)} EGP/g`);
            }
        }
    } catch (error) {
        console.log('❌ Metals.dev API failed, trying fallback...');
    }

    // If first API failed, try a different approach with free financial APIs
    if (!goldPrice) {
        try {
            console.log('Trying exchangerate.host API...');
            const response = await fetch('https://api.exchangerate.host/latest?base=USD');
            const data = await response.json();

            if (data.rates) {
                // Use a fixed gold price in USD per ounce and convert
                const goldPriceUSDPerOunce = 1950; // Approximate current price
                const usdToEgp = data.rates.EGP || 30.9; // Fallback rate
                const gramsPerOunce = 31.10;

                goldPrice = (goldPriceUSDPerOunce * usdToEgp) / gramsPerOunce;
                console.log(`✅ Gold price calculated from exchange rates: ${goldPrice.toFixed(2)} EGP/g`);
            }
        } catch (error) {
            console.log('❌ Fallback API also failed, using static prices');
        }
    }

    // Update UI with fetched or fallback prices
    updateGoldPrices(goldPrice);
}

function updateGoldPrices(goldPrice) {
    console.log('Updating gold prices display...');

    if (goldPrice) {
        // Calculate prices for different carats
        const price24 = goldPrice;
        const price21 = goldPrice * 0.875; // 24k * 21/24
        const price18 = goldPrice * 0.75;  // 24k * 18/24
        const price14 = goldPrice * 0.583; // 24k * 14/24

        // Update display
        updateElementText('gold-24', `${price24.toFixed(2)} ج.م`);
        updateElementText('gold-21', `${price21.toFixed(2)} ج.م`);
        updateElementText('gold-18', `${price18.toFixed(2)} ج.م`);
        updateElementText('gold-14', `${price14.toFixed(2)} ج.م`);

        // Update calculator chips
        document.querySelectorAll('.carat-chip').forEach(chip => {
            if (chip.dataset.carat === '24') {
                chip.dataset.price = price24.toFixed(2);
            } else if (chip.dataset.carat === '21') {
                chip.dataset.price = price21.toFixed(2);
            } else if (chip.dataset.carat === '18') {
                chip.dataset.price = price18.toFixed(2);
            } else if (chip.dataset.carat === '14') {
                chip.dataset.price = price14.toFixed(2);
            }
        });

        // Update timestamp if element exists
        const now = new Date();
        updateElementText('gold-update-time', now.toLocaleTimeString('ar-EG'));

        console.log('✅ Gold prices updated successfully with live data');
    } else {
        // Fallback to static prices if all APIs fail
        console.log('Using fallback gold prices');
        updateElementText('gold-24', '3500 ج.م');
        updateElementText('gold-21', '3062 ج.م');
        updateElementText('gold-18', '2625 ج.م');
        updateElementText('gold-14', '2038 ج.م');

        // Update calculator chips with fallback prices
        document.querySelectorAll('.carat-chip').forEach(chip => {
            if (chip.dataset.carat === '24') {
                chip.dataset.price = '3500';
            } else if (chip.dataset.carat === '21') {
                chip.dataset.price = '3062';
            } else if (chip.dataset.carat === '18') {
                chip.dataset.price = '2625';
            } else if (chip.dataset.carat === '14') {
                chip.dataset.price = '2038';
            }
        });

        // Update timestamp if element exists
        const now = new Date();
        updateElementText('gold-update-time', now.toLocaleTimeString('ar-EG') + ' (تقديري)');
    }
}

// Fetch Currency Rates (using a free API)
async function fetchCurrencyRates() {
    console.log('Fetching currency rates...');

    try {
        // Using a free currency API
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/EGP');
        if (!response.ok) {
            throw new Error('API response not ok');
        }

        const data = await response.json();

        // Update currency rates
        if (data && data.rates) {
            updateElementText('usd-rate', `${(1 / data.rates.USD).toFixed(2)} ج.م`);
            updateElementText('eur-rate', `${(1 / data.rates.EUR).toFixed(2)} ج.م`);
            updateElementText('gbp-rate', `${(1 / data.rates.GBP).toFixed(2)} ج.م`);
            updateElementText('sar-rate', `${(1 / data.rates.SAR).toFixed(2)} ج.م`);
            updateElementText('aed-rate', `${(1 / data.rates.AED).toFixed(2)} ج.م`);
            updateElementText('kwd-rate', `${(1 / data.rates.KWD).toFixed(2)} ج.م`);

            // Update timestamp
            const now = new Date();
            updateElementText('currencies-update-time', now.toLocaleTimeString('ar-EG'));

            console.log('✅ Currency rates updated successfully');
        }
    } catch (error) {
        console.error('❌ Error fetching currency rates:', error);
        // Fallback to static rates if API fails
        updateElementText('usd-rate', '30.90 ج.م');
        updateElementText('eur-rate', '33.50 ج.م');
        updateElementText('gbp-rate', '39.20 ج.م');
        updateElementText('sar-rate', '8.24 ج.م');
        updateElementText('aed-rate', '8.41 ج.م');
        updateElementText('kwd-rate', '100.50 ج.م');

        const now = new Date();
        updateElementText('currencies-update-time', now.toLocaleTimeString('ar-EG') + ' (تقديري)');

        console.log('✅ Currency rates updated with fallback data');
    }
}

// Fetch Crypto Prices (using a free API)
async function fetchCryptoPrices() {
    console.log('Fetching crypto prices...');

    try {
        // Using CoinGecko API (free tier)
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,litecoin&vs_currencies=usd&include_24hr_change=true');

        if (!response.ok) {
            throw new Error('API response not ok');
        }

        const data = await response.json();

        // Update crypto prices
        if (data) {
            // Bitcoin
            if (data.bitcoin) {
                updateElementText('btc-price', `$${data.bitcoin.usd.toLocaleString()}`);
                const change = data.bitcoin.usd_24h_change?.toFixed(2) || '0.00';
                updateElementText('btc-change', `${change}%`);
                updateElementClass('btc-change', `crypto-change ${change >= 0 ? 'positive' : 'negative'}`);
            }

            // Ethereum
            if (data.ethereum) {
                updateElementText('eth-price', `$${data.ethereum.usd.toLocaleString()}`);
                const change = data.ethereum.usd_24h_change?.toFixed(2) || '0.00';
                updateElementText('eth-change', `${change}%`);
                updateElementClass('eth-change', `crypto-change ${change >= 0 ? 'positive' : 'negative'}`);
            }

            // Ripple (XRP)
            if (data.ripple) {
                updateElementText('xrp-price', `$${data.ripple.usd.toLocaleString()}`);
                const change = data.ripple.usd_24h_change?.toFixed(2) || '0.00';
                updateElementText('xrp-change', `${change}%`);
                updateElementClass('xrp-change', `crypto-change ${change >= 0 ? 'positive' : 'negative'}`);
            }

            // Litecoin
            if (data.litecoin) {
                updateElementText('ltc-price', `$${data.litecoin.usd.toLocaleString()}`);
                const change = data.litecoin.usd_24h_change?.toFixed(2) || '0.00';
                updateElementText('ltc-change', `${change}%`);
                updateElementClass('ltc-change', `crypto-change ${change >= 0 ? 'positive' : 'negative'}`);
            }

            // Update timestamp
            const now = new Date();
            updateElementText('crypto-update-time', now.toLocaleTimeString('ar-EG'));

            console.log('✅ Crypto prices updated successfully');
        }
    } catch (error) {
        console.error('❌ Error fetching crypto prices:', error);
        // Fallback to static prices if API fails
        updateElementText('btc-price', '$45,200');
        updateElementText('btc-change', '+2.5%');
        updateElementClass('btc-change', 'crypto-change positive');

        updateElementText('eth-price', '$3,200');
        updateElementText('eth-change', '+1.8%');
        updateElementClass('eth-change', 'crypto-change positive');

        updateElementText('xrp-price', '$0.62');
        updateElementText('xrp-change', '-0.5%');
        updateElementClass('xrp-change', 'crypto-change negative');

        updateElementText('ltc-price', '$72.50');
        updateElementText('ltc-change', '+0.3%');
        updateElementClass('ltc-change', 'crypto-change positive');

        const now = new Date();
        updateElementText('crypto-update-time', now.toLocaleTimeString('ar-EG') + ' (تقديري)');

        console.log('✅ Crypto prices updated with fallback data');
    }
}

// Helper functions
function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    } else {
        console.warn(`⚠️ Element with id ${elementId} not found`);
    }
}

function updateElementClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) {
        element.className = className;
    } else {
        console.warn(`⚠️ Element with id ${elementId} not found`);
    }
}

// Auto-refresh data every 5 minutes
function startAutoRefresh() {
    console.log('Starting auto-refresh (5 minutes interval)');
    setInterval(() => {
        console.log('Auto-refreshing data...');
        fetchGoldPrices();
        fetchCurrencyRates();
        fetchCryptoPrices();
    }, 5 * 60 * 1000); // 5 minutes
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('=== DOM Content Loaded ===');
    console.log('Chart.js available:', typeof Chart !== 'undefined');
    console.log('Gold chart canvas:', document.getElementById('goldChart'));

    // Initialize components
    initializeGoldChart();
    initializeGoldCalculator();
    initializeTabs();

    // Fetch initial data
    fetchGoldPrices();
    fetchCurrencyRates();
    fetchCryptoPrices();

    // Start auto-refresh
    startAutoRefresh();

    console.log('=== Application Initialized ===');
});

// Error handling for page load
window.addEventListener('error', function (e) {
    console.error('Global error:', e.error);
});

document.getElementById('theme-toggle').addEventListener('click', function () {
    document.body.classList.toggle('light');
});

// Add interactivity to vote options
document.querySelectorAll('.vote-option').forEach(option => {
    option.addEventListener('click', function () {
        // Remove selected class from all options
        document.querySelectorAll('.vote-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Add selected class to clicked option
        this.classList.add('selected');

        // Check the radio button
        const radio = this.querySelector('input[type="radio"]');
        radio.checked = true;
    });
});

// Handle vote submission
document.getElementById('submitVote').addEventListener('click', function () {
    const selectedOption = document.querySelector('input[name="voteOption"]:checked');

    if (!selectedOption) {
        alert('يرجى اختيار خيار قبل التصويت');
        return;
    }

    alert(`شكرًا لك! لقد قمت بالتصويت لـ "${selectedOption.value}"`);

    // Reset selection
    document.querySelectorAll('.vote-option').forEach(opt => {
        opt.classList.remove('selected');
    });
});

// Handle view results button
document.getElementById('viewResults').addEventListener('click', function () {
    alert('سيتم عرض نتائج التصويت الحالي هنا');
});