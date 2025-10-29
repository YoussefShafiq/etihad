// Crypto Page JavaScript
document.addEventListener('DOMContentLoaded', function () {
    console.log('=== Crypto Page Initialized ===');

    // Initialize all components
    initializeCryptoData();
    initializeConverter();
    initializeMarketData();
    setupEventListeners();

    // Auto-refresh every 2 minutes
    setInterval(() => {
        console.log('Auto-refreshing crypto data...');
        fetchCryptoData();
        fetchMarketData();
    }, 2 * 60 * 1000);
});

// Crypto Data Management
let cryptoData = {};
let marketData = {};
let exchangeRates = {};

// Initialize Crypto Data
async function initializeCryptoData() {
    console.log('Initializing crypto data...');
    showLoading(true);
    hideError();

    try {
        await fetchCryptoData();
        showLoading(false);
    } catch (error) {
        console.error('Error initializing crypto data:', error);
        showLoading(false);
        showError('حدث خطأ في تحميل بيانات العملات الرقمية. يرجى المحاولة مرة أخرى.');
    }
}

// Fetch Crypto Data from API
async function fetchCryptoData() {
    console.log('Fetching crypto data...');

    try {
        // Using CoinGecko API (free tier)
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,litecoin,cardano,polkadot,bitcoin-cash,chainlink&vs_currencies=usd&include_24hr_change=true&include_market_cap=true');

        if (!response.ok) {
            throw new Error('API response not ok');
        }

        const data = await response.json();
        console.log('✅ Crypto data fetched successfully:', data);

        cryptoData = data;
        updateCryptoDisplay(data);
        updateExchangeRates(data);
        updateLastUpdateTime();

    } catch (error) {
        console.error('❌ Error fetching crypto data:', error);
        showError('لم نتمكن من جلب بيانات العملات الرقمية. يرجى المحاولة مرة أخرى.');
        // Fallback to static data if API fails
        useFallbackCryptoData();
    }
}

// Update Exchange Rates from Crypto Data
function updateExchangeRates(data) {
    console.log('Updating exchange rates...');

    // Reset exchange rates
    exchangeRates = {
        'usd': 1
    };

    // Add crypto to USD rates
    Object.keys(data).forEach(cryptoId => {
        if (data[cryptoId].usd) {
            exchangeRates[cryptoId] = data[cryptoId].usd;
        }
    });

    // Add USD to crypto rates (inverse)
    Object.keys(data).forEach(cryptoId => {
        if (data[cryptoId].usd) {
            exchangeRates[`usd_to_${cryptoId}`] = 1 / data[cryptoId].usd;
        }
    });

    // Add crypto to crypto rates
    Object.keys(data).forEach(fromCrypto => {
        Object.keys(data).forEach(toCrypto => {
            if (fromCrypto !== toCrypto && data[fromCrypto].usd && data[toCrypto].usd) {
                const rate = data[fromCrypto].usd / data[toCrypto].usd;
                exchangeRates[`${fromCrypto}_to_${toCrypto}`] = rate;
                exchangeRates[`${toCrypto}_to_${fromCrypto}`] = 1 / rate;
            }
        });
    });

    console.log('✅ Exchange rates updated:', exchangeRates);

    // Recalculate conversion with new rates
    calculateConversion();
}

// Update Crypto Display
function updateCryptoDisplay(data) {
    console.log('Updating crypto display...');

    const cryptoGrid = document.getElementById('cryptoGrid');
    if (!cryptoGrid) return;

    cryptoGrid.innerHTML = '';

    const cryptos = [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', class: 'bitcoin' },
        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', class: 'ethereum' },
        { id: 'ripple', name: 'Ripple', symbol: 'XRP', class: 'ripple' },
        { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', class: 'litecoin' },
        { id: 'cardano', name: 'Cardano', symbol: 'ADA', class: 'cardano' },
        { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', class: 'polkadot' },
        { id: 'bitcoin-cash', name: 'Bitcoin Cash', symbol: 'BCH', class: 'bitcoin-cash' },
        { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', class: 'chainlink' }
    ];

    cryptos.forEach(crypto => {
        if (data[crypto.id]) {
            const cryptoInfo = data[crypto.id];
            const cryptoCard = createCryptoCard(crypto, cryptoInfo);
            cryptoGrid.appendChild(cryptoCard);
        }
    });

    console.log('✅ Crypto display updated successfully');
}

// Create Crypto Card Element
function createCryptoCard(crypto, cryptoInfo) {
    const card = document.createElement('div');
    card.className = `crypto-card ${crypto.class}`;

    const price = cryptoInfo.usd?.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: cryptoInfo.usd < 1 ? 6 : 2
    }) || '0';

    const change = cryptoInfo.usd_24h_change?.toFixed(2) || '0';
    const marketCap = cryptoInfo.usd_market_cap ? formatMarketCap(cryptoInfo.usd_market_cap) : '--';

    const changeClass = change >= 0 ? 'positive' : 'negative';
    const changeSymbol = change >= 0 ? '+' : '';

    card.innerHTML = `
        <div class="crypto-header">
            <div class="crypto-info">
                <div class="crypto-icon ${crypto.class}">
                    ${getCryptoIcon(crypto.symbol)}
                </div>
                <div class="crypto-details">
                    <h3>${crypto.name}</h3>
                    <div class="crypto-symbol">${crypto.symbol}</div>
                </div>
            </div>
            <div class="crypto-price">
                <div class="price">$${price}</div>
                <div class="currency">USD</div>
            </div>
        </div>
        <div class="crypto-change">
            <div class="change-info ${changeClass}">
                <span>${changeSymbol}${change}%</span>
            </div>
            <div class="market-cap">${marketCap}</div>
        </div>
    `;

    // Add click event to show more details
    card.addEventListener('click', () => {
        showCryptoDetails(crypto, cryptoInfo);
    });

    return card;
}

// Get Crypto Icon (using text as fallback)
function getCryptoIcon(symbol) {
    const icons = {
        'BTC': '₿',
        'ETH': 'Ξ',
        'XRP': 'X',
        'LTC': 'Ł',
        'ADA': 'A',
        'DOT': '●',
        'BCH': 'B',
        'LINK': 'L'
    };

    return icons[symbol] || symbol.charAt(0);
}

// Format Market Cap
function formatMarketCap(marketCap) {
    if (marketCap >= 1e12) {
        return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
        return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
        return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else {
        return `$${marketCap.toLocaleString()}`;
    }
}

// Crypto Converter Functions
function initializeConverter() {
    console.log('Initializing crypto converter...');

    const amountInput = document.getElementById('amount');
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    const convertedAmount = document.getElementById('convertedAmount');
    const swapButton = document.getElementById('swapCurrencies');

    // Add event listeners
    amountInput.addEventListener('input', calculateConversion);
    fromCurrency.addEventListener('change', calculateConversion);
    toCurrency.addEventListener('change', calculateConversion);

    swapButton.addEventListener('click', swapCurrencies);

    // Initial calculation will happen after data loads
}

// Calculate Conversion using real API data
function calculateConversion() {
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;

    // Get conversion rate from API data
    const conversionRate = getConversionRate(fromCurrency, toCurrency);

    if (conversionRate === null) {
        document.getElementById('convertedAmount').value = '--';
        document.getElementById('exchangeRateText').textContent = 'جاري تحميل البيانات...';
        return;
    }

    const convertedAmount = amount * conversionRate;

    // Format the result based on the currency type
    const decimalPlaces = toCurrency === 'usd' ? 2 : 8;
    document.getElementById('convertedAmount').value = convertedAmount.toFixed(decimalPlaces);

    // Format the exchange rate display
    const rateDecimalPlaces = conversionRate < 0.01 ? 8 : conversionRate < 1 ? 6 : 4;
    document.getElementById('exchangeRateText').textContent =
        `1 ${getCurrencyName(fromCurrency)} = ${conversionRate.toFixed(rateDecimalPlaces)} ${getCurrencyName(toCurrency)}`;

    updateConversionTime();
}

// Get Conversion Rate from API data
function getConversionRate(from, to) {
    // If same currency
    if (from === to) return 1;

    // Direct rates from API data
    if (exchangeRates[`${from}_to_${to}`]) {
        return exchangeRates[`${from}_to_${to}`];
    }

    // Convert through USD if direct rate not available
    if (exchangeRates[from] && exchangeRates[`usd_to_${to}`]) {
        return exchangeRates[from] * exchangeRates[`usd_to_${to}`];
    }

    // If from is USD and to is crypto
    if (from === 'usd' && exchangeRates[`usd_to_${to}`]) {
        return exchangeRates[`usd_to_${to}`];
    }

    // If to is USD and from is crypto
    if (to === 'usd' && exchangeRates[from]) {
        return exchangeRates[from];
    }

    // Rate not available
    console.warn(`Conversion rate not available: ${from} to ${to}`);
    return null;
}

// Get Currency Name
function getCurrencyName(currency) {
    const names = {
        'bitcoin': 'BTC',
        'ethereum': 'ETH',
        'ripple': 'XRP',
        'litecoin': 'LTC',
        'cardano': 'ADA',
        'polkadot': 'DOT',
        'bitcoin-cash': 'BCH',
        'chainlink': 'LINK',
        'usd': 'USD'
    };

    return names[currency] || currency.toUpperCase();
}

// Swap Currencies
function swapCurrencies() {
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');

    const tempValue = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = tempValue;

    calculateConversion();
}

// Market Data Functions
async function initializeMarketData() {
    console.log('Initializing market data...');
    await fetchMarketData();
}

// Fetch Market Data
async function fetchMarketData() {
    console.log('Fetching market data...');

    try {
        // Using CoinGecko API for global market data
        const response = await fetch('https://api.coingecko.com/api/v3/global');

        if (!response.ok) {
            throw new Error('API response not ok');
        }

        const data = await response.json();
        console.log('✅ Market data fetched successfully:', data);

        marketData = data;
        updateMarketDisplay(data);

    } catch (error) {
        console.error('❌ Error fetching market data:', error);
        // Fallback to static market data
        useFallbackMarketData();
    }
}

// Update Market Display
function updateMarketDisplay(data) {
    console.log('Updating market display...');

    if (data.data) {
        const marketCap = data.data.total_market_cap?.usd || 0;
        const volume24h = data.data.total_volume?.usd || 0;
        const btcDominance = data.data.market_cap_percentage?.btc || 0;

        updateElementText('marketCap', formatMarketCap(marketCap));
        updateElementText('volume24h', formatMarketCap(volume24h));
        updateElementText('btcDominance', `${btcDominance.toFixed(1)}%`);
    }
}

// Fallback Data Functions
function useFallbackCryptoData() {
    console.log('Using fallback crypto data...');

    const fallbackData = {
        bitcoin: { usd: 0, usd_24h_change: 0, usd_market_cap: 0 },
        ethereum: { usd: 0, usd_24h_change: 0, usd_market_cap: 0 },
        ripple: { usd: 0, usd_24h_change: 0, usd_market_cap: 0 },
        litecoin: { usd: 0, usd_24h_change: 0, usd_market_cap: 0 },
        cardano: { usd: 0, usd_24h_change: 0, usd_market_cap: 0 },
        polkadot: { usd: 0, usd_24h_change: 0, usd_market_cap: 0 },
        'bitcoin-cash': { usd: 0, usd_24h_change: 0, usd_market_cap: 0 },
        chainlink: { usd: 0, usd_24h_change: 0, usd_market_cap: 0 }
    };

    updateCryptoDisplay(fallbackData);
    updateExchangeRates(fallbackData);
    updateLastUpdateTime();
}

function useFallbackMarketData() {
    console.log('Using fallback market data...');

    updateElementText('marketCap', '$1.72T');
    updateElementText('volume24h', '$48.5B');
    updateElementText('btcDominance', '52.3%');
}

// UI Helper Functions
function showLoading(show) {
    const loadingElement = document.getElementById('loadingState');
    const cryptoGrid = document.getElementById('cryptoGrid');

    if (loadingElement && cryptoGrid) {
        loadingElement.style.display = show ? 'flex' : 'none';
        cryptoGrid.style.display = show ? 'none' : 'grid';
    }
}

function showError(message) {
    const errorElement = document.getElementById('errorState');
    const errorText = document.getElementById('errorState')?.querySelector('p');

    if (errorElement && errorText) {
        errorText.textContent = message;
        errorElement.style.display = 'block';
    }
}

function hideError() {
    const errorElement = document.getElementById('errorState');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ar-EG');

    updateElementText('last-update-time', timeString);
}

function updateConversionTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ar-EG');

    updateElementText('conversionTime', timeString);
}

function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

// Event Listeners
function setupEventListeners() {
    // Retry button
    const retryButton = document.getElementById('retryButton');
    if (retryButton) {
        retryButton.addEventListener('click', () => {
            hideError();
            initializeCryptoData();
        });
    }

    // Refresh market button
    const refreshMarket = document.getElementById('refreshMarket');
    if (refreshMarket) {
        refreshMarket.addEventListener('click', () => {
            fetchMarketData();
            fetchCryptoData();
        });
    }

    // Real-time conversion updates
    const amountInput = document.getElementById('amount');
    if (amountInput) {
        amountInput.addEventListener('input', debounce(calculateConversion, 300));
    }
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Crypto Details Modal (placeholder function)
function showCryptoDetails(crypto, cryptoInfo) {
    console.log(`Showing details for ${crypto.name}`, cryptoInfo);

    const price = cryptoInfo.usd?.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: cryptoInfo.usd < 1 ? 6 : 2
    }) || '0';

    const change = cryptoInfo.usd_24h_change?.toFixed(2) || '0';
    const changeSymbol = change >= 0 ? '+' : '';

    alert(`تفاصيل ${crypto.name} (${crypto.symbol}):\n\n` +
        `💰 السعر الحالي: $${price}\n` +
        `📈 التغيير (24h): ${changeSymbol}${change}%\n` +
        `🏦 القيمة السوقية: ${formatMarketCap(cryptoInfo.usd_market_cap || 0)}`);
}

console.log('✅ Crypto page JavaScript loaded successfully');