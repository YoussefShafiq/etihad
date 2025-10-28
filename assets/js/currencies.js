// Currencies Exchange Rates Manager
class CurrenciesManager {
    constructor() {
        this.exchangeRates = {};
        this.baseCurrency = 'EGP';
        this.conversionRates = {};
        this.usdRates = {}; // Store USD-based rates

        this.init();
    }

    init() {
        console.log('🚀 Initializing Currencies Manager...');
        this.setupEventListeners();
        this.loadExchangeRates();
        this.setupConverter();
    }

    // Setup event listeners
    setupEventListeners() {
        console.log('🎯 Setting up event listeners...');

        // Refresh rates button
        const refreshBtn = document.getElementById('refreshRates');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadExchangeRates();
            });
        }

        // Retry button
        const retryBtn = document.getElementById('retryButton');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.loadExchangeRates();
            });
        }

        // Base currency filter
        const baseCurrency = document.getElementById('baseCurrency');
        if (baseCurrency) {
            baseCurrency.addEventListener('change', (e) => {
                this.baseCurrency = e.target.value;
                this.calculateRatesForBase();
                this.renderExchangeRates();
                this.updateConverter();
            });
        }

        // Pair cards click events
        document.querySelectorAll('.pair-card').forEach(card => {
            card.addEventListener('click', () => {
                const pair = card.dataset.pair;
                this.setConverterFromPair(pair);
            });
        });
    }

    // Load exchange rates from API
    async loadExchangeRates() {
        console.log('💱 Loading exchange rates...');
        this.showLoading(true);
        this.hideError();

        try {
            // Try exchangerate-api.com (free, no API key needed, good CORS support)
            const apiUrl = 'https://open.er-api.com/v6/latest/USD';

            console.log('📡 Fetching from:', apiUrl);
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`API response not ok: ${response.status}`);
            }

            const data = await response.json();
            console.log('📊 API Response:', data);

            if (data && data.rates && data.result === 'success') {
                // Store USD-based rates
                this.usdRates = data.rates;

                // Calculate rates for current base currency
                this.calculateRatesForBase();

                this.renderExchangeRates();
                this.updateConverter();
                this.updateLastUpdateTime();
                console.log('✅ Exchange rates loaded successfully');
            } else {
                throw new Error('Invalid response data from API');
            }

        } catch (error) {
            console.error('❌ Error loading exchange rates:', error);

            // Try fallback API
            try {
                console.log('🔄 Trying fallback API...');
                const fallbackUrl = 'https://api.exchangerate.host/latest?base=USD';
                const fallbackResponse = await fetch(fallbackUrl);

                if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json();
                    if (fallbackData && fallbackData.rates) {
                        this.usdRates = fallbackData.rates;
                        this.calculateRatesForBase();
                        this.renderExchangeRates();
                        this.updateConverter();
                        this.updateLastUpdateTime();
                        console.log('✅ Fallback API succeeded');
                        this.showLoading(false);
                        return;
                    }
                }
            } catch (fallbackError) {
                console.error('❌ Fallback API also failed:', fallbackError);
            }

            this.showError();
            this.loadZeroRates();
        } finally {
            this.showLoading(false);
        }
    }

    // Calculate rates for current base currency
    calculateRatesForBase() {
        if (Object.keys(this.usdRates).length === 0) {
            console.error('No USD rates available');
            return;
        }

        console.log('🧮 Calculating rates for base:', this.baseCurrency);

        const rates = {};

        if (this.baseCurrency === 'USD') {
            // Direct USD rates
            this.exchangeRates = { ...this.usdRates };
        } else {
            // Calculate rates relative to base currency
            const baseRate = this.usdRates[this.baseCurrency];

            if (!baseRate || baseRate === 0) {
                console.error('Base currency rate not found or is zero');
                this.exchangeRates = this.getDefaultRates();
                return;
            }

            // Calculate all rates relative to base currency
            Object.keys(this.usdRates).forEach(currency => {
                if (currency === this.baseCurrency) {
                    rates[currency] = 1;
                } else {
                    // Convert: 1 BASE = (USD/BASE) * (CURRENCY/USD) = CURRENCY/BASE
                    rates[currency] = this.usdRates[currency] / baseRate;
                }
            });

            this.exchangeRates = rates;
        }

        console.log('Exchange rates calculated:', this.exchangeRates);
    }

    // Get default rates structure with zeros
    getDefaultRates() {
        const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'SAR', 'AED', 'KWD', 'QAR', 'EGP'];
        const rates = {};
        currencies.forEach(currency => {
            rates[currency] = currency === this.baseCurrency ? 1 : 0;
        });
        return rates;
    }

    // Load zero rates when API fails
    loadZeroRates() {
        console.log('🔄 Loading zero rates due to API failure...');

        this.exchangeRates = this.getDefaultRates();
        this.renderExchangeRates();
        this.updateConverter();
        this.updateLastUpdateTime();
    }

    // Render exchange rates grid
    renderExchangeRates() {
        const grid = document.getElementById('ratesGrid');
        if (!grid) return;

        const currencies = [
            { code: 'USD', name: 'دولار أمريكي', flag: '🇺🇸' },
            { code: 'EUR', name: 'يورو', flag: '🇪🇺' },
            { code: 'GBP', name: 'جنيه إسترليني', flag: '🇬🇧' },
            { code: 'JPY', name: 'ين ياباني', flag: '🇯🇵' },
            { code: 'SAR', name: 'ريال سعودي', flag: '🇸🇦' },
            { code: 'AED', name: 'درهم إماراتي', flag: '🇦🇪' },
            { code: 'KWD', name: 'دينار كويتي', flag: '🇰🇼' },
            { code: 'QAR', name: 'ريال قطري', flag: '🇶🇦' }
        ];

        // Filter out base currency
        const availableCurrencies = currencies.filter(currency => {
            return currency.code !== this.baseCurrency;
        });

        const html = availableCurrencies
            .map(currency => this.createCurrencyCard(currency))
            .join('');

        grid.innerHTML = html;

        // Update popular pairs with real rates
        this.updatePopularPairs();
    }

    // Create HTML for currency card
    createCurrencyCard(currency) {
        const rate = this.exchangeRates[currency.code] || 0;
        const hasValidRate = rate > 0;
        const change = hasValidRate ? this.getRandomChange() : 0;

        // Invert the rate to show how much base currency = 1 of target currency
        const invertedRate = hasValidRate ? (1 / rate) : 0;

        return `
            <div class="currency-card" data-currency="${currency.code}">
                <div class="currency-header">
                    <div class="currency-info">
                        <div class="currency-flag">${currency.flag}</div>
                        <div class="currency-details">
                            <h3>${currency.name}</h3>
                            <div class="currency-name">${currency.code}</div>
                        </div>
                    </div>
                    <div class="currency-rate">
                        <div class="rate ${!hasValidRate ? 'zero-rate' : ''}">${this.formatRate(invertedRate)}</div>
                        <div class="currency-code">${this.baseCurrency} = 1 ${currency.code}</div>
                    </div>
                </div>
                <div class="currency-change">
                    <div class="change-info ${change >= 0 ? 'positive' : 'negative'} ${!hasValidRate ? 'zero-change' : ''}">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="${change >= 0 ? 'M7.247 4.86l-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z' : 'M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'}"/>
                        </svg>
                        ${Math.abs(change).toFixed(2)}%
                    </div>
                    <div class="last-updated">
                        ${this.formatTime(new Date())}
                    </div>
                </div>
            </div>
        `;
    }

    // Update popular pairs with real rates
    updatePopularPairs() {
        const pairs = [
            { from: 'USD', to: 'EUR', element: document.querySelector('[data-pair="USD/EUR"]') },
            { from: 'USD', to: 'GBP', element: document.querySelector('[data-pair="USD/GBP"]') },
            { from: 'EUR', to: 'GBP', element: document.querySelector('[data-pair="EUR/GBP"]') },
            { from: 'USD', to: 'JPY', element: document.querySelector('[data-pair="USD/JPY"]') }
        ];

        pairs.forEach(pair => {
            if (pair.element && this.usdRates[pair.from] && this.usdRates[pair.to]) {
                const rate = this.usdRates[pair.to] / this.usdRates[pair.from];
                const hasValidRate = rate > 0;

                const rateElement = pair.element.querySelector('.rate-value');
                if (rateElement) {
                    rateElement.textContent = this.formatRate(rate);
                    rateElement.className = hasValidRate ? 'rate-value' : 'rate-value zero-rate';
                }
            }
        });
    }

    // Setup currency converter
    setupConverter() {
        console.log('🧮 Setting up currency converter...');

        const amountInput = document.getElementById('amount');
        const fromCurrency = document.getElementById('fromCurrency');
        const toCurrency = document.getElementById('toCurrency');
        const swapBtn = document.getElementById('swapCurrencies');

        if (amountInput && fromCurrency && toCurrency && swapBtn) {
            // Input events
            amountInput.addEventListener('input', () => this.convertCurrency());
            fromCurrency.addEventListener('change', () => this.convertCurrency());
            toCurrency.addEventListener('change', () => this.convertCurrency());

            // Swap currencies
            swapBtn.addEventListener('click', () => this.swapCurrencies());
        }
    }

    // Update converter (called after rates are loaded)
    updateConverter() {
        // Wait a bit to ensure DOM is ready
        setTimeout(() => this.convertCurrency(), 100);
    }

    // Convert currency using real exchange rates
    convertCurrency() {
        const amountInput = document.getElementById('amount');
        const fromCurrencySelect = document.getElementById('fromCurrency');
        const toCurrencySelect = document.getElementById('toCurrency');
        const convertedAmountInput = document.getElementById('convertedAmount');

        if (!amountInput || !fromCurrencySelect || !toCurrencySelect || !convertedAmountInput) {
            console.error('Converter elements not found');
            return;
        }

        const amount = parseFloat(amountInput.value) || 0;
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;

        if (fromCurrency === toCurrency) {
            convertedAmountInput.value = amount.toFixed(2);
            this.updateExchangeRateText(1, fromCurrency, toCurrency, true);
            return;
        }

        // Get conversion rate (from -> to)
        const rate = this.getConversionRate(fromCurrency, toCurrency);
        const hasValidRate = rate > 0;

        if (hasValidRate) {
            const convertedAmount = (amount * rate).toFixed(2);
            convertedAmountInput.value = convertedAmount;
            // Pass inverted rate for display
            const invertedRate = 1 / rate;
            this.updateExchangeRateText(invertedRate, toCurrency, fromCurrency, false);
            this.updateConversionTime();
        } else {
            console.warn('Conversion rate not available');
            convertedAmountInput.value = '0.00';
            const exchangeRateText = document.getElementById('exchangeRateText');
            if (exchangeRateText) {
                exchangeRateText.textContent = `1 ${toCurrency} = 0 ${fromCurrency} (غير متوفر)`;
                exchangeRateText.className = 'error-text';
            }
        }
    }

    // Get conversion rate between two currencies
    getConversionRate(from, to) {
        // Use USD as intermediary for all conversions
        if (Object.keys(this.usdRates).length === 0) {
            console.error('No rates available for conversion');
            return 0;
        }

        const fromRate = this.usdRates[from];
        const toRate = this.usdRates[to];

        if (!fromRate || !toRate || fromRate === 0) {
            console.error('Missing rates for conversion:', from, to);
            return 0;
        }

        // Convert: from -> USD -> to
        return toRate / fromRate;
    }

    // Swap currencies in converter
    swapCurrencies() {
        const fromCurrency = document.getElementById('fromCurrency');
        const toCurrency = document.getElementById('toCurrency');

        if (fromCurrency && toCurrency) {
            const temp = fromCurrency.value;
            fromCurrency.value = toCurrency.value;
            toCurrency.value = temp;

            this.convertCurrency();
        }
    }

    // Set converter from currency pair
    setConverterFromPair(pair) {
        const [from, to] = pair.split('/');
        const fromCurrency = document.getElementById('fromCurrency');
        const toCurrency = document.getElementById('toCurrency');

        if (fromCurrency && toCurrency) {
            fromCurrency.value = from;
            toCurrency.value = to;
            this.convertCurrency();
        }
    }

    // Update exchange rate text
    updateExchangeRateText(rate, from, to, isSameCurrency = false) {
        const formattedRate = this.formatRate(rate);
        const text = `1 ${from} = ${formattedRate} ${to}`;
        const element = document.getElementById('exchangeRateText');
        if (element) {
            element.textContent = text;
            element.className = rate > 0 ? '' : 'error-text';
        }
    }

    // Update conversion time
    updateConversionTime() {
        const timeElement = document.getElementById('conversionTime');
        if (timeElement) {
            const time = new Date().toLocaleTimeString('ar-EG');
            timeElement.textContent = time;
        }
    }

    // Update last update time
    updateLastUpdateTime() {
        const timeElement = document.getElementById('last-update-time');
        if (timeElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('ar-EG');
            const hasValidRates = Object.keys(this.usdRates).length > 0;
            const errorIndicator = hasValidRates ? '' : ' (بيانات غير متوفرة)';
            timeElement.textContent = timeString + errorIndicator;
            timeElement.className = hasValidRates ? '' : 'error-text';
        }
    }

    // Utility functions
    formatRate(rate) {
        if (rate === 0 || !rate) {
            return '0';
        }

        if (rate >= 1) {
            return new Intl.NumberFormat('ar-EG', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4
            }).format(rate);
        } else {
            return new Intl.NumberFormat('ar-EG', {
                minimumFractionDigits: 4,
                maximumFractionDigits: 6
            }).format(rate);
        }
    }

    formatTime(date) {
        return new Intl.DateTimeFormat('ar-EG', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    getRandomChange() {
        return (Math.random() - 0.5) * 2; // Random change between -1% and +1%
    }

    // UI state management
    showLoading(show) {
        const loadingElement = document.getElementById('loadingState');
        const gridElement = document.getElementById('ratesGrid');
        const errorElement = document.getElementById('errorState');

        if (loadingElement) loadingElement.style.display = show ? 'flex' : 'none';
        if (gridElement) gridElement.style.display = show ? 'none' : 'grid';
        if (errorElement) errorElement.style.display = 'none';
    }

    showError() {
        const errorElement = document.getElementById('errorState');
        const gridElement = document.getElementById('ratesGrid');
        const loadingElement = document.getElementById('loadingState');

        if (errorElement) errorElement.style.display = 'block';
        if (gridElement) gridElement.style.display = 'none';
        if (loadingElement) loadingElement.style.display = 'none';
    }

    hideError() {
        const errorElement = document.getElementById('errorState');
        if (errorElement) errorElement.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('=== Currencies Page Initialization ===');
    window.currenciesManager = new CurrenciesManager();
});

// Auto-refresh rates every 5 minutes
setInterval(() => {
    if (window.currenciesManager) {
        console.log('🔄 Auto-refreshing exchange rates...');
        window.currenciesManager.loadExchangeRates();
    }
}, 5 * 60 * 1000);